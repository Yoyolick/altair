const Discord = require('discord.js')
const got = require('got');

module.exports = {
	name: 'definition',
	description: 'Queries definition of a word.',
    cooldown: '5',
    aliases: ['def', 'define'],
	execute(client, message, args, functions) {
        if (!args[0]) {
            return message.channel.send(functions.simpleEmbed('Please run this command with the word you want to look up.', '', '0xFFFF00'))
        }
        if (args.length > 1) {
            return message.channel.send(functions.simpleEmbed('Please only run this command with one word.', '', '0xFFFF00'))
        }
        message.channel.startTyping();
        // got is an awesome library but i still haven't figured out how to catch a 404, try/catch won't work like described in the documentation
        got(`https://api.dictionaryapi.dev/api/v2/entries/en_US/${args[0]}`).then(res =>{
            const result = JSON.parse(res.body)[0];
            const embed = new Discord.MessageEmbed().setTitle(`Definition for '${args[0]}':`).setColor('0x0000FF');
            // this isn't the prettiest solution especially because i would like the noun definition to come first, but it works and shouldn't throw any errors
            result.meanings.forEach(meaning => {
                meaning.definitions.slice(0, 3).forEach(definition => {
                    embed.addFields(
                        { name: definition.definition, value: `*${definition.example || 'No example.'}*` }
                    )
                });
            })
            message.channel.send(embed)
        })
        message.channel.stopTyping();
	},
};