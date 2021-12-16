import { IInteractionCreate } from '../interfaces/IInteractionCreate'

export default {
  name: 'interactionCreate',
  execute: (interaction) => {

    if (!interaction.isCommand()) return;

    const command = interaction.client.application.commands[interaction.commandName];

    if (!command) return;

    try {
      command.execute(interaction);
    } catch (error) {
      console.error(error);
      return interaction.reply({
        content: 'There was an error while executing this command!',
        ephemeral: true,
      });
    }
  }
} as IInteractionCreate;