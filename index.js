/* INITIALIZATION */

// Import discord.js
const Discord = require('discord.js');
// Create new Discord client, enabling the methods that make the bot work
const client = new Discord.Client();
const botRoomName = "bot-room";
const prefix = '!';

// Import NPM libraries for online content searching
const got = require('got'); // makes HTTP calls
const cheerio = require('cheerio'); // wrapper for jQuery

// Hide API key
// TODO: Disable on Heroku server because it handles env variables differently
// require('dotenv').config();

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

// Look closely: the help module will never be called randomly
const HELP_MODULE = 6;
const NUM_MODULES = 6;

// Consts for the command parser
const VALID_FIRST_ARGS = ["me", "all", "help"];
const FIRST_ARG_ERROR = "I don't understand that command. Type **!inspire help** for more details."

const WRONG_DICE_WARNING = "I don't have that die, so I'll roll a random one.\nI have a 2-sided coin, and 4-, 6-, 8-, 10-, 12-, 20-, and 100-sided dice.\n\n";

// Consts for the Tarot module
const MAJOR = 0;
const WANDS = 1;
const CUPS = 2;
const SWORDS = 3;
const PENTACLES = 4;
const DECK_LENGTH = 78;

const JSON_POST_LIMIT = 500;

const VERB_ARGS = ["more", "verbose", "-v"];
const VERB_ARG_ERROR = "Sorry, I can't tell how verbose you want the Tarot card to be.";

/* RANDOMNESS MODULE OBJECTS */

const diceModule = {
  dice: [2, 4, 6, 8, 10, 12, 20, 100],
  invoke: function (n) {
    // timeLog(`Preparing to roll ${n}-sided die`);
    let index = 0, die, warn = "";
    // User selected die
    if (this.dice.includes(n)) {
      die = n;
    // Select a random die
    } else {
      index = Math.floor(Math.random() * this.dice.length);
      die = this.dice[index];
      if (n === 0) {
        warn = WRONG_DICE_WARNING;
      }
    }

    let roll = Math.ceil(Math.random() * die);

    // Return result
    if (die === 2) { // If it flips a coin (because dice[0] = 2)
      return warn + "Flipping a coin. I got **" +
        (roll === 1 ? "heads" : "tails") + "**.";
    }
    else {
      return warn + "Rolling 1d" + die + ". I got **" + roll + "**.";
    }
  }
};

const obliqueModule = {
  // Load Oblique Strategies cards from external JSON file
  strats: require('./obliqueStrats.json'),
  invoke: function () {
    // Select a random index
    let index = Math.floor(Math.random() * this.strats.length);
    // Return result
    return new Discord.MessageEmbed()
      .setTitle(this.strats[index])
      .addField('\u200B', '\u200B') // Blank space
      .setFooter("Oblique Strategies\nby Brian Eno & Peter Schmidt");
  }
};

const imageModule = {
  // Most code taken from a YouTuber called Undo
  terms: require('./searchTerms.json'),
  result: "",
  invoke: async function () { // async because it makes an HTTP call
    try {
      // Generate a Dogpile image search from a list of terms
      let termIndex = Math.floor(Math.random() * this.terms.length);
      let term = this.terms[termIndex];
      timeLog("Searching Dogpile for: " + term);
      let url = "https://www.dogpile.com/serp?qc=images&q=" + term;

      // Use Got to take HTML code from Dogpile Image Search
      const response = await got(url);
      // Load Dogpile's HTML code into Cheerio
      let $ = cheerio.load(response.body);
      // Find all RELEVANT image urls and load them into an array
      let links = $(".image a.link");
      let urls = new Array(links.length).fill(0).map((v, i) => links.eq(i).attr("href"));
      // Pick a random url from the array
      let imgIndex = Math.floor(Math.random() * urls.length);
      this.result = urls[imgIndex];
      timeLog("HTTP request complete. Image URL loaded: " + this.result);
      return this.result;
    }
    catch (err) {
      timeLog(err);
    }
  }
};

