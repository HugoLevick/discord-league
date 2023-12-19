import {
  Controller,
  Get,
  OnModuleInit,
  Param,
  ParseIntPipe,
  Put,
} from '@nestjs/common';
import { DiscordBotService } from './discord-bot.service';
import { Auth } from 'src/auth/decorators/auth.decorator';

@Controller('bot')
export class DiscordBotController implements OnModuleInit {
  constructor(private readonly discordBotService: DiscordBotService) {}

  onModuleInit() {
    this.discordBotService.startBot();
  }

  @Auth()
  @Get('signups')
  getSignups() {
    return this.discordBotService.getSignUps();
  }

  @Auth()
  @Put('signups/:id/:newTier')
  updateSignup(
    @Param('id') id: string,
    @Param('newTier', ParseIntPipe) newTier: number,
  ) {
    return this.discordBotService.updateTier(id, newTier);
  }
}
