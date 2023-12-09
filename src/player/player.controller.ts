import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { PlayerService } from './player.service';
import { UploadStatsDto } from './dto/upload-stats.dto';
import { GetStatsDto } from './dto/get-stats.dto';

@Controller('players')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @Get('search/:search')
  searchPlayers(@Param('search') search: string) {
    return this.playerService.searchPlayers(search);
  }

  @Get('stats/:id')
  getStats(
    @Param('id', ValidationPipe) discordId: string,
    @Query('all', ParseBoolPipe) all: boolean,
  ) {
    return this.playerService.getStats(discordId, all);
  }

  @Delete('stats/:id')
  deleteStats(@Param('id', ParseIntPipe) statId: number) {
    return this.playerService.deleteStat(statId);
  }

  @Post('uploadStats/:id')
  uploadFile(
    @Param('id') discordId: string,
    @Body() uploadStatsDto: UploadStatsDto,
  ) {
    return this.playerService.uploadStats(discordId, uploadStatsDto);
  }
}
