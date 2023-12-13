import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Player } from './entities/player.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UploadStatsDto } from './dto/upload-stats.dto';
import { PlayerStats } from './entities/player-stats.entity';
import { CreatePlayerDto } from './dto/create-player.dto';

@Injectable()
export class PlayerService {
  public readonly maxStats = 12;
  public readonly minStats = 1;

  constructor(
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
    @InjectRepository(PlayerStats)
    private readonly playerStatsRepository: Repository<PlayerStats>,
  ) {}

  async createPlayer(createPlayerDto: CreatePlayerDto) {
    const { discordId, name } = createPlayerDto;

    const player = this.playerRepository.create();
    player.discordId = discordId;
    player.name = name;

    try {
      await this.playerRepository.insert(player);
      return player;
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException();
    }
  }

  async searchPlayers(search: string) {
    const players = await this.playerRepository
      .createQueryBuilder('player')
      .where('player.name ILIKE :search', { search: `%${search}%` })
      .orWhere('player.discordId ILIKE :id', { id: `%${search}%` })
      .getMany();

    return players;
  }

  async getPlayerByDiscordId(discordId: string) {
    const player = await this.playerRepository.findOne({
      where: { discordId },
    });
    if (!player)
      throw new NotFoundException(`Player with id '${discordId}' not found`);
    return player;
  }

  async getStats(discordId: string, all: boolean = false) {
    if (!discordId) throw new BadRequestException('Discord ID is required');
    const stats = await this.playerStatsRepository.find({
      where: { player: { discordId } },
      take: all ? undefined : 36,
      order: { createdAt: 'DESC' },
    });
    return stats;
  }

  private getStatAverage(stat: number[] | boolean[], totalStats: number) {
    if (typeof stat[0] === 'boolean') {
      return stat.filter((stat) => stat).length / totalStats;
    } else {
      // @ts-ignore
      return stat.reduce((a, b) => a + b, 0) / totalStats;
    }
  }

  async getPlayerAverageStats(discordId: string) {
    const stats = await this.playerStatsRepository.find({
      where: { player: { discordId } },
      relations: ['player'],
      take: this.maxStats,
    });

    if (stats.length < this.minStats) return null;

    const averageStats = {
      downs: this.getStatAverage(
        stats.map((stat) => stat.downs),
        stats.length,
      ),
      revives: this.getStatAverage(
        stats.map((stat) => stat.revives),
        stats.length,
      ),
      damage: this.getStatAverage(
        stats.map((stat) => stat.damage),
        stats.length,
      ),
      bombs: this.getStatAverage(
        stats.map((stat) => stat.bombs !== null),
        stats.filter((stat) => stat.bombs !== null).length,
      ),
      hillTime: this.getStatAverage(
        stats.map((stat) => stat.hillTime !== null),
        stats.filter((stat) => stat.hillTime !== null).length,
      ),
      won: this.getStatAverage(
        stats.map((stat) => stat.won),
        stats.length,
      ),
      totalGamesPlayed: await this.playerStatsRepository.count({
        where: { player: { discordId } },
      }),
    };

    return averageStats;
  }

  async deleteStat(statId: number) {
    const stat = await this.playerStatsRepository.findOne({
      where: { id: statId },
    });
    if (!stat)
      throw new NotFoundException(`Stat with id '${statId}' not found`);
    await this.playerStatsRepository.delete(statId);
    return { message: 'Stat deleted successfully' };
  }

  async uploadStats(discordId: string, uploadStatsDto: UploadStatsDto) {
    const { stats } = uploadStatsDto;
    const statsPromises: Promise<any>[] = [];

    try {
      for (const stat of stats) {
        const playerStats = this.playerStatsRepository.create({
          player: { discordId },
          ...stat,
        });

        statsPromises.push(this.playerStatsRepository.insert(playerStats));
      }

      await Promise.all(statsPromises);
      return { message: 'Stats uploaded successfully' };
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException();
    }
  }

  async updatePlayer(player: Player, newName: string) {
    player.name = newName;
    await this.playerRepository.save(player);
    return player;
  }
}
