const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('signout')
    .setDescription('Sign Out of a league.'),
};
