import { Module } from '@nestjs/common';
import { HealthController } from './health.controller.js';
import { VotingController } from './voting.controller.js';
import { VotingGateway } from './voting.gateway.js';
import { VotingService } from './voting.service.js';

@Module({
  controllers: [HealthController, VotingController],
  providers: [VotingService, VotingGateway],
})
export class VotingModule {}
