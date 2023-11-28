import { GuildMember } from 'discord.js';

export interface PlayerI {
  member: GuildMember;
  isIn: boolean;
  tier: number;
}
