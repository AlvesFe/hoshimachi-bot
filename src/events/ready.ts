import { IReadyConfig } from '../interfaces/IReadyConfig';

export default {
	name: 'ready',
	once: true,
	execute (client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
	},
} as IReadyConfig;