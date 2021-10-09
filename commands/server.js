const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('server')
		.setDescription('Responde com informações do servidor'),
	async execute(interaction) {
		const response = `Servidor: ${interaction.member.guild.name}\nId: ${interaction.member.guild.id}`;
		await interaction.reply(response);
	},
};