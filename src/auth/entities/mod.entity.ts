import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { RolesEnum } from '../enums/roles.enum';

@Entity('mods')
export class Mod {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  username: string;

  @Column('text', { nullable: true, select: false })
  password: string;

  @Column('enum', { enum: RolesEnum, default: RolesEnum.MOD })
  role: RolesEnum;
}
