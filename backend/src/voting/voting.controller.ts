import { Controller, HttpCode, Inject, Post } from '@nestjs/common';
import { VotingGateway } from './voting.gateway.js';
import { VotingService } from './voting.service.js';

@Controller('api/poll')
export class VotingController {
  constructor(
    @Inject(VotingService) private readonly voting: VotingService,
    @Inject(VotingGateway) private readonly gateway: VotingGateway,
  ) {}

  @Post('reset')
  @HttpCode(204)
  reset(): void {
    const snapshot = this.voting.reset();
    this.gateway.broadcastReset(snapshot);
  }
}
