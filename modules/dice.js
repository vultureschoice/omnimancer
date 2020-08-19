const INVALID_COMM_WARNING = ":warning: I don't understand that notation. You can type **?roll d6** for a regular 6-sided die, or **?help dice** for more dice and coin options. Keep in mind I can only roll 99 dice at a time, with up to 100 sides each.";

module.exports = {
  dice: [4, 6, 8, 10, 12, 20, 100],
  fudgeSides: ["-", "0", "+"],
  notation: /\b\d{0,2}d(\d{0,3}|%|f)!*((\+|\-)\d{1,3}\b)?/i, //AdX(!)+-n
  invoke: function(rollRequest) {
    let numDice = 1;          // A
    let dieSize = 6;          // X
    let fudge = false;        // F
    let explode = false;      // !
    let buff = 0;             // + or - buff
    let debuff = false;

    let randNum = 0;
    let rolls = [];           // Contains strings in FUDGE mode; otherwise numbers
    let total = 0;
    let msg = "";

    /* PARSE DICE NOTATION */
    console.log("Parsing dice notation: " + rollRequest);

    // Use regex to validate dice notation input (rollRequest)
    // See if command is valid; if not throw INVALID_COMM_WARNING
    if (!this.notation.test(rollRequest)) {
      console.log("Invalid dice command.");
      return INVALID_COMM_WARNING;
    }

    // Assuming valid input from here on out

    // Find certain indexes in input string
    // Values will default to -1 if not found
    let dIndex = rollRequest.indexOf("d");
    let eIndex = rollRequest.indexOf("!");
    let buffIndex = rollRequest.indexOf("+");
    if (buffIndex == -1) {
      buffIndex = rollRequest.indexOf("-");
      if (buffIndex != -1) debuff = true;
    }

    // Find number of dice
    if (rollRequest.charAt(0) != "d") { // Treat "dX" as "1dX"
      numDice = Number(rollRequest.substring(0, dIndex));
    }
    console.log("Number of dice: " + numDice);

    // Find size/type of die
    if (rollRequest.charAt(dIndex + 1) == "%") {
      dieSize = 100;
    } else if (rollRequest.charAt(dIndex + 1) == "f") {
      fudge = true;
      console.log("FUDGE mode activated.");
    } else if (rollRequest.charAt(dIndex + 1) == "r") {
      console.log("Rolling a random die.");
      dieSize = this.dice[Math.floor(Math.random() * this.dice.length)];
    } else {
      let i = dIndex + 1;
      while (rollRequest.charAt(i).match(/\d/) && i < rollRequest.length) i++;
      dieSize = Number(rollRequest.substring(dIndex + 1, i));
    }
    console.log("Size of dice: " + dieSize);

    // TODO: Drop/keep?

    // Exploding dice?
    if (eIndex != -1 && fudge === false) {
      console.log("Exploding dice on.");
      explode = true;
    }

    // Find n (buff/debuff)
    if (buffIndex != -1) {
      buff = Number(rollRequest.substring(buffIndex + 1,
        rollRequest.length));
    }
    console.log("Buff: " + (debuff ? "-" : "+") + buff);

    /* GENERATE ROLLS */
    msg += "Rolling ";
    if (fudge === true) {
      if (numDice === 1) msg += "a FUDGE die";
      else msg += numDice + " FUDGE dice";
    } else {
      if (numDice === 1) msg += "a " + dieSize + "-sided die";
      else msg += numDice + " " + dieSize + "-sided dice";
    }
    if (explode === true) msg += ", set to explode";
    msg += ".\n"
    msg += "You rolled ";
    if (numDice === 1) {      // One die
      if (fudge === true) {
        msg += "**" + this.fudgeSides[Math.floor(Math.random() * 3)] + "**.";
      } else {
        msg += "**" + Math.ceil(Math.random() * dieSize) + "**.";
      }
    } else {
      if (fudge === true) {   // Multiple die
        for (let i = 0; i < numDice; i++) {
          rolls[i] = this.fudgeSides[Math.floor(Math.random() * 3)];
          msg += rolls[i];
          if (i < numDice - 1) msg += ", ";
        }
      } else {
        for (let i = 0; i < numDice; i++) {
          rolls[i] = Math.ceil(Math.random() * dieSize);
          if (explode === true && rolls[i] === dieSize) {
            numDice++;
            msg += "**" + rolls[i] + "**";
          } else {
            msg += rolls[i];
          }
          if (i < numDice - 1) msg += ", ";
        }
      }
    }

    /* GENERATE TOTAL */
    if (numDice > 1) {
      if (fudge === true) {
        for (let i = 0; i < numDice; i++) {
          if (rolls[i] === "+") total++;
          else if (rolls[i] === "-") total--;
        }
      } else {
        total = rolls.reduce((acc, cur) => acc + cur);
      }
      if (debuff) {
        msg += ".\nYou also have a debuff of " + buff;
      } else if (buff != 0) {
        msg += ".\nYou also have a buff of " + buff;
      }
      if (debuff) total -= buff;
      else total += buff;
      msg += ".\nThat's a total of **" + total + "**.";
    }

    /* RETURN RESULT */
    return msg;
  }
};