const tarotModule = {
  // The Tarot deck is an array of objects, stored as a JSON file
  deck: require('./tarotCards.json'),
  suits: ["Major Arcana", "Wands", "Cups", "Swords", "Pentacles"],
  numbers: [null, "Ace", "Two", "Three", "Four", "Five", "Six", "Seven",
    "Eight", "Nine", "Ten", "Page", "Knight", "Queen", "King"],
  colors: ["#E5E0ED", "#C1B928", "#6286B6", "#550C01", "#576A1C"], // match suits
  invoke: async function (verbose) {
    // Validate verbosity argument
    if (typeof(verbose) !== "boolean") return VERB_ARG_ERROR;
    let index = Math.floor(Math.random() * DECK_LENGTH);
    // 80% chance of being upright
    let upright = Math.floor(Math.random()) < 0.8 ? true : false;
    // if (upright) timeLog("Card is upright");
    // else timeLog("Card is reversed");

    // Generate title
    let title = "";
    if (this.deck[index].suit === 0) {     // Major Arcana
      title = this.deck[index].name;
    } else {                               // Minor Arcana
      title = this.numbers[this.deck[index].number] + " of "
        + this.suits[this.deck[index].suit];
    }
    if (!upright) title += " (reversed)";

    // Generate image filename
    image = this.deck[index].img + (!upright ? "r" : "") + ".jpg"
    timeLog("Fetching image: " + image);

    // Generate url
    url = "https://www.tarot.com/tarot/cards/" + this.deck[index].url
      + "/rider";

    // Make an embed
    if (verbose) {
      timeLog("Drawing Tarot card verbosely");
      let result = await new Discord.MessageEmbed()
        .setTitle(title)
        .setURL(url)
        .setColor(this.colors[this.deck[index].suit])
        .setImage("../tarot_images/" + image)
        .addFields(
          {name: 'Meaning', value:
            (upright ? this.deck[index].meaning : this.deck[index].rev)}
        )
        .setFooter("Description from Waite\'s Pictorial Guide to the Tarot"
          + "\nImage © U.S. Games Systems, Inc.");
        return result;
    } else {
      timeLog("Drawing Tarot card tersely");
      let result = await new Discord.MessageEmbed()
        .setTitle(title)
        .setURL(url)
        .setColor(this.colors[this.deck[index].suit])
        // TODO: delete .attachFiles() lines when uploaded to the cloud
        .setImage("../tarot_images/" + image)
        .setFooter('Image © U.S. Games Systems, Inc.');
      return result;
    }
  }
};

const redditModule = {
  subreddits: require('./subreddits.json'),
  flairs: ["Prompt", "Writing Prompt", "Thematic Prompt", "Dialogue Prompt",
    "Miscellaneous Prompt", "Reality Fiction", "Simple Prompt", "Image Prompt",
    "Picture Prompt"],
  titleFlairs: ["[WP]", "[Prompt]", "[SP]"],
  invoke: async function () {
    // Generate URL to pull post from
    let subredditIndex = Math.floor(Math.random() * this.subreddits.length);
    const sr = this.subreddits[subredditIndex];
    timeLog("Pulling a random post from r/" + sr);
    let url = "https://www.reddit.com/r/" + sr + ".json?limit="
      + JSON_POST_LIMIT;
    timeLog("Extracting JSON data from " + url);

    // Next few lines stolen from the "reddit-simple" npm package
    const res = await got.get(url).json();
    const posts = res.data.children.map(i => i.data.title);
    const urls = res.data.children.map(i => i.data.url);
    const flairtexts = res.data.children.map(i => i.data.link_flair_text);
    const thumbs = res.data.children.map(i => i.data.thumbnail);
    const authors = res.data.children.map(i => i.data.author);

    // Validate flair or title substrings to filter out off-topic posts
    let i;
    do {
      i = Math.floor(Math.random() * posts.length);
    } while (!this.flairs.includes(flairtexts[i]) &&
      !this.titleFlairs.includes(posts[i]));
    timeLog(i);

    // Make embed
    // Truncate title if necessary
    let embedTitle = posts[i].length > 255 ?
      posts[i].slice(0, 252) + "..." : posts[i];
    if (thumbs[i].includes("jpg")) { // Image posts
      return new Discord.MessageEmbed()
        .setTitle(embedTitle)
        .setURL(urls[i])
        .setImage(thumbs[i])
        .setFooter("Prompt from r/" + sr + "\nposted by u/" + authors[i]);
    } else { // Text posts
      return new Discord.MessageEmbed()
        .setTitle(embedTitle)
        .setURL(urls[i])
        .addField('\u200B', '\u200B') // Blank space
        .setFooter("Prompt from r/" + sr + "\nposted by u/" + authors[i]);
    }
  }
};

