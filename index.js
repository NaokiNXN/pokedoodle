const Discord = require('discord.js');
const Sequelize = require('sequelize');

/**
 * Intents and token setup and assignment
 */

const botIntents = new Discord.IntentsBitField();
botIntents.add(
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.DirectMessages,
    Discord.GatewayIntentBits.MessageContent
);

const client = new Discord.Client({ intents: botIntents });

const { token } = require('./token.json');

/**
 * Command & event collections mapped to client for easy access in handlers
 */

client.commands = new Discord.Collection();
client.commandArray = [];
client.events = new Discord.Collection();
client.cooldowns = new Set();


/**
 * This section creates a DB using sequelize and sqlite, we also setup
 * the data model to be used in the DB and both are attached to the client for easy access.
 */

client.dbRefresh = function (client) {

    if (client.sequelize) {
        client.sequelize.close();
    }

    client.sequelize = new Sequelize('database', 'user', 'password', {
        host: 'localhost',
        dialect: 'sqlite',
        logging: true,
        storage: './database/database.sqlite',
    });

    client.Tags = client.sequelize.define('tags', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: Sequelize.STRING,
            unique: true,
            allowNull: false,
        },
        dexNumber: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
        dexEntry: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        type1: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        type2: {
            type: Sequelize.STRING,
            defaultValue: null,
        },
        height: {
            type: Sequelize.FLOAT,
            defaultValue: 0,
        },
        weight: {
            type: Sequelize.FLOAT,
            defaultValue: 0,
        },
        hp: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
        },
        atk: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
        },
        def: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
        },
        specialAtk: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
        },
        specialDef: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
        },
        speed: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
        },
        doodle: {
            type: Sequelize.STRING,
            defaultValue: null,
        },
    });

    console.log('Syncing DB');

    client.Tags.sync();

    console.log('Sync finished');
}

client.dbRefresh(client);

/**
 * Loads the handlers and passess the client to them
 */

['command_handler', 'event_handler'].forEach(handler => {
    require(`./handlers/${handler}`)(client)
});

client.login(token);