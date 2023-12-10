import { Injectable, Logger } from '@nestjs/common';
import {
  APIEmbedField,
  EmbedBuilder,
  GatewayIntentBits,
  GuildMember,
  Client,
  Interaction,
  ChatInputCommandInteraction,
} from 'discord.js';

import { PlayerI } from './interfaces/player.interface';
import { TeamI } from './interfaces/team.interface';
import { PlayerService } from 'src/player/player.service';
import { Player } from 'src/player/entities/player.entity';

interface SignUpControlI {
  [id: string]: PlayerI;
}

interface TierControlI {
  [tier: number]: {
    members: GuildMember[];
  };
}

interface TeamControlI {
  [teamNumber: number]: TeamI;
}

@Injectable()
export class DiscordBotService {
  constructor(private readonly playerService: PlayerService) {}
  private readonly logger = new Logger('DiscordBotService');

  private signUps: SignUpControlI = {};
  private currentTeams: TeamControlI = {};
  private allowCheckIns = false;
  private readonly logoUrl =
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Placeholder_view_vector.svg/310px-Placeholder_view_vector.svg.png';

  async startBot() {
    const client = new Client({ intents: [GatewayIntentBits.Guilds] });

    client.on('ready', () => {
      this.logger.log(`Logged in as ${client.user.tag}!`);
    });

    client.on('interactionCreate', async (interaction) => {
      if (
        !interaction.isChatInputCommand() ||
        !interaction.inCachedGuild() //TypeSafe
      )
        return;

      let player: Player;
      try {
        player = await this.playerService.getPlayerByDiscordId(
          interaction.member.id,
        );

        if (player.name !== interaction.member.displayName) {
          player.name = interaction.member.displayName;
          await this.playerService.updatePlayer(
            player,
            interaction.member.displayName,
          );
        }
      } catch (error) {
        player = await this.playerService.createPlayer({
          discordId: interaction.member.id,
          name: interaction.member.displayName,
        });
      }

      //*Commands
      switch (interaction.commandName) {
        case 'signup':
          //SignUp command
          await this.signUpCommand(interaction);
          break;
        case 'signout':
          //SignOut command
          await this.signOutCommand(interaction);
          break;
        case 'who':
          //Who command
          await this.whoCommand(interaction);
          break;
        case 'togglecheckin':
          //ToggleCheckIn command
          await this.toggleCheckInCommand(interaction);
          break;
        case 'checkin':
          //CheckIn command
          await this.checkInCommand(interaction);
          break;
        case 'randomize':
          //Randomize command
          await this.randomizeCommand(interaction);
          break;
        case 'teams':
          //Teams command
          await this.teamsCommand(interaction);
          break;
        case 'endleague':
          //EndLeague command
          await this.endLeagueCommand(interaction);
          break;
        case 'kick':
          //Kick command
          await this.kickCommand(interaction);
          break;
        case 'stats':
          //Stats command
          await this.statsCommand(interaction, player);
          break;
        default:
          //Unknown command
          await interaction.reply({
            content: 'Command not implemented.',
            ephemeral: true,
          });
      }
    });

    client.login(process.env.DISCORD_TOKEN);
  }

  public async signUpCommand(
    interaction: ChatInputCommandInteraction<'cached'>,
  ) {
    const member = interaction.member;

    const alreadySignedUp = this.lookUpSignUp(member);
    if (alreadySignedUp) {
      interaction.reply({
        content: 'You have already signed up to the league.',
        ephemeral: true,
      });
      return;
    }

    const tier = this.getTierFromMember(member);
    if (tier === -1) {
      interaction.reply({
        content: 'You have not been assigned a tier yet.',
        ephemeral: true,
      });
      return;
    }

    this.signUpMember(member, tier);

    await interaction.reply({
      content: `<@${member.id}> signed up to the league!`,
    });
  }

  public async signOutCommand(
    interaction: ChatInputCommandInteraction<'cached'>,
  ) {
    const member = interaction.member;

    const alreadySignedUp = this.lookUpSignUp(member);
    if (!alreadySignedUp) {
      interaction.reply({
        content: 'You have not signed up to the league.',
        ephemeral: true,
      });
      return;
    }

    this.signOutMember(member);
    await interaction.reply({
      content: `<@${member.id}> signed out of the league!`,
    });
  }

