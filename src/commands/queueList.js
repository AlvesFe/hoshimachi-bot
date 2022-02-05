// eslint-disable-next-line no-unused-vars
const { VideoSearchResult } = require('yt-search');
// eslint-disable-next-line no-unused-vars
const { Interaction } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { queue } = require('../resources');
const { defaultMessage } = require('../resources/messageBuilder');

/**
 * Monta um embed com todas as músicas da fila
 * @param {Interaction} interaction Interaction do comando
 * @returns Mensagem montada
 */
async function queueListMessage (interaction) {
	const server = interaction.guild.name;
	const message = (await defaultMessage(interaction, 'Fila de músicas', true))
			.setDescription(`*Servidor: **${server}***`)
			.addFields(queueFieldsBuilder(queue));
	return message;
}

/**
 * Cria uma array de objetos com todas as entradas da fila
 * @param {{search: VideoSearchResult}[]} fila fila de músicas
 * @returns A array com itens da fila com nome da música e autor do vídeo
 */
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
		if (queue.length > 0) {
			interaction.reply({ embeds: [await queueListMessage(interaction)] });
		} else {
			interaction.reply({
				content: 'A fila está vazia!',
				ephemeral: true
			});
		}
	},
};
