const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('endleague')
    .setDescription('Ends the current league.')
    .addNumberOption((option) =>
      option
        .setName('winningteam')
        .setDescription('The team number that won.')
        .setRequired(false),
    ),
};
