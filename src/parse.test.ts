import { parseMessage } from "./parse";

describe("parseMessage", () => {
    test("should return null for an empty message", () => {
        const rawMessage = "";
        const result = parseMessage(rawMessage);
        expect(result).toBeNull();
    });

    test("should parse a valid message with all fields", () => {
        const rawMessage = "@badge-info=;badges=<BADGES>;color=<USER_COLOR>;display-name=<NAME>;emote-only=1;emotes=<EMOTES>;first-msg=0;flags=;id=<CHAT_ID>;mod=0;returning-chatter=0;room-id=<ROOM_ID>;subscriber=0;tmi-sent-ts=<TIME_SENT>;turbo=0;user-id=<USERID>;user-type= :<NAME>!<NAME>@<NAME>.tmi.twitch.tv PRIVMSG #<CHANNEL> <MESSAGE>";
        const expected = {
            tags: {
                "badge-info": null,
                "badges": "<BADGES>",
                "color": "<USER_COLOR>",
                "display-name": "<NAME>",
                "emote-only": "1",
                "emotes": "<EMOTES>",
                "first-msg": "0",
                "id": "<CHAT_ID>",
                "mod": "0",
                "returning-chatter": "0",
                "room-id": "<ROOM_ID>",
                "subscriber": "0",
                "tmi-sent-ts": "<TIME_SENT>",
                "turbo": "0",
                "user-id": "<USERID>",
                "user-type": null,
            },
            source: {
                nick: "<NAME>",
                host: "<NAME>@<NAME>.tmi.twitch.tv",
            },
            command: {
                command: "PRIVMSG",
                channel: "#<CHANNEL>",
                server: undefined
            },
            parameters: "",
        };
        const result = parseMessage(rawMessage);
        expect(result).toEqual(expected);
    });
});
