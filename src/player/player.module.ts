import { Module } from '@nestjs/common';
import { PlayerService } from './player.service';
import { PlayerController } from './player.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Player } from './entities/player.entity';
import { PlayerStats } from './entities/player-stats.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Player, PlayerStats])],
  controllers: [PlayerController],
  providers: [PlayerService],
  exports: [PlayerService, TypeOrmModule],
})
export class PlayerModule {}
