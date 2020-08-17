const Discord = require("discord.js");

// Consts for invoking modules
const DICE_MODULE = 0;
const OBLIQUE_MODULE = 1;
const IMAGE_MODULE = 2;
const TAROT_MODULE = 3;
const REDDIT_MODULE = 4;
const TROPE_MODULE = 5;
const COIN_MODULE = 6;
const HELP_MODULE = 7;

module.exports = {
  text: require("../moduleDescriptions.json"),
  invoke: function(num) {
    switch (num) {
      case DICE_MODULE:
        return new Discord.MessageEmbed()
          .setTitle("Tabletop Dice")
          .setDescription(this.text.dice.desc)
          .addFields({
            name: "Suggestions",
            value: this.text.dice.sugg
          }, {
            name: "Commands",
            value: this.text.dice.comm
          })
          .setFooter("Omnimancer Help");
        break;
      case OBLIQUE_MODULE:
        return new Discord.MessageEmbed()
          .setTitle("Oblique Strategies")
          .setDescription(this.text.oblique.desc)
          .addFields({
            name: "Suggestions",
            value: this.text.oblique.sugg
          }, {
            name: "Commands",
            value: this.text.oblique.comm
          })
          .setFooter("Omnimancer Help");
        break;
      case IMAGE_MODULE:
        return new Discord.MessageEmbed()
          .setTitle("Random images")
          .setDescription(this.text.image.desc)
          .addFields({
            name: "Suggestions",
            value: this.text.image.sugg
          }, {
            name: "Commands",
            value: this.text.image.comm
          })
          .setFooter("Omnimancer Help");
        break;
      case TAROT_MODULE:
        return new Discord.MessageEmbed()
          .setTitle("Random Tarot cards")
          .setDescription(this.text.tarot.desc)
          .addFields({
            name: "Suggestions",
            value: this.text.tarot.sugg
          }, {
            name: "Commands",
            value: this.text.tarot.comm
          })
          .setFooter("Omnimancer Help");
        break;
      case REDDIT_MODULE:
        return new Discord.MessageEmbed()
          .setTitle("Random Reddit prompts")
          .setDescription(this.text.reddit.desc)
          .addFields({
            name: "Suggestions",
            value: this.text.reddit.sugg
          }, {
            name: "Commands",
            value: this.text.reddit.comm
          })
          .setFooter("Omnimancer Help");
        break;
      case TROPE_MODULE:
        return new Discord.MessageEmbed()
          .setTitle("Random TV Tropes")
          .setDescription(this.text.trope.desc)
          .addFields({
            name: "Suggestions",
            value: this.text.trope.sugg
          }, {
            name: "Commands",
            value: this.text.trope.comm
          })
          .setFooter("Omnimancer Help");
        break;
      case HELP_MODULE:
        return new Discord.MessageEmbed()
          .setTitle("Omnimancer Help")
          .setDescription(this.text.help.desc)
          .addFields({
            name: "Commands",
            value: this.text.help.comm
          }, {
            name: "Help Commands",
            value: this.text.help.help,
            inline: true
          }, {
            name: "Examples",
            value: this.text.help.exam,
            inline: true
          })
          .setFooter("Omnimancer Help");
        break;
      case COIN_MODULE:
        return new Discord.MessageEmbed()
          .setTitle("Coins")
          .setDescription(this.text.coin.desc)
          .addFields({
            name: "Suggestions",
            value: this.text.coin.sugg
          }, {
            name: "Commands",
            value: this.text.coin.comm
          })
          .setFooter("Omnimancer Help");
        break;
      default:
        timeLog("ERROR: Help module couldn't select anything");
        return "**ERROR:** Help module couldn't select anything";
    }
  }
};
