import { Controller, OnModuleInit } from '@nestjs/common';
import { DiscordBotService } from './discord-bot.service';

@Controller()
export class DiscordBotController implements OnModuleInit {
  constructor(private readonly discordBotService: DiscordBotService) {}

  onModuleInit() {
    this.discordBotService.startBot();
  }
}
