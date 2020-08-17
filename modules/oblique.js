const Discord = require("discord.js");

module.exports = {
  // Load Oblique Strategies cards from external JSON file
  strats: require("../obliqueStrats.json"),
  invoke: function() {
    // Select a random index
    let index = Math.floor(Math.random() * this.strats.length);
    // Return result
    return new Discord.MessageEmbed()
      .setTitle(this.strats[index])
      .addField("\u200B", "\u200B") // Blank space
      .setFooter("Oblique Strategies\nby Brian Eno & Peter Schmidt");
  }
};