  public async whoCommand(interaction: ChatInputCommandInteraction<'cached'>) {
    const fields: APIEmbedField[] = [];

    const tiers = this.getSignUpTiers();

    for (const tier of tiers) {
      const signUps = Object.values(this.signUps).filter(
        (s) => s.tier === tier,
      );

      const tierSignUps = signUps.map(
        (s) => `<@${s.member.id}> ${s.isIn ? '✅' : '❌'}`,
      );

      const signUpsString = tierSignUps.join(', ');
      fields.push({
        name: `Tier ${tier} (${signUps.length})`,
        value: signUpsString,
      });
    }

    let checkedIn = 0;
    for (const signUp of Object.values(this.signUps)) {
      if (signUp.isIn) checkedIn++;
    }

    const whoEmbed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle('Current Sign Ups')
      .setAuthor({
        name: "Strikeout's league",
        iconURL: this.logoUrl,
      })
      .setDescription(
        `There are currently ${
          Object.keys(this.signUps).length
        } sign ups of which ${checkedIn} are checked in.`,
      )
      .setThumbnail(this.logoUrl)
      .addFields(fields)
      .setTimestamp()
      .setFooter({
        text: 'League Bot by @levick.',
      });

    await interaction.reply({ embeds: [whoEmbed], ephemeral: true });
  }

  public async toggleCheckInCommand(
    interaction: ChatInputCommandInteraction<'cached'>,
  ) {
    this.allowCheckIns = !this.allowCheckIns;
    await interaction.reply({
      content: `Check ins are now ${this.allowCheckIns ? 'open' : 'closed'}.`,
    });
  }

  public async checkInCommand(
    interaction: ChatInputCommandInteraction<'cached'>,
  ) {
    const member = interaction.member;

    const alreadySignedUp = this.lookUpSignUp(member);
    if (!alreadySignedUp) {
      await interaction.reply({
        content: 'You have not signed up to the league.',
        ephemeral: true,
      });
      return;
    }

    if (!this.allowCheckIns) {
      await interaction.reply({
        content: 'Check ins are not open yet.',
        ephemeral: true,
      });
      return;
    }

    const couldCheckIn = this.checkInMember(member);
    if (couldCheckIn === undefined) {
      await interaction.reply({
        content: 'Error: could not check you in.',
        ephemeral: true,
      });
      return;
    }

    await interaction.reply({
      content: `<@${member.id}> checked in!`,
    });
  }

  public async randomizeCommand(
    interaction: ChatInputCommandInteraction<'cached'>,
  ) {
    this.currentTeams = {};
    const tiers: TierControlI = {};

    for (const signUp of Object.values(this.signUps)) {
      if (!signUp.isIn) continue;
      if (!tiers[signUp.tier]) tiers[signUp.tier] = { members: [] };
      tiers[signUp.tier].members.push(signUp.member);
    }

    //Check if there is the same amount of players in each tier
    const tierLengths = Object.values(tiers).map((t) => t.members.length);
    const numberOfTeams = tierLengths[0];
    if (tierLengths.some((t) => t !== numberOfTeams)) {
      await interaction.reply({
        content:
          'Error: there are not the same amount of players in each tier.',
        ephemeral: true,
      });
      return;
    }

    //Randomize teams
    const totalPeople = Object.keys(this.signUps).length;
    for (let teamNumber = 1; teamNumber <= numberOfTeams; teamNumber++) {
      for (const tier of Object.keys(tiers)) {
        const tierMembers = tiers[+tier].members;

        const randomIndex = Math.floor(Math.random() * tierMembers.length);
        const randomMember = tierMembers.splice(randomIndex, 1)[0];

        const player: PlayerI = {
          member: randomMember,
          isIn: true,
          tier: +tier,
        };

        //Captain for the initial creation of the team
        if (!this.currentTeams[teamNumber])
          this.currentTeams[teamNumber] = { captain: player, members: [] };
        else if (+tier < this.currentTeams[teamNumber].captain.tier) {
          this.currentTeams[teamNumber].captain = player;
        }

        this.currentTeams[teamNumber].members.push(player);
      }
    }

    const embed = this.getTeamEmbed(this.currentTeams);
    await interaction.reply({
      embeds: [embed],
    });
  }

  public async teamsCommand(
    interaction: ChatInputCommandInteraction<'cached'>,
  ) {
    const embed = this.getTeamEmbed(this.currentTeams);
    await interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
  }

  public async kickCommand(interaction: ChatInputCommandInteraction<'cached'>) {
    const playerToKick = interaction.options.getMember('player');
    const player = this.lookUpSignUp(playerToKick);
    if (!player) {
      await interaction.reply({
        content: 'Player is not signed up.',
        ephemeral: true,
      });
      return;
    }

    this.signOutMember(playerToKick);

    await interaction.reply({
      content: `<@${playerToKick.id}> has been kicked!`,
    });
  }

