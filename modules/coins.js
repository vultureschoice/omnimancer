const MAX_COINS = 50;
const MAX_VERBOSE_COINS = 10;

const INVALID_COINS = ":warning: I don't understand that. You can type **?coin** to flip a coin or **?help coin** for more coin options.";
const TOO_MANY_COINS = `:warning: I can only flip up to **${MAX_COINS} coins at a time**.`;

module.exports = {
  coinLong: ["tails", "heads"],
  coinShort: ["T", "H"],
  invoke: function(n) {
    let coins = n;
    let heads = 0;
    let tails = 0;
    let rolls = [];
    let msg = "";
    let rawResult = "";

    /* VALIDATE INPUT */
    console.log(n);
    if (isNaN(n) || n <= 0) {
      return INVALID_COINS;
    } else if (n > MAX_COINS) {
      return TOO_MANY_COINS;
    }

    /* GENERATE FLIPS */
    msg += "Flipping ";
    if (coins == 1) msg += "a coin.";
    else msg += coins + " coins.";

    msg += "\nYou flipped ";
    if (coins === 1) {
      msg += "**" + this.coinLong[Math.floor(Math.random() * 2)] + "**.";
    } else if (coins <= MAX_VERBOSE_COINS) {
      for (let i = 0; i < coins; i++) {
        rolls[i] = Math.floor(Math.random() * 2);
        msg += this.coinLong[rolls[i]];
        if (i < coins - 1) msg += ", ";
      }
    } else {
      for (let i = 0; i < coins; i++) {
        rolls[i] = Math.floor(Math.random() * 2);
        rawResult += this.coinShort[rolls[i]];
      }
    }

    // console.log(rawResult);
    // Bold all heads if using shorthand
    if (coins > MAX_VERBOSE_COINS) {
      let result = "";
      for (let i = 0; i < coins; i++) {
        let x = 0;
        // console.log("Searching index " + i + ": " + rawResult[i]);
        if (rawResult[i] === "H") {
          while (rawResult[i + x] === "H") x++;
          // console.log("Consecutive heads from indices " + i + " to " + (i+x));
          result += "**" + rawResult.substring(i, i+x) + "**";
          i += x - 1;
        } else {
          result += rawResult[i];
        }
        // console.log(result);
      }
      msg += result;
    } else {
      msg += rawResult;
    }

    /* GENERATE TOTAL */
    if (coins > 1) {
      heads = rolls.reduce((acc, cur) => acc + cur);
      tails = coins - heads;
      msg += ".\nThat's a total of **" + heads + " head" +
        (heads === 1 ? "" : "s") + "** and **" +
        tails + " tail" + (tails === 1 ? "" : "s") + "**.";
    }

    /* RETURN RESULT */
    return msg;
  }
};
