const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Toca uma música')
    .addStringOption(option =>
      option.setName('link')
      .setDescription('Link para a música')
      .setRequired(true)),
	async execute(interaction) {
		await interaction.reply(`Tocando: ${interaction.options._hoistedOptions[0].value}`);
	},
};