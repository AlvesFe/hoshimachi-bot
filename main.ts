import fs from 'fs';
import { 
  Client, 
  Intents 
} from 'discord.js';
import { token } from './config.json';

const client = new Client({ 
  intents: [
    Intents.FLAGS.GUILDS, 
    Intents.FLAGS.GUILD_VOICE_STATES
  ] 
});

const commandFiles = fs
  .readdirSync('./src/commands')
  .filter((file) => file.endsWith('.ts'));

for (const file of commandFiles) {
  const command = require(`./src/commands/${file}`);
  client.application.commands.set(command.data.name, command);
}

// Events listing & executing
const eventFiles = fs
  .readdirSync('./src/events')
  .filter((file) => file.endsWith('.ts'));

for (const file of eventFiles) {
  const event = require(`./src/events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

client.login(token);
