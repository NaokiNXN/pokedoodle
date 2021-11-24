# Pokedoodle

Pokedoodle is a discordJs bot made by a self taught programming noob on the request of DeviousDitto. 

Click this [link](https://discord.com/api/oauth2/authorize?client_id=911403531305627678&permissions=277025491968&scope=bot%20applications.commands) to invite the bot to your server

## Installation

Please note if you self host the DB of pokedoodles created by DeviousDitto and pokemon stats will not be included you will have to register your own using the commands.

Requirments: Node, Docker & DockerCompose, please google how to install these as no guide is given here.

Once you have node, docker and compose setup you will need to clone the repo. 
Start by creating a folder where you would like the files to be cloned to then just clone this repo into the folder.
```bash
mkdir ~/pokedoodle;
cd ~/pokedoodle;
git clone https://github.com/NaokiNXN/pokedoodle;
```

After cloning the image you will need to modify the admin array at the top of the /events/guild/interactionCreate.js file
You should replace the userIDs here with your own discord user id. You can get this by enabling discord developer mode and then right click your profile and copyid.

Finally you can create the container and start it up. 
You may see some errors but you can ignore these for the most part.

```bash
docker build -t pokedoodle .
docker-compose up -d
```

## Usage

This bot is a bot created for DeviousDitto and his pokedoodles.

The bot can show doodles created by DeviousDitto and generate pokedex entrys for them.
Please see below for examples:

Doodle:


![doodle](https://i.imgur.com/qGtx1gE.png)

Dex:



![dex](https://imgur.com/YDiJzgZ.png)

If self hosting no database of doodles or data is provided and you will need to generate this yourself. 

use /register to register pokemon info and /upload to upload the corresponding doodle or image to the bot.

## Contributing
I made this for fun and on request from DeviousDitto so i am not likely to add additional features unless requested to do so.
However if you can see something that could be improved please feel free to contribute.

## License
[MIT](https://choosealicense.com/licenses/mit/)

I do not claim ownership over anything related to pokemon, simply made by a fan for fun.
