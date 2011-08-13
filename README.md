DomTest
=======
This is just a simple wrapper around NodeUnit and JSDOM for browser-ish
unit / integration tests. Its purpose is to remove some boilerplate from
setting up a DOM and making libraries accessible via the test object.

Installation
------------
Currently, it is only available via git at
http://github.com/joshmarshall/domtest . Once you have downloaded the
project, you can install to your current directory with:

    npm install path/to/domtest

...or, you can install globally with:

    npm install -g path/to/domtest

Usage
-----
Creating the simplest possible test should look like:

    var testCase = require("domtest").testCase;
    module.exports = domTest({

        testSomething: function(test) {
            test.ok(true);
            test.done();
        }

    });

However, this is pretty useless. Assuming a project structure like this:

    ./
    ./base.htm
    ./js
    ./js/jquery.min.js
    ./js/myawesome.js
    ./tests
    ./tests/test_advanced.js

...test\_advanced.js might look something like:

    var domTest = require("domtest");

    // overriding default globals, which are ["$", "jQuery", "_"]
    domTest.defaultGlobals = ["$", "MyAwesomeObject"];

    module.exports = domTest.testCase({

        html: "path/to/base/file.htm",
        scripts: ["path/to/extra/scripts.js",],

        setUp: function(callback) {
            // optional: do some set up stuff here...
            callback();
        },

        testjQuery: function(test) {
            var title = this.$("h1").text()
            test.equals(title, "LOL I HAZ A CAT");
            test.done();

        testMyLibrary: function(test) {
            var result = this.MyAwesomeObject.doIHazCat();
            test.ok(result);
            test.done();
        },

        tearDown: function(callback) {
            // optional: undo what you did in setUp
            callback();
        }

    });

The options that can be passed into domTest are listed below.

Running Tests
-------------
DomTest comes with a small test runner wrapped around nodeunit. If you
installed it globally, it should be available as "domtest", otherwise
it might be in the local node\_modules/.bin folder.

Running it looks like:

    domtest path/to/tests.js

Or you can pass in directory, and it will hunt for Javascript files
that begin with "test":

    domtest path/to/tests/

Since it wraps NodeUnit, it should also bring in any plain NodeUnit
TestCase objects too, not just domTests.

Currently, there's an issue where you'll need to press Ctrl-C when the
tests are finished. (It will say "OK" or "FAIL" to let you know that it's
done.) Some callback is not being fired, apparently.

DomTest Options
---------------
By default, a test case only expects one or more functions that start
with "test". However, since this is a DOM test, it will usually be
important to import some sort of HTML base, as well as other Javascript
libraries to test.

The following is a list of options that DomTest uses.

* setUp: function(callback) - Provides a custom setUp to be called after
  domTest has finished setting up.
* tearDown: function(callback) - Provides a custom tearDown function to be
  called after domTest as finished running tests.
* html: string - A path to the HTML content that will be loaded by JSDOM.
* scriptPath: string - The "base" path for anything provided to scripts.
* scripts: array - A list of local paths to extra Javascript files to load.
  By default, domTest will attempt to load any scripts in the HTML content.
* exportGlobals: array - A list of top-level objects to make avalable on the
  domtest testCase. By default it includes jQuery and Underscore. These can
  be used within tests by "this.$" or "this.\_", assuming those are loaded.

Additionally, domTest.defaultGlobals allows overriding of what's included
on every test by default.
