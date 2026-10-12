import { Module } from '@nestjs/common';
import { VotingModule } from './voting/voting.module.js';

@Module({
  imports: [VotingModule],
})
export class AppModule {}
