const { SlashCommandBuilder } = require('@discordjs/builders');
const { queue } = require('../resources');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('listqueue')
		.setDescription('Lista as músicas na fila'),
	async execute (interaction) {
    interaction.reply('FILA');
	},
};