import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import { io, type Socket } from 'socket.io-client';
import request from 'supertest';
import type { AddressInfo } from 'node:net';
import { AppModule } from '../src/app.module.js';
import { configureApplication } from '../src/config.js';
import type { PollSnapshot, VoteError } from '../src/voting/voting.types.js';

function nextEvent<T>(socket: Socket, event: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      socket.off(event, listener);
      reject(new Error(`Timed out waiting for ${event}`));
    }, 3000);
    function listener(payload: T) {
      clearTimeout(timer);
      socket.off(event, listener);
      resolve(payload);
    }
    socket.on(event, listener);
  });
}

describe('HTTP reset and Socket.IO voting on a real Nest server', () => {
  let app: INestApplication | undefined;
  let url: string;
  let clients: Socket[];

  async function start() {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    configureApplication(app);
    await app.listen(0, '127.0.0.1');
    const address = app.getHttpServer().address() as AddressInfo;
    url = `http://127.0.0.1:${address.port}`;
  }

  async function stop() {
    for (const client of clients) {
      client.removeAllListeners();
      client.disconnect();
      expect(client.connected).toBe(false);
      expect(client.listeners('vote:results')).toHaveLength(0);
    }
    clients = [];
    await app?.close();
    app = undefined;
  }

  beforeEach(async () => {
    clients = [];
    await start();
  });
  afterEach(stop);

  async function connect(transport: 'websocket' | 'polling' = 'websocket') {
    const socket = io(url, {
      autoConnect: false,
      forceNew: true,
      reconnection: false,
      transports: [transport],
    });
    clients.push(socket);
    const initial = nextEvent<PollSnapshot>(socket, 'vote:results');
    socket.connect();
    return { socket, poll: await initial };
  }

  async function vote(sender: Socket, peer: Socket, optionId: string) {
    const own = nextEvent<PollSnapshot>(sender, 'vote:results');
    const other = nextEvent<PollSnapshot>(peer, 'vote:results');
    sender.emit('vote:cast', { optionId });
    const poll = await own;
    expect(await other).toEqual(poll);
    return poll;
  }

  it('sends initial socket snapshots, exposes health and has no HTTP poll fetch', async () => {
    const first = await connect('polling');
    const second = await connect();
    expect(first.poll).toEqual(second.poll);
    expect(first.poll.total).toBe(0);
    expect(Object.keys(first.poll).sort()).toEqual([
      'options',
      'question',
      'total',
    ]);
    await request(url).get('/health').expect(200, { status: 'ok' });
    await request(url).get('/api/poll').expect(404);
  });

  it('broadcasts repeated votes from the same connection and current state on reconnect', async () => {
    const first = await connect();
    const second = await connect('polling');
    expect((await vote(first.socket, second.socket, 'react')).total).toBe(1);
    expect(
      (await vote(first.socket, second.socket, 'react')).options[0].votes,
    ).toBe(2);
    const poll = await vote(second.socket, first.socket, 'vue');
    expect(poll.total).toBe(3);
    expect(poll.options[0].percentage).toBeCloseTo(200 / 3);
    first.socket.disconnect();
    const reconnected = await connect();
    expect(reconnected.poll).toEqual(poll);
    expect(
      (await vote(reconnected.socket, second.socket, 'angular')).total,
    ).toBe(4);
  });

  it('rejects invalid input only to its sender without mutation or a results broadcast', async () => {
    const first = await connect();
    const second = await connect();
    const broadcasts: PollSnapshot[] = [];
    const peerErrors: VoteError[] = [];
    second.socket.on('vote:results', (poll: PollSnapshot) =>
      broadcasts.push(poll),
    );
    second.socket.on('vote:error', (error: VoteError) =>
      peerErrors.push(error),
    );
    for (const payload of [
      null,
      {},
      { optionId: 'svelte' },
      { optionId: 'react', extra: true },
    ]) {
      const rejected = nextEvent<VoteError>(first.socket, 'vote:error');
      first.socket.emit('vote:cast', payload);
      expect(await rejected).toEqual({ message: 'Choose a valid option.' });
    }
    // The following broadcast is a barrier for prior packets to the peer.
    expect((await vote(first.socket, second.socket, 'react')).total).toBe(1);
    expect(broadcasts.map((poll) => poll.total)).toEqual([1]);
    expect(peerErrors).toEqual([]);
  });

  it('broadcasts HTTP reset to both clients even when counts are already zero', async () => {
    const first = await connect();
    const second = await connect('polling');
    await vote(first.socket, second.socket, 'react');
    await vote(second.socket, first.socket, 'vue');
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const own = nextEvent<PollSnapshot>(first.socket, 'poll:reset');
      const peer = nextEvent<PollSnapshot>(second.socket, 'poll:reset');
      await request(url).post('/api/poll/reset').expect(204);
      expect(await own).toEqual(first.poll);
      expect(await peer).toEqual(first.poll);
    }
    expect((await vote(first.socket, second.socket, 'angular')).total).toBe(1);
  });

  it('does not accept the former client-to-server socket reset event', async () => {
    const first = await connect();
    const second = await connect();
    await vote(first.socket, second.socket, 'react');
    const resets: PollSnapshot[] = [];
    first.socket.on('poll:reset', (poll: PollSnapshot) => resets.push(poll));
    first.socket.emit('poll:reset');
    // A later vote is a packet barrier for the removed event from this sender.
    expect((await vote(first.socket, second.socket, 'vue')).total).toBe(2);
    expect(resets).toEqual([]);
  });

  it('starts empty after a server restart and closes owned clients and servers', async () => {
    const first = await connect();
    const second = await connect();
    await vote(first.socket, second.socket, 'react');
    const server = app!.getHttpServer();
    await stop();
    expect(server.listening).toBe(false);
    await start();
    expect((await connect()).poll.total).toBe(0);
  });
});
