import { CommandInteraction } from 'discord.js';

export interface IInteractionCreate{
  name: 'interactionCreate',
  execute: (interaction: CommandInteraction) => void;
}