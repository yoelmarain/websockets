import { VotingService } from './voting.service.js';

describe('VotingService', () => {
  let service: VotingService;
  beforeEach(() => {
    service = new VotingService();
  });

  it('starts with three choices and zero counts and percentages', () => {
    const poll = service.snapshot();
    expect(poll.options.map(({ id }) => id)).toEqual([
      'react',
      'angular',
      'vue',
    ]);
    expect(poll.total).toBe(0);
    expect(
      poll.options.every(
        (option) => option.votes === 0 && option.percentage === 0,
      ),
    ).toBe(true);
  });

  it('accepts repeated votes and calculates percentages', () => {
    service.cast({ optionId: 'react' });
    service.cast({ optionId: 'react' });
    const poll = service.cast({ optionId: 'vue' });
    expect(poll).toEqual(service.snapshot());
    expect(service.snapshot().total).toBe(3);
    expect(service.snapshot().options[0].percentage).toBeCloseTo(200 / 3);
    expect(service.snapshot().options[2].percentage).toBeCloseTo(100 / 3);
  });

  it.each([
    undefined,
    null,
    [],
    'react',
    1,
    true,
    {},
    { optionId: 'invalid' },
    { optionId: null },
    { optionId: 1 },
    { optionId: 'react', extra: true },
    { optionId: ['react'] },
    Object.create({ optionId: 'react' }),
  ])('rejects malformed payload %j without changing counts', (payload) => {
    service.cast({ optionId: 'angular' });
    const before = service.snapshot();
    expect(service.cast(payload)).toEqual({
      message: 'Choose a valid option.',
    });
    expect(service.snapshot()).toEqual(before);
  });

  it('resets counts and percentages, including an already empty poll', () => {
    const empty = service.snapshot();
    service.cast({ optionId: 'angular' });
    service.cast({ optionId: 'vue' });
    expect(service.reset()).toEqual(empty);
    expect(service.reset()).toEqual(empty);
    expect(service.cast({ optionId: 'react' })).toMatchObject({ total: 1 });
  });

  it('returns independent snapshots and new services start empty', () => {
    const snapshot = service.snapshot();
    snapshot.options[0].votes = 20;
    service.cast({ optionId: 'react' });
    expect(service.snapshot().options[0].votes).toBe(1);
    expect(new VotingService().snapshot().total).toBe(0);
  });
});
