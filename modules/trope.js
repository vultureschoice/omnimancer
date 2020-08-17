const Discord = require("discord.js");

module.exports = {
  tropes: require("../gothicTropes.json"),
  invoke: function() {
    let i = Math.floor(Math.random() * this.tropes.length);
    return new Discord.MessageEmbed()
      .setTitle(this.tropes[i].name)
      .setURL("https://tvtropes.org/pmwiki/pmwiki.php/" + this.tropes[i].url)
      .addField("\u200B", "\u200B") // Blank space
      .setFooter("From TV Tropes' Index of Gothic Horror Tropes");
  }
};
