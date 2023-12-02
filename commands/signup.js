const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('signup')
    .setDescription('Sign Up for a league.'),
};
