window.RegEng = function(flags) {
  newInstance = Object.create(RegEngMethods);
  newInstance.current = "";
  newInstance.groups = [];
  newInstance.fromStart = false;
  newInstance.toEnd = false;
  return newInstance;
};

var RegEngMethods = {
  make: function () {
    //TODO: include error handling for invalid expressions
    var regExpStr = this.fromStart ? "^" : "";
    if (this.groups.length) {
      if (this.current.length) {
        this.groups.push(this.current);
      }
      regExpStr += "(" + this.groups.join(")(") + ")";
    }
    else {
      regExpStr += this.current;
    }
    regExpStr += this.toEnd ? "$" : "";
    return new RegExp(regExpStr);
  },

  escape: function (string) {
    /*FULL LIST OF SPECIAL CHARACTERS FOR REFERENCE:
      \ ^ $ {} [] () . * + ? <>
      (hyphen will be handled circumstanctially)
    */
    var escapees = {
      "\\": "\\\\",
      "^" : "\\^",
      "$" : "\\$",
      "{" : "\\{",
      "}" : "\\}",
      "[" : "\\[",
      "]" : "\\]",
      "(" : "\\(",
      ")" : "\\)",
      "." : "\\.",
      "*" : "\\*",
      "+" : "\\+",
      "?" : "\\?",
      "<" : "\\<", 
      ">" : "\\>" 
    };
    return string
      .split("")
      .map(function (char) {
        return escapees[char] || char;
      })
      .join("");
  },

  theString: function (string) {
    this.current += this.escape(string);
    return this;
  },

  aLetter: function () {
    var flags = getFlags.call(arguments);
    if (flags.U) {
      this.current += "[A-Z]";
    }
    else if (flags.L) {
      this.current += "[a-z]";
    }
    else {
      this.current += "[A-Za-z]";
    }
    return this;
  },

  aNumber: function () {
    this.current += "\\d";
    return this;
  },

  aVowel: function () {
    var flags = getFlags.call(arguments);
    var vowels = flags.Y ? "aeiouy" : "aeiou";
    if (flags.U) {
      vowels = vowels.toUpperCase();
    }
    else if (flags.L) {
      void 0;
    }
    else {
      vowels += vowels.toUpperCase();
    }
    this.current += "[" + vowels + "]";
    return this;
  },

  aConsonant: function () {
    var flags = getFlags.call(arguments);
    var consonants = !flags.Y ? "bcdfghjklmnpqrstvwxyz" : "bcdfghjklmnpqrstvwxz";
    if (flags.U) {
      consonants = consonants.toUpperCase();
    }
    else if (flags.L) {
      void 0;
    }
    else {
      consonants += consonants.toUpperCase();
    }
    this.current += "[" + consonants + "]";
    return this;
  },

  aLetterOrNumber: function () {
    this.current += "\\w";
    return this;
  },

  whiteSpace: function () {
    this.current += "\\s";
    return this;
  },

  /* TODO:
  not: function () {

  },
  */

  anything: function () {
    this.current += ".";
    return this;
  },

  ofRange: function (n, m) {
    this.current += "{" + n + "," + m + "}";
    return this;
  },

  ofOneOrMore: function () {
    this.current += "+";
    return this;
  },

  ofZeroOrMore: function () {
    this.current += "*";
    return this;
  },

  /*TODO, figure out how to quantiy entire capture groups*/
  optional: function () {

  },

  then: function () {
    this.groups.push(this.current);
    this.current = "";
    return this;
  },

  either: function (strings) {
    this.current += "(" + 
      strings
        .map(this.escape)
        .join("|") +
      ")";
    return this;
  },

  anyIn: function (string) {
    string = this.escape(string);

    //dashed in the first or last part of the brackets should not be escaped
    if (string.length <= 2) {
      this.current = "[" + string + "]";
    }
    else {
      this.current =
        "[" +
          string[0] +
          string.slice(1, string.length).replace("-", "\\-") +
          string[string.length] +
        "]";
    }
    
    return this;
  },

  fromStart: function () {
    this.fromStart = true;
    return this;
  },

  toEnd: function () {
    this.toEnd = true;
  }

};

/*HELPERS*/
var getFlags = function (offset) {
  var args = Array.prototype.slice.call(this, offset || 0);
  var flags = {};
  for (var i = 0; i < args.length; i++) {
    flags[args[i]] = true;
  }
  return flags;
};   
