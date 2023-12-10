import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Post,
  Query,
  ValidationPipe,
  forwardRef,
} from '@nestjs/common';
import { PlayerService } from './player.service';
import { UploadStatsDto } from './dto/upload-stats.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';

@Controller('players')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @Auth()
  @Get('search/:search')
  searchPlayers(@Param('search') search: string) {
    return this.playerService.searchPlayers(search);
  }

  @Auth()
  @Get('stats/:id')
  getStats(
    @Param('id', ValidationPipe) discordId: string,
    @Query('all', ParseBoolPipe) all: boolean,
  ) {
    return this.playerService.getStats(discordId, all);
  }

  @Auth()
  @Delete('stats/:id')
  deleteStats(@Param('id', ParseIntPipe) statId: number) {
    return this.playerService.deleteStat(statId);
  }

  @Auth()
  @Post('uploadStats/:id')
  uploadFile(
    @Param('id') discordId: string,
    @Body() uploadStatsDto: UploadStatsDto,
  ) {
    return this.playerService.uploadStats(discordId, uploadStatsDto);
  }
}
