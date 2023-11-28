import { PlayerI } from './player.interface';

export interface TeamI {
  captain: PlayerI;
  members: PlayerI[];
}
