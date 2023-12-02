const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('checkin')
    .setDescription('Check In to a league.'),
};
