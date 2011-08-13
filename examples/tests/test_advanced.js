var domTest = require("domtest");

// overriding default globals, which are ["$", "jQuery", "_"]
domTest.defaultGlobals = ["$", "MyAwesomeObject"];

module.exports = domTest.testCase({

    html: "base.htm",
    scripts: ["js/jquery.min.js", "js/myawesome.js"],

    setUp: function(callback) {
        // optional: do some set up stuff here...
        callback();
    },

    testjQuery: function(test) {
        // it loaded jQuery from the script tag in the HTML
        var title = this.$("h1").text()
        test.equals(title, "LOL I HAZ A CAT");
        test.done();
    },

    testMyLibrary: function(test) {
        // it pulled MyAwesomeObject from the extra scripts
        var result = this.MyAwesomeObject.doIHazCat();
        test.ok(result);
        test.done();
    },

    tearDown: function(callback) {
        // optional: undo what you did in setUp
        callback();
    }

});
