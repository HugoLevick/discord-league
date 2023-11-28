import { Module } from '@nestjs/common';
import { DiscordBotService } from './discord-bot.service';
import { DiscordBotController } from './discord-bot.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({})],
  controllers: [DiscordBotController],
  providers: [DiscordBotService],
})
export class DiscordBotModule {}
