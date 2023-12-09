require('dotenv').config();
const path = require('path');
const fs = require('fs');
const { REST, Routes } = require('discord.js');

const commands = [];

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter((file) => {
  //Files read is 'commands'
  return file.endsWith('.js');
});
for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  // Set a new item in the Collection with the key as the command name and the value as the exported module
  if ('data' in command) {
    commands.push(command.data.toJSON());
  } else {
    console.warn(
      `[WARNING] The command at ${filePath} is missing a required "data" property.`,
    );
  }
}

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
