/* INITIALIZATION */

// Import discord.js
const Discord = require("discord.js");
// Create new Discord client, enabling the methods that make the bot work
const client = new Discord.Client();
const botRoomName = "bot-room";
const prefix = "?";
const pj = require("./package.json");

// Import NPM libraries for online content searching
// const got = require("got"); // makes HTTP calls
// const cheerio = require("cheerio"); // wrapper for jQuery

// Hide API key
// TODO: Disable on Heroku server because it handles env variables differently
require("dotenv").config();

// Variables for parsing user input
let inputString = "";
let args = [];
let clientID;

// Consts for invoking randomness modules
const DICE_MODULE = 0;
const OBLIQUE_MODULE = 1;
const IMAGE_MODULE = 2;
const TAROT_MODULE = 3;
const REDDIT_MODULE = 4;
const TROPE_MODULE = 5;
const COIN_MODULE = 6;

// Look closely: the help module will never be called randomly
const HELP_MODULE = 7;
const NUM_MODULES = 7;

// Consts for the command parser
const VALID_COMMS = ["coin", "roll", "flip", "dice", "oblique", "image", "tarot", "reddit", "trope", "help", "random"];
const PRIVACY_ARGS = ["private", "me"];
const VERB_ARGS = ["more", "verbose", "-v"];
const FIRST_ARG_ERROR = `I don't understand that command. Type **${prefix}help** for more details.`

// const WRONG_DICE_WARNING = "I don't have that die, so I'll roll a random one.\nI have a 2-sided coin, and 4-, 6-, 8-, 10-, 12-, 20-, and 100-sided dice.\n\n";

// // Consts for the Tarot module
// const MAJOR = 0;
// const WANDS = 1;
// const CUPS = 2;
// const SWORDS = 3;
// const PENTACLES = 4;
// const DECK_LENGTH = 78;
// const UPRIGHT_ODDS = 0.85;

// const JSON_POST_LIMIT = 500;

// const VERB_ARGS = ["more", "verbose", "-v", "waite"];
// const VERB_ARG_ERROR = "Sorry, I can't tell how verbose you want the Tarot card to be.";

/* RANDOMNESS MODULE OBJECTS */
const diceModule = require("./modules/dice.js");
const coinModule = require("./modules/coins.js");
const obliqueModule = require("./modules/oblique.js");
const imageModule = require("./modules/image.js");
const tarotModule = require("./modules/tarot.js");
const redditModule = require("./modules/reddit.js");
const tropeModule = require("./modules/trope.js");
const helpModule = require("./modules/help.js");

/* HELPER FUNCTIONS */

async function moduleSelect(m, verbose, n) {
  try {
    switch (m) {
      case DICE_MODULE:
        // console.log("Invoking module " + DICE_MODULE);
        return diceModule.invoke(n);
        break;
      case OBLIQUE_MODULE:
        // console.log("Invoking module " + OBLIQUE_MODULE);
        return obliqueModule.invoke();
        break;
      case IMAGE_MODULE:
        // console.log("Invoking module " + IMAGE_MODULE);
        let result = await imageModule.invoke();
        return result;
        break;
      case TAROT_MODULE:
        // console.log("Invoking module " + TAROT_MODULE);
        if (verbose) {
          let result = await tarotModule.invoke(true);
          return result;
        } else {
          let result = await tarotModule.invoke(false);
          return result;
        }
        break;
      case REDDIT_MODULE:
        // console.log("Invoking module " + REDDIT_MODULE);
        return redditModule.invoke();
        break;
      case TROPE_MODULE:
        // console.log("Invoking module " + TROPE_MODULE);
        return tropeModule.invoke();
        break;
      case COIN_MODULE:
        // console.log("Invoking module " + DICE_MODULE);
        return coinModule.invoke(n);
        break;
      case HELP_MODULE:
        // console.log("Invoking module " + TROPE_MODULE);
        return helpModule.invoke(n);
        break;
      default:
        console.log("ERROR: Attempted to invoke a nonexistent module");
        return "**ERROR:** Attempted to invoke a nonexistent module";
    }
  } catch (err) {
    console.log(err);
  }
};

function randomModule() {
  let result = Math.floor(Math.random() * NUM_MODULES);
  console.log("Selecting module " + result);
  return result;
};

// Passes a msg; returns whether or not this bot sent the msg
function notBot(msg) {
  // The ternary prevents authorID from ever being null and crashing the fx
  // i.e. If the bot sent the msg, set authorID to clientID by force
  // Otherwise set authorID to the ID of whoever sent the msg
  let authorID = msg.author.id === null ? clientID : Number(msg.author.id);
  // console.log('Determining whether the bot sent this message.');
  // console.log('    Sender ID: ' + authorID + " (" + typeof(authorID) + ")");
  // console.log('    Client ID: ' + clientID + " (" + typeof(clientID) + ")");
  try {
    return authorID != clientID;
  } catch (error) {
    console.log(error);
  }
}

