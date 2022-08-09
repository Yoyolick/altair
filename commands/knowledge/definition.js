const { MessageEmbed } = require('discord.js');
const got = require('got');

module.exports = {
	name: 'definition',
	description: 'Queries definition of a word.',
	usage: 'definition <word>',
	args: true,
	aliases: ['def', 'define'],
	async execute(client, message, args, functions) {
		if (args.length > 1) {
			return message.reply(functions.simpleEmbed('Please only run this command with one word.', '', client.colors.yellow));
		}

		try {
			await got(`https://api.dictionaryapi.dev/api/v2/entries/en_US/${args[0]}`).then(res => {
				const result = JSON.parse(res.body)[0];
				const embed = new MessageEmbed().setTitle(`Definition for '${args[0]}':`).setColor(client.colors.blue);
				// this isn't the prettiest solution especially because i would like the noun definition to come first, but it works
				result.meanings.forEach(meaning => {
					meaning.definitions.slice(0, 3).forEach(definition => {
						embed.addFields(
							{ name: definition.definition, value: `*${definition.example || 'No example.'}*` },
						);
					});
				});
				message.reply({ embeds: [embed] });
			});
		} catch {
			return message.reply(functions.simpleEmbed('Nothing found!'));
		}

	},
};