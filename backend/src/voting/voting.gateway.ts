import { Inject } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  type OnGatewayConnection,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { frontendUrl } from '../config.js';
import { VotingService } from './voting.service.js';
import type {
  ClientToServerEvents,
  PollSnapshot,
  ServerToClientEvents,
} from './voting.types.js';

type VotingSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

@WebSocketGateway({ cors: { origin: frontendUrl } })
export class VotingGateway implements OnGatewayConnection {
  @WebSocketServer()
  private server: Server<ClientToServerEvents, ServerToClientEvents>;

  constructor(@Inject(VotingService) private readonly voting: VotingService) {}

  handleConnection(client: VotingSocket): void {
    client.emit('vote:results', this.voting.snapshot());
  }

  @SubscribeMessage('vote:cast')
  cast(
    @ConnectedSocket() client: VotingSocket,
    @MessageBody() payload: unknown,
  ): void {
    const result = this.voting.cast(payload);
    if ('message' in result) client.emit('vote:error', result);
    else this.server.emit('vote:results', result);
  }

  broadcastReset(snapshot: PollSnapshot): void {
    // A dedicated event clears selections even when counts are already zero.
    this.server.emit('poll:reset', snapshot);
  }
}
