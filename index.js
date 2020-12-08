const fs = require('fs');
const chalk = require('chalk');
const Discord = require('discord.js');
const { prefix, token, ownerId } = require('./config.json');

const client = new Discord.Client();
console.log(chalk.grey('[main] Initialized client.'));

client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}
console.log(chalk.grey(`[cmnd] Loaded ${commandFiles.length} commands.`));

client.once('ready', () => {
	console.log(chalk.blueBright('[altr] Ready!'));
});

client.on('message', message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const commandName = args.shift().toLowerCase();

	if (!client.commands.has(commandName)) return;
	const command = client.commands.get(commandName);

	if (command.disabled) {
		const disabledEmbed = {
			color: 0xFF0000,
			description: 'This command is currently disabled.',
		};
		message.channel.send({ embed: disabledEmbed });
		return;
	}

	try {
		command.execute(client, message, args);
	}
	catch (error) {
		console.log(chalk.redBright('[main] An error has occured.'));
		console.log(chalk.red(error));
		const errorEmbed = {
			color: 0xFF0000,
			description: `I'm sorry, something went wrong. Please contact <@${ownerId}> if this issue persists!`,
		};
		message.channel.send({ embed: errorEmbed });
	}
});

client.login(token);