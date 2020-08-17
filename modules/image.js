const got = require("got"); // makes HTTP calls
const cheerio = require("cheerio"); // wrapper for jQuery

module.exports = {
  // Most code taken from a YouTuber called Undo
  terms: require("../searchTerms.json"),
  result: "",
  invoke: async function() { // async because it makes an HTTP call
    try {
      // Generate a Dogpile image search from a list of terms
      let termIndex = Math.floor(Math.random() * this.terms.length);
      let term = this.terms[termIndex];
      console.log("Searching Dogpile for: " + term);
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
      console.log("HTTP request complete. Image URL loaded: " + this.result);
      return this.result;
    } catch (err) {
      console.log(err);
    }
  }
};
