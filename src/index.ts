// import modules
import WebSocket from "ws";
import chalk from "chalk";

// node imports
import * as readline from "node:readline";
import { stdin as input, stdout as output } from "node:process";

// local libs
import { parseMessage } from "./parse";

const rl = readline.createInterface({ input, output });

const ws = new WebSocket("wss://irc-ws.chat.twitch.tv:443", {
    perMessageDeflate: false
});

ws.on("error", console.error);

ws.on("open", async function open() {
    ws.send("CAP REQ :twitch.tv/membership twitch.tv/tags twitch.tv/commands");
    ws.send(`NICK ${process.env.CHAT_USERNAME}`);
    rl.question("What channel would you like to join? ", (answer) => {
        console.log(answer);
        ws.send(`JOIN #${answer}`);
    });
});

ws.on("message", function message(data) {
    const message = parseMessage(data.toString());
    if (!message) {
        console.error("Invalid message:", data.toString());
        return;
    }
    let username;
    switch (message.command.command) {
    case "PRIVMSG":
        if (!message.source.nick || !message.parameters) return;
        try {
            username = chalk.hex(message.tags.color ?? "")(message.source.nick);
        } catch (e) {
            username = message.source.nick;
        }
        console.log(`${username}: ${message.parameters}`);
        break;
    case "PING":
        console.log("Handling keep-alive ping", message.command.server);
        ws.send(`PONG ${message.command.server}`);
        break;
    default:
        // console.log('Unhandled command:', message.command.command);
    }
});
