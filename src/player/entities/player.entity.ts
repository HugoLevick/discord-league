import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { PlayerStats } from './player-stats.entity';

@Entity()
export class Player {
  @Column('text', { primary: true })
  discordId: string;

  @Column({ length: 500 })
  name: string;

  @OneToMany(() => PlayerStats, (stats) => stats.player)
  stats: PlayerStats[];
}
