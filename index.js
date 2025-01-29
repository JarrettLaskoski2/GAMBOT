const {Client, Collection, Events, GatewayIntentBits, MessageFlags} = require('discord.js');
const {token} = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');


const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

// adds all commands to client.commands collection
for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`${filePath} is missing data or execute`);
        }
    }
}

client.once(Events.ClientReady, readyClient => {
    console.log(`Ready! Signed in as ${readyClient.user.tag}`);
});

// listens for eventsssss
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;
    
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`${interaction.commandName} was not found`);
        return
    }

    try {
        await command.execute(interation);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content:  'There was an error while executing this comand', flags: MessageFlags.Ephemeral});
        } else {
            await interaction.reply({ content:  'There was an error while executing this comand', flags: MessageFlags.Ephemeral});
        }
    }
})

client.login(token);