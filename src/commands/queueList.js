const { SlashCommandBuilder } = require('@discordjs/builders');
const { queue } = require('../resources');
const { MessageEmbed, Interaction, User } = require('discord.js');
const clientId = process.env.CLIENT_ID;

/**
 * Lista a fila
 * @param {Interaction} interaction
 * @param {User} user
 */
async function queueListMessage (interaction) {
	const server = interaction.guild.name;
	const { botAvatarUrl, botName } = await interaction.client.users.fetch(clientId).then(res => {
		return {
			botAvatarUrl: res.displayAvatarURL({ format: 'png' }),
			botName: res.username
		};
	});
	const user = await interaction.member.fetch();
	const userAvatarUrl = user.displayAvatarURL({ format: 'png' });

	return new MessageEmbed()
		.setColor('#9ec2e8')
		.setTitle('Fila de músicas')
		.setAuthor(botName, botAvatarUrl)
		.setDescription(`*Servidor: **${server}***`)
		.addFields(queueFieldsBuilder(queue))
		.setTimestamp()
		.setFooter(user.nickname ?? user.user.username, userAvatarUrl);
}

function queueFieldsBuilder (fila) {
	const fields = fila.map(({ search }, i) => {
		return {
			name: `#${i + 1} - ${search.title}`,
			value: `**Autor:** ${search.author.name}`
		};
	});
	return fields;
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('listqueue')
		.setDescription('Lista as músicas na fila'),
	async execute (interaction) {
		interaction.reply({ embeds: [await queueListMessage(interaction)] });
	},
};
