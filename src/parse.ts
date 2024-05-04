/**
 * Parses messages of the following format. Comes as a single line.
 * Split the message onto several lines below for readability.
@badge-info=;
badges=<BADGES>;
color=<USER_COLOR>;
display-name=<NAME>;
emote-only=1;
emotes=<EMOTES>;
first-msg=0;
flags=;
id=<CHAT_ID>;
mod=0;
returning-chatter=0;
room-id=<ROOM_ID>;
subscriber=0;
tmi-sent-ts=<TIME_SENT>;
turbo=0;
user-id=<USERID>;
user-type= :<NAME>!<NAME>@<NAME>.tmi.twitch.tv PRIVMSG #<CHANNEL> <MESSAGE>
*/

// Command from the irc api
interface Command {
    command: string,
    channel: string | null,
    server?: string
}

interface Source {
    nick: string,
    host: string
}

type Tags = Record<string, string | null>

// Parsed message from the irc api
interface ParsedMessage {
    tags: Tags,
    source: Source,
    command: Command,
    parameters: string
}

/**
 * Parse a raw message from the IRC api
 * @param rawMessage Plain text message to be parsed
 * @returns {ParsedMessage | null} Parsed message or null if the message is invalid
 */
export const parseMessage = (rawMessage: string): ParsedMessage | null => {
    if (typeof rawMessage !== "string") {
        console.error("Expected a string message, received:", typeof rawMessage);
        return null; // Return or handle error as appropriate
    }

    const message = rawMessage.trim();
    const parsedMessage: ParsedMessage = {
        tags: {},
        source: { nick: "", host: "" },
        command: { command: "", channel: "", server: "" },
        parameters: ""
    };

    let idx = message.startsWith("@") ? message.indexOf(" ") + 1 : 0;
    const sourceIdx = message.indexOf(":", idx);
    if (sourceIdx !== -1) {
        parsedMessage.source = parseSource(message.slice(sourceIdx + 1, message.indexOf(" ", sourceIdx)));
        idx = message.indexOf(" ", sourceIdx) + 1;
    } else {
        return null; // Invalid message format
    }

    const commandIdx = message.indexOf(" :", idx);
    if (commandIdx !== -1) {
        parsedMessage.command = parseCommand(message.slice(idx, commandIdx));
        parsedMessage.parameters = message.slice(commandIdx + 2);
    } else {
        parsedMessage.command = parseCommand(message.slice(idx));
    }

    if (message[0] === "@") {
        parsedMessage.tags = parseTags(message.slice(1, message.indexOf(" ")));
    }

    return parsedMessage;
};

/**
 * Parse the tags from the message
 * @param tags 
 * @returns {Tags}
 */
const parseTags = (tags: string): Tags => {
    const tagsToIgnore = new Set(["client-nonce", "flags"]);
    const parsedTags: Record<string, string | null> = {};
    tags.split(";").forEach(tag => {
        const [key, value] = tag.split("=");
        if (!tagsToIgnore.has(key)) {
            parsedTags[key] = value || null;
        }
    });
    return parsedTags;
};

/**
 * Parse the source of the message
 * @param source 
 * @returns {Source}
 */
const parseSource = (source: string): Source => {
    const [nick, host] = source.split("!");
    return { nick: nick, host: host || nick };
};

/**
 * Parse the command from the message
 * @param commandString 
 * @returns {Command}
 */
const parseCommand = (commandString: string): Command => {
    const parts = commandString.trim().split(" ");
    const command: Command = { command: parts[0], channel: parts[1] || null, server: undefined };
    if (parts[0] === "PING") {
        command.server = parts[1];
    }
    return command;
};
