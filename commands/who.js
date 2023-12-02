const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('who')
    .setDescription('Display a list of people who signed up.'),
};