function cmdStringIsValid(msg) {
  // Make sure msg is coming from a real user.
  if (notBot(msg)) {
    console.log("Message from " + msg.author.username +
      " in " + msg.channel.name);
    // Validate correct channel (bot room or DM channel)
    if (msg.channel.name === botRoomName || msg.channel.type == "dm") {
      console.log("Message came from correct channel.");
      // Validate command prefix
      if (msg.content.charAt(0) === prefix) {
        // console.log("Message has correct prefix: " + msg.content.charAt(0));
        return true;
      }
      // console.log("INVALID COMMAND: Message has incorrect prefix: "
      //  + msg.content.charAt(0));
      return false;
    }
    // console.log("INVALID COMMAND: Message came from outside the bot room.");
    return false;
  }
  // console.log("INVALID COMMAND: Message came from the bot.")
  return false;
}

/* BOT METHOD CALLS */

// Executes when client starts up
client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
  client.user.setActivity("with aleatoric processes", "PLAYING");
  clientID = Number(client.user.id);
});

// Executes every time a message is posted to any channel
client.on("message", async (msg) => {
  // Validate that message came from another user
  if (cmdStringIsValid(msg)) {
    // Prepare message for parsing
    inputString = msg.content;
    // Drop prefix, trim, and convert to lowercase
    inputString = inputString.trim().toLowerCase().substr(1);
    console.log("Message will be parsed as: " + inputString);
    // Split input into array of arguments
    args = inputString.split(" ");
    console.log("Message split into " + args.length + " arguments");
    for (let i = 0; i < args.length; i++) {
      console.log("Argument " + i + ": " + args[i]);
    }

    /* MAIN COMMAND PARSER */
    if (!VALID_COMMS.includes(args[0])) {
      msg.channel.send(FIRST_ARG_ERROR);
    } else {
      // Function scope variables
      let result = "";
      let privacy_flag = false;

      // Send as DM or as message for everyone?
      if (PRIVACY_ARGS.includes(args[args.length - 1])) {
        privacy_flag = true;
        args.pop();           // Remove last item
      }

      switch (args[0]) {
        case "random":
          let rm = randomModule();
            if (rm === DICE_MODULE) {
              result = await moduleSelect(DICE_MODULE, false, "dR");
            } else {
              result = await moduleSelect(rm, false, null);
            }
          break;
        case "coin":
        case "flip":
          result = await moduleSelect(COIN_MODULE, false,
            (args[1]) ? args[1] : 1);
          break;
        case "roll":
        case "dice":
          result = await moduleSelect(DICE_MODULE, false,
            (args[1]) ? args[1] : "d6");
          break;
        case "oblique":
          result = await moduleSelect(OBLIQUE_MODULE, false, null);
          break;
        case "image":
          result = await moduleSelect(IMAGE_MODULE, false, null);
          break;
        case "tarot":
          result = await moduleSelect(TAROT_MODULE,
            (VERB_ARGS.includes(args[1]) ? true : false), null);
          break;
        case "reddit":
          result = await moduleSelect(REDDIT_MODULE, false, null);
          break;
        case "trope":
          result = await moduleSelect(TROPE_MODULE, false, null);
          break;
        case "help":
          if (args[1]) switch (args[1]) {
            case "dice":
            case "roll":
              result = await moduleSelect(HELP_MODULE, false, DICE_MODULE);
              break;
            case "coin":
            case "flip":
              result = await moduleSelect(HELP_MODULE, false, COIN_MODULE);
              break;
            case "oblique":
              result = await moduleSelect(HELP_MODULE, false, OBLIQUE_MODULE);
              break;
            case "image":
              result = await moduleSelect(HELP_MODULE, false, IMAGE_MODULE);
              break;
            case "tarot":
              result = await moduleSelect(HELP_MODULE, false, TAROT_MODULE);
              break;
            case "reddit":
              result = await moduleSelect(HELP_MODULE, false, REDDIT_MODULE);
              break;
            case "trope":
              result = await moduleSelect(HELP_MODULE, false, TROPE_MODULE);
              break;
            default:
              result = await moduleSelect(HELP_MODULE, false, HELP_MODULE);
              break;
          } else {
            result = await moduleSelect(HELP_MODULE, false, HELP_MODULE);
          }
          break;
        default:
          result = "I don't know if I can do that. Type **?help** for more details.";
          break;
      }

      // Wait for message to form, then route it to its destination
      if (privacy_flag == true) {
        console.log("Sending message privately");
        await msg.author.send(result)
          .catch(err => console.log(err));
      } else {
        console.log("Sending message publicly");
        await msg.channel.send(result)
          .catch(err => console.log(err));
      }

      // Reset
      // console.log("Resetting inputs");
      args = [];
    }
  }
});

// Log the client in using auth token
client.login(process.env.API_KEY);
