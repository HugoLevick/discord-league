import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Player } from './player.entity';

@Entity('stats')
export class PlayerStats {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('integer', { nullable: false })
  downs: number;

  @Column('integer', { nullable: false })
  revives: number;

  @Column('integer', { nullable: false })
  damage: number;

  @Column('integer', { nullable: true })
  bombs: number | null;

  @Column('integer', { nullable: true })
  hillTime: number | null;

  @Column('bool', { nullable: false })
  won: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Player, (player) => player.stats, { nullable: false })
  player: Player;
}
