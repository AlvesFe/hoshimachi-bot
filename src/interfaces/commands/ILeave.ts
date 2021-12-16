import { VoiceChannel } from "discord.js";

export interface ILeaveCommands {
  checkIfUserIsInTheSameChannelOfBot: (connection: any, voiceChannel: VoiceChannel) => boolean;
  leftTheChannelMessage: () => void;
}