const tropeModule = {
  tropes: require('./gothicTropes.json'),
  invoke: function () {
    let i = Math.floor(Math.random() * this.tropes.length);
    return new Discord.MessageEmbed()
      .setTitle(this.tropes[i].name)
      .setURL("https://tvtropes.org/pmwiki/pmwiki.php/" + this.tropes[i].url)
      .addField('\u200B', '\u200B') // Blank space
      .setFooter("From TV Tropes' Index of Gothic Horror Tropes");
  }
};

const helpModule = {
  text: require('./moduleDescriptions.json'),
  invoke: function (num) {
    switch(num) {
      case DICE_MODULE:
        return new Discord.MessageEmbed()
          .setTitle("Dice and Coins")
          .setDescription(this.text.dice.desc)
          .addFields(
              {name: 'Suggestions', value: this.text.dice.sugg },
          		{name: 'Commands', value: this.text.dice.comm }
          	)
          .setFooter("Omnimancer Help");
        break;
      case OBLIQUE_MODULE:
        return new Discord.MessageEmbed()
          .setTitle("Oblique Strategies")
          .setDescription(this.text.oblique.desc)
          .addFields(
              {name: 'Suggestions', value: this.text.oblique.sugg },
              {name: 'Commands', value: this.text.oblique.comm }
          	)
          .setFooter("Omnimancer Help");
        break;
      case IMAGE_MODULE:
        return new Discord.MessageEmbed()
          .setTitle("Random images")
          .setDescription(this.text.image.desc)
          .addFields(
              {name: 'Suggestions', value: this.text.image.sugg},
          		{name: 'Commands', value: this.text.image.comm }
          	)
          .setFooter("Omnimancer Help");
        break;
      case TAROT_MODULE:
        return new Discord.MessageEmbed()
          .setTitle("Random Tarot cards")
          .setDescription(this.text.tarot.desc)
          .addFields(
              {name: 'Suggestions', value: this.text.tarot.sugg},
              {name: 'Commands', value: this.text.tarot.comm}
          	)
          .setFooter("Omnimancer Help");
        break;
      case REDDIT_MODULE:
        return new Discord.MessageEmbed()
          .setTitle("Random Reddit prompts")
          .setDescription(this.text.reddit.desc)
          .addFields(
              {name: 'Suggestions', value: this.text.reddit.sugg},
          		{name: 'Commands', value: this.text.reddit.comm }
          	)
          .setFooter("Omnimancer Help");
        break;
      case TROPE_MODULE:
        return new Discord.MessageEmbed()
          .setTitle("Random TV Tropes")
          .setDescription(this.text.trope.desc)
          .addFields(
              {name: 'Suggestions', value: this.text.trope.sugg},
          		{name: 'Commands', value: this.text.trope.comm}
          	)
          .setFooter("Omnimancer Help");
        break;
      // General help
      case HELP_MODULE:
        return new Discord.MessageEmbed()
          .setTitle("Omnimancer Help")
          .setDescription(this.text.help.desc)
          .addFields(
              {name: 'Commands', value: this.text.help.comm},
              {name: 'Examples', value: this.text.help.exam}
            )
          .setFooter("Omnimancer Help");
          break;
      default:
        timeLog("ERROR: Help module couldn't select anything");
        return "**ERROR:** Help module couldn't select anything";
    }
  }
};

/* HELPER FUNCTIONS */

