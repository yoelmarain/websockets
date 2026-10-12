import { Injectable } from '@nestjs/common';
import type { OptionId, PollSnapshot, VoteError } from './voting.types.js';

const options = [
  { id: 'react', label: 'React' },
  { id: 'angular', label: 'Angular' },
  { id: 'vue', label: 'Vue' },
] as const;

@Injectable()
export class VotingService {
  private votes: Record<OptionId, number> = { react: 0, angular: 0, vue: 0 };

  snapshot(): PollSnapshot {
    const total = this.votes.react + this.votes.angular + this.votes.vue;
    return {
      question: '¿Cuál es tu tecnología frontend favorita?',
      options: options.map((option) => ({
        ...option,
        votes: this.votes[option.id],
        percentage: total === 0 ? 0 : (this.votes[option.id] / total) * 100,
      })),
      total,
    };
  }

  cast(payload: unknown): PollSnapshot | VoteError {
    if (
      typeof payload !== 'object' ||
      payload === null ||
      Array.isArray(payload) ||
      Object.keys(payload).length !== 1 ||
      !Object.hasOwn(payload, 'optionId') ||
      !options.some(
        (option) => option.id === (payload as { optionId: unknown }).optionId,
      )
    ) {
      return { message: 'Choose a valid option.' };
    }
    const optionId = (payload as { optionId: OptionId }).optionId;
    this.votes[optionId] += 1;
    return this.snapshot();
  }

  reset(): PollSnapshot {
    this.votes = { react: 0, angular: 0, vue: 0 };
    return this.snapshot();
  }
}
