const { MessageActionRow, MessageSelectMenu } = require('discord.js');

module.exports = {
	name: 'avatar',
	description: 'Sends your or the mentioned users avatar.',
	usage: 'avatar [user]',
	guildOnly: true,
	aliases: ['av', 'pfp'],
	async execute(client, message, args, functions) {
		let member = message.mentions.members.first() || args[0]?.match(/\d{17,18}/) || message.member;
		if (Array.isArray(member)) {
			member = await message.guild.members.fetch(member[0]);
		}
		if (!member) return message.channel.send(functions.simpleEmbed('User not found or not a user!'));

		let avatarURL = await member.displayAvatarURL({ dynamic: true });

		const filetypeOptions = [
			{ label: 'jpg', value: 'jpg' },
			{ label: 'png', value: 'png' },
		];
		if (avatarURL.endsWith('.gif')) {
			filetypeOptions.unshift({ label: 'gif', value: 'gif', default: true }, { label: 'webp', value: 'webp' });
			avatarURL = avatarURL.slice(0, -4);
		} else {
			filetypeOptions.unshift({ label: 'webp', value: 'webp', default: true });
			avatarURL = avatarURL.slice(0, -5);
		}

		const sizeOptions = [
			{ label: '4096px', value: '4096', default: true },
			{ label: '2048px', value: '2048' },
			{ label: '1024px', value: '1024' },
			{ label: '512px', value: '512' },
			{ label: '256px', value: '256' },
			{ label: '128px', value: '128' },
			{ label: '64px', value: '64' },
			{ label: '32px', value: '32' },
			{ label: '16px', value: '16' },
		];
		const rows = [
			new MessageActionRow().setComponents([ new MessageSelectMenu().setCustomId('filetype').setOptions(filetypeOptions) ]),
			new MessageActionRow().setComponents([ new MessageSelectMenu().setCustomId('size').setOptions(sizeOptions) ]),
		];

		const msg = await message.channel.send({
			content: `> ${avatarURL}.${filetypeOptions[0].value}?size=4096`,
			components: rows,
		});
		const filter = i => {
			i.deferUpdate();
			return i.user.id === message.author.id;
		};

		const collector = msg.createMessageComponentCollector({ filter, idle: 30000 });
		collector.on('collect', i => {
			if (i.customId === 'filetype') {
				filetypeOptions.find(option => option.default).default = false;
				filetypeOptions.find(option => option.value === i.values[0]).default = true;
				rows[0].components[0].setOptions(filetypeOptions);
				msg.edit({ content: `> ${avatarURL}.${i.values[0]}?size=${sizeOptions.find(option => option.default).value}`, components: rows });
			} else {
				sizeOptions.find(option => option.default).default = false;
				sizeOptions.find(option => option.value === i.values[0]).default = true;
				rows[1].components[0].setOptions(sizeOptions);
				msg.edit({ content: `> ${avatarURL}.${filetypeOptions.find(option => option.default).value}?size=${i.values[0]}`, components: rows });
			}
		});
		collector.on('end', (collected, reason) => {
			rows[0].components[0].setDisabled();
			rows[1].components[0].setDisabled();
			if (reason === 'idle') msg.edit({ components: rows });
		});
	},
};