async function moduleSelect(m, verbose, n) {
  try {
    switch (m) {
      case DICE_MODULE:
        // timeLog("Invoking module " + DICE_MODULE);
        return diceModule.invoke(n);
        break;
      case OBLIQUE_MODULE:
        // timeLog("Invoking module " + OBLIQUE_MODULE);
        return obliqueModule.invoke();
        break;
      case IMAGE_MODULE:
        // timeLog("Invoking module " + IMAGE_MODULE);
        let result = await imageModule.invoke();
        return result;
        break;
      case TAROT_MODULE:
        // timeLog("Invoking module " + TAROT_MODULE);
        if (verbose) {
          let result = await tarotModule.invoke(true);
          return result;
        }
        else {
          let result = await tarotModule.invoke(false);
          return result;
        }
        break;
      case REDDIT_MODULE:
        // timeLog("Invoking module " + REDDIT_MODULE);
        return redditModule.invoke();
        break;
      case TROPE_MODULE:
        // timeLog("Invoking module " + TROPE_MODULE);
        return tropeModule.invoke();
        break;
      case HELP_MODULE:
        // timeLog("Invoking module " + TROPE_MODULE);
        return helpModule.invoke(n);
        break;
      default:
        timeLog("ERROR: Attempted to invoke a nonexistent module");
        return "**ERROR:** Attempted to invoke a nonexistent module";
    }
  } catch (err) {
    timeLog(err);
  }
};

function randomModule() {
  let result = Math.floor(Math.random() * NUM_MODULES);
  timeLog("Selecting module " + result);
  return result;
};

// Passes a msg; returns whether or not this bot sent the msg
function notBot(msg) {
  // The ternary prevents authorID from ever being null and crashing the fx
  // i.e. If the bot sent the msg, set authorID to clientID by force
  // Otherwise set authorID to the ID of whoever sent the msg
  let authorID = msg.author.id === null ? clientID : Number(msg.author.id);
  // timeLog('Determining whether the bot sent this message.');
  // timeLog('    Sender ID: ' + authorID + " (" + typeof(authorID) + ")");
  // timeLog('    Client ID: ' + clientID + " (" + typeof(clientID) + ")");
  try {
    return authorID != clientID;
  } catch (error) {
    timeLog(error);
  }
}

// Passes a number and length; prints it with padding zeros up to length
// Stolen from w3schools
function padZero(x, n) {
  let _x = x.toString();
  while (_x.length < n) {
    _x = "0" + _x;
  }
  return _x;
}

// Passes a string; prints it to the console with a timestamp
// Mostly stolen from w3schools
function timeLog(str) {
  let t = new Date(Date.now());
  let h = padZero(t.getHours(), 2);
  let m = padZero(t.getMinutes(), 2);
  let s = padZero(t.getSeconds(), 2);
  let ms = padZero(t.getMilliseconds(), 3);
  let d = ":"; // delimiter
  let timestamp = "[" + h + d + m + d + s + d + ms + "] ";
  console.log(timestamp + str);
}

function cmdStringIsValid(msg) {
  // Make sure msg is coming from a real user.
  if (notBot(msg)) {
    timeLog('Message from ' + msg.author.username
      + ' in ' + msg.channel.name);
    // Validate correct channel (bot room or DM channel)
    if (msg.channel.name === botRoomName || msg.channel.type == "dm") {
      timeLog('Message came from correct channel.');
      // Validate command prefix
      if (msg.content.charAt(0) === prefix) {
        // timeLog('Message has correct prefix: ' + msg.content.charAt(0));
        return true;
      }
      // timeLog('INVALID COMMAND: Message has incorrect prefix: '
      //  + msg.content.charAt(0));
      return false;
    }
    // timeLog('INVALID COMMAND: Message came from outside the bot room.');
    return false;
  }
  // timeLog('INVALID COMMAND: Message came from the bot.')
  return false;
}

/* BOT METHOD CALLS */

// Executes when client starts up
client.on("ready", () => {
  timeLog(`Logged in as ${client.user.tag}`);
  client.user.setActivity("with aleatoric processes", "PLAYING");
  clientID = Number(client.user.id);
});

