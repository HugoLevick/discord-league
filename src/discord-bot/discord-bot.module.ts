import { Module } from '@nestjs/common';
import { DiscordBotService } from './discord-bot.service';
import { DiscordBotController } from './discord-bot.controller';
import { ConfigModule } from '@nestjs/config';
import { PlayerModule } from 'src/player/player.module';

@Module({
  imports: [ConfigModule.forRoot({}), PlayerModule],
  controllers: [DiscordBotController],
  providers: [DiscordBotService],
})
export class DiscordBotModule {}
