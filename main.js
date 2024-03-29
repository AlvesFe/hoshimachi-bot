require('dotenv').config()
const fs = require('fs')
const { Client, Collection, GatewayIntentBits } = require('discord.js')
const token = process.env.TOKEN

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] })

// Commands listing
client.commands = new Collection()
const commandFiles = fs
  .readdirSync('./src/commands')
  .filter((file) => file.endsWith('.js'))

for (const file of commandFiles) {
  const command = require(`./src/commands/${file}`)
  client.commands.set(command.data.name, command)
}

// Events listing & executing
const eventFiles = fs
  .readdirSync('./src/events')
  .filter((file) => file.endsWith('.js'))

for (const file of eventFiles) {
  const event = require(`./src/events/${file}`)
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args))
  } else {
    client.on(event.name, (...args) => event.execute(...args))
  }
}

client.login(token)
