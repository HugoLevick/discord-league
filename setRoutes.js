require('dotenv').config();
const { REST, Routes } = require('discord.js');

const commands = [
  {
    name: 'ping',
    description: 'Replies with Pong!',
  },
  {
    name: 'signup',
    description: 'Sign Up to a league',
  },
  {
    name: 'signout',
    description: 'Sign out of a league',
  },
  {
    name: 'togglecheckin',
    description: 'Toggle check ins',
  },
  {
    name: 'checkin',
    description: 'Check In to a league',
  },
  {
    name: 'who',
    description: 'Display a list of people who signed up',
  },
  {
    name: 'teams',
    description: 'Display a list of the current teams',
  },
  {
    name: 'randomize',
    description: 'Randomize people who signed up',
  },
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

try {
  console.log('Started refreshing application (/) commands.');

  rest
    .put(Routes.applicationCommands(process.env.DISCORD_ID), {
      body: commands,
    })
    .then(() => console.log('Successfully reloaded application (/) commands.'));
} catch (error) {
  console.error(error);
}
