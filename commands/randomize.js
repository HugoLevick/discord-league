const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('randomize')
    .setDescription('Randomize people who signed up.'),
};
