import { Client } from 'discord.js'

export interface IReadyConfig{
  name: 'ready',
  once: boolean,
  execute: (client: Client) => void;
}