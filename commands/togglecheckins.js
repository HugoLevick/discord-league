const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('togglecheckin')
    .setDescription('Toggle check ins.'),
};
