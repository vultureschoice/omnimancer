const Discord = require("discord.js");

const MAJOR = 0;
const WANDS = 1;
const CUPS = 2;
const SWORDS = 3;
const PENTACLES = 4;

const DECK_LENGTH = 78;
const UPRIGHT_ODDS = 0.85;

const VERB_ARG_ERROR = "Sorry, I can't tell how verbose you want the Tarot card to be. (VERB_ARG_ERROR)";

module.exports = {
  // The Tarot deck is an array of objects, stored as a JSON file
  deck: require("../tarotCards.json"),
  suits: ["Major Arcana", "Wands", "Cups", "Swords", "Pentacles"],
  numbers: [null, "Ace", "Two", "Three", "Four", "Five", "Six", "Seven",
    "Eight", "Nine", "Ten", "Page", "Knight", "Queen", "King"
  ],
  colors: ["#E5E0ED", "#C1B928", "#6286B6", "#550C01", "#576A1C"], // match suits
  invoke: async function(verbose) {
    // Validate verbosity argument
    if (typeof(verbose) !== "boolean") return VERB_ARG_ERROR;
    let index = Math.floor(Math.random() * DECK_LENGTH);
    // 80% chance of being upright
    let upright = Math.random() < UPRIGHT_ODDS ? true : false;
    // if (upright) console.log("Card is upright: " + upright);
    // else console.log("Card is reversed" + upright);

    // Generate title
    let title = "";
    if (this.deck[index].suit === 0) { // Major Arcana
      title = this.deck[index].name;
    } else { // Minor Arcana
      title = this.numbers[this.deck[index].number] + " of " +
        this.suits[this.deck[index].suit];
    }
    if (!upright) title += " (reversed)";

    // Generate image filename
    let image = this.deck[index].img + (!upright ? "r" : "") + ".jpg"
    console.log("Fetching image: " + image);

    // Generate url
    let url = "https://www.tarot.com/tarot/cards/" + this.deck[index].url +
      "/rider";

    // Generate image url
    let imgUrl = "https://raw.githubusercontent.com/vultureschoice/omnimancer/" +
      "master/tarot_images/" + image;

    // Make an embed
    if (verbose) {
      console.log("Drawing Tarot card verbosely");
      let result = await new Discord.MessageEmbed()
        .setTitle(title)
        .setURL(url)
        .setColor(this.colors[this.deck[index].suit])
        .setImage(imgUrl)
        .addFields({
          name: "Meaning",
          value: (upright ? this.deck[index].meaning : this.deck[index].rev),
          inline: true
        })
        .setFooter("Description from Waite\'s Pictorial Guide to the Tarot" +
          "\nImage © U.S. Games Systems, Inc.");
      return result;
    } else {
      console.log("Drawing Tarot card tersely");
      let result = await new Discord.MessageEmbed()
        .setTitle(title)
        .setURL(url)
        .setColor(this.colors[this.deck[index].suit])
        .setImage(imgUrl)
        .setFooter("Image © U.S. Games Systems, Inc.");
      return result;
    }
  }
};