// Executes every time a message is posted to any channel
client.on('message', async (msg) => {
  // Validate that message came from another user
  if (cmdStringIsValid(msg)) {
    // Prepare message for parsing
    inputString = msg.content;
    // Drop prefix, trim, and convert to lowercase
    inputString = inputString.trim().toLowerCase().substr(1);
    timeLog("Message will be parsed as: " + inputString);
    // Split input into array of arguments
    args = inputString.split(' ');
    timeLog("Message split into " + args.length + " arguments");
    for (let i = 0; i < args.length; i++) {
      timeLog("Argument " + i + ": " + args[i]);
    }

    /* MAIN COMMAND PARSER */

    if (args[0] == 'inspire') {
      /* ARGUMENT 1
      !inspire me sends results of a random module as a DM to the user
      !inspire all posts these results to the bot room
      */
      if (!VALID_FIRST_ARGS.includes(args[1])) {
        msg.channel.send(FIRST_ARG_ERROR);
      }
      else { // At least 2 arguments
        let result;
        if (args.length == 2) { // Exactly 2 arguments
          // timeLog('Exactly 2 arguments: Select random module');
          if (args[1] == "help") result = await moduleSelect(HELP_MODULE, false, null);
          else result = await moduleSelect(randomModule(), false, null);
        }
        else if (args[1] != "help") { // More than 2 arguments
          // timeLog('Multiple arguments: Select module manually');
          switch (args[2]) {
            case 'dice':
              let n = null;
              if (args[3]) switch (args[3]) {
                case '2': case '4': case '6': case '8':
                case '10': case '12': case '20': case '100':
                  n = Number(args[3]);
                  // timeLog(`Preparing to roll ${n}-sided die`);
                  break;
                default:
                  n = 0;
                  break;
              }
              result = await moduleSelect(DICE_MODULE, false, n);
              break;
            case 'oblique':
              result = await moduleSelect(OBLIQUE_MODULE, false, null);
              break;
            case 'image':
              result = await moduleSelect(IMAGE_MODULE, false, null);
              break;
            case 'tarot':
              result = await moduleSelect(TAROT_MODULE,
                (VERB_ARGS.includes(args[3]) ? true : false), null);
              break;
            case 'reddit':
              result = await moduleSelect(REDDIT_MODULE, false, null);
              break;
            case 'trope':
              result = await moduleSelect(TROPE_MODULE, false, null);
              break;
            case 'help':
              result = await moduleSelect(HELP_MODULE, false, HELP_MODULE);
              break;
            default:
              result = "I don't know if I can do that. Type **!inspire help** for more details.";
          }
        }

        // Wait for message to form, then route it to its destination
        if (args[1] == "me") {
          await msg.author.send(result)
            .catch(err => timeLog(err));
        }
        else if (args[1] == "all") {
          await msg.channel.send(result)
            .catch(err => timeLog(err));
        }

        // Help command parser
        else if (args[1] == "help") {
          let result = await moduleSelect(HELP_MODULE, false, HELP_MODULE);
          if (args[2]) switch (args[2]) {
            case 'dice':
              result = await moduleSelect(HELP_MODULE, false, DICE_MODULE);
              break;
            case 'oblique':
              result = await moduleSelect(HELP_MODULE, false, OBLIQUE_MODULE);
              break;
            case 'image':
              result = await moduleSelect(HELP_MODULE, false, IMAGE_MODULE);
              break;
            case 'tarot':
              result = await moduleSelect(HELP_MODULE, false, TAROT_MODULE);
              break;
            case 'reddit':
              result = await moduleSelect(HELP_MODULE, false, REDDIT_MODULE);
              break;
            case 'trope':
              result = await moduleSelect(HELP_MODULE, false, TROPE_MODULE);
              break;
            default:
              result = await moduleSelect(HELP_MODULE, false, HELP_MODULE);
              break;
          }
          await msg.channel.send(result)
            .catch(err => timeLog(err));
        }
      }
    }

    // Reset
    // timeLog('Resetting inputs');
    args = [];
  }
});

// Log the client in using auth token
client.login(process.env.API_KEY);
