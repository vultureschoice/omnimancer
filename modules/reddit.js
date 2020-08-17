const Discord = require("discord.js");
const got = require("got");

const JSON_POST_LIMIT = 500;

module.exports = {
  subreddits: require("../subreddits.json"),
  flairs: ["Prompt", "Writing Prompt", "Thematic Prompt", "Dialogue Prompt",
    "Miscellaneous Prompt", "Reality Fiction", "Simple Prompt", "Image Prompt",
    "Picture Prompt"
  ],
  titleFlairs: ["[WP]", "[Prompt]", "[SP]"],
  invoke: async function() {
    // Generate URL to pull post from
    let subredditIndex = Math.floor(Math.random() * this.subreddits.length);
    const sr = this.subreddits[subredditIndex];
    console.log("Pulling a random post from r/" + sr);
    let url = "https://www.reddit.com/r/" + sr + ".json?limit=" +
      JSON_POST_LIMIT;
    console.log("Extracting JSON data from " + url);

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
    console.log(i);

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
        .addField("\u200B", "\u200B") // Blank space
        .setFooter("Prompt from r/" + sr + "\nposted by u/" + authors[i]);
    }
  }
};
