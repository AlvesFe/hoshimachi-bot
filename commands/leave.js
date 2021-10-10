const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('leave')
		.setDescription('Responde com Pong!'),
	async execute(interaction) {
		await interaction.reply('Pong!');
	},
};