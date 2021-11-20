const Discord = require('discord.js');
const Sequelize = require('sequelize');

/**
 * Intents and token setup and assignment
 */

const botIntents = new Discord.Intents();
botIntents.add(
    Discord.Intents.FLAGS.GUILDS
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
 * This section creates a relational DB using serialize and sqlite
 * we then attach it to the client for easy access elsewhere.
 */

const sequelize = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite',
});

const Tags = sequelize.define('tags', {
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
    type: {
        type: Sequelize.STRING,
        allowNull: false,
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
})


/**
 * Loads the handlers and passess the client to them
 */

 ['command_handler', 'event_handler'].forEach(handler => {
    require(`./handlers/${handler}`)(client)
});

client.login(token);