  public async endLeagueCommand(
    interaction: ChatInputCommandInteraction<'cached'>,
  ) {
    const winnerTeamNumber = interaction.options.getNumber('winningteam');
    let winnerTeam: TeamI;
    if (winnerTeamNumber) {
      winnerTeam = this.currentTeams[winnerTeamNumber];
      if (!winnerTeam) {
        await interaction.reply({
          content: 'Team does not exist.',
          ephemeral: true,
        });
        return;
      }
    }

    this.signUps = {};
    this.currentTeams = {};
    this.allowCheckIns = false;

    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle('League Ended')
      .setAuthor({
        name: "Strikeout's league",
        iconURL: this.logoUrl,
      })
      .setThumbnail(this.logoUrl)
      .setDescription(
        winnerTeamNumber
          ? `Congratulations to Team ${winnerTeamNumber} for winning the league!`
          : 'The league has ended.',
      );

    if (winnerTeam) {
      embed.addFields({
        name: `Team ${winnerTeamNumber}`,
        value: winnerTeam.members
          .map(
            (s) =>
              `<@${s.member.id}> ${
                s.member.displayName === winnerTeam.captain.member.displayName
                  ? '(Captain)'
                  : ''
              }`,
          )
          .join('\n'),
      });
    }

    embed.setTimestamp().setFooter({
      text: 'League Bot by @levick.',
    });

    await interaction.reply({
      embeds: [embed],
    });
  }

  public async statsCommand(
    interaction: ChatInputCommandInteraction,
    player: Player,
  ) {
    const stats = await this.playerService.getPlayerAverageStats(
      player.discordId,
    );

    if (!stats) {
      await interaction.reply({
        content: 'You need at least 24 games played to see your stats.',
        ephemeral: true,
      });
      return;
    }

    // if (stats.length < 24) {
    //   await interaction.reply({
    //     content: 'You need at least 24 games played to see your stats.',
    //     ephemeral: true,
    //   });
    //   return;
    // }

    const fields: APIEmbedField[] = [];
    fields.push({
      name: 'Downs',
      value: `${stats.downs}`,
      inline: true,
    });
    fields.push({
      name: 'Revives',
      value: `${stats.revives}`,
      inline: true,
    });
    fields.push({
      name: 'Damage',
      value: `${stats.damage}`,
      inline: true,
    });
    fields.push({
      name: 'Bombs',
      value: stats.bombs ? `${stats.bombs}` : 'N/A',
      inline: true,
    });
    fields.push({
      name: 'Hill Time',
      value: stats.hillTime ? `${stats.hillTime}` : 'N/A',
      inline: true,
    });
    fields.push({
      name: 'Win %',
      value: stats.won ? `${stats.won * 100}%` : 'Error',
      inline: true,
    });

    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle(`${player.name}'s Stats`)
      .setAuthor({
        name: "Strikeout's league",
        iconURL: this.logoUrl,
      })
      .setThumbnail(this.logoUrl)
      .addFields(fields)
      .setFooter({
        text: `League Bot by @levick. | ${stats.totalGamesPlayed} games played.`,
      });

    await interaction.reply({ embeds: [embed] });
  }

  public lookUpSignUp(member: GuildMember) {
    return this.signUps[member.id];
  }

  public signUpMember(member: GuildMember, tier: number) {
    this.signUps[member.id] = {
      member,
      isIn: false,
      tier,
    };
  }

  public signOutMember(member: GuildMember) {
    delete this.signUps[member.id];
  }

  public getSignUpTiers() {
    const tiers: number[] = [];

    for (const signUp of Object.values(this.signUps)) {
      if (tiers.includes(signUp.tier)) continue;
      tiers.push(signUp.tier);
    }

    //Sort tiers
    tiers.sort((a, b) => a - b);
    return tiers;
  }

  public checkInMember(member: GuildMember) {
    const signUp = this.lookUpSignUp(member);
    if (!signUp) return;

    signUp.isIn = true;
    return true;
  }

  private getTierFromMember(member: GuildMember) {
    const tierRole = member.roles.cache.find((r) => r.name.match(/^Tier \d+/));
    if (!tierRole) return -1;

    const tier = parseInt(tierRole.name.match(/\d+/)[0]);
    return tier;
  }

  private getTeamEmbed(teams: TeamControlI) {
    if (Object.keys(teams).length === 0)
      return new EmbedBuilder().setColor(0x0099ff).setTitle('No teams yet');

    const fields: APIEmbedField[] = [];

    for (const teamKey of Object.keys(teams)) {
      const team = teams[+teamKey];

      const teamMembers = team.members.map(
        (s) =>
          `<@${s.member.id}> ${
            s.member.displayName === team.captain.member.displayName
              ? '(Captain)'
              : ''
          }`,
      );

      const teamString = teamMembers.join('\n');
      fields.push({
        name: `Team ${teamKey}`,
        value: teamString,
      });
    }

    return new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle('Current Teams')
      .setAuthor({
        name: "Strikeout's league",
        iconURL: this.logoUrl,
      })
      .setThumbnail(this.logoUrl)
      .addFields(fields)
      .setTimestamp()
      .setFooter({
        text: 'League Bot by @levick.',
      });
  }
}
