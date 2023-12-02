const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kicks a player.')
    .addUserOption((option) =>
      option
        .setName('player')
        .setDescription('The player to kick')
        .setRequired(true),
    ),
};
