import fs from 'fs';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { clientId, guildId, token } from './config.json';

const { NODE_ENV } = process.env;

const commands = [];
const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.ts'));

for (const file of commandFiles) {
  const command = require(`./src/commands/${file}`);
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(token);

if (NODE_ENV === 'production') {
  rest
    .put(Routes.applicationCommands(clientId), { body: commands })
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error);
} 
else {
  rest
    .put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error);
}
