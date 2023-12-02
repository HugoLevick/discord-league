const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('teams')
    .setDescription('Display a list of the current teams.'),
};
