var jsdom = require("jsdom")
var nodeunit = require("nodeunit");
var fs = require("fs");

// stub for default boilerplate methods
var passThrough = function(callback) { callback(); };
// sane defaults (jQuery, underscore)
exports.defaultGlobals = ["$", "jQuery", "_"];

// the main function used for tests
exports.testCase = function(overrideOptions) {

    // set up default (empty) HTML or override
    var htmlPath = overrideOptions.html;
    var html = "<html><head></head><body></body></html>";
    if (htmlPath) {
        html = fs.readFileSync(htmlPath).toString();
    }
    var scripts = [];
    // a relative or absolute path to the javascript directory
    var scriptPath = overrideOptions.scriptPath;
    scriptPath = (scriptPath) ? scriptPath : "";

    // Automatically retrieve Javascript source files from the
    // HTML page.
    // TODO: Get rid of this hunting garbage, do TheRightThing
    /*var scriptRe = /(<script\s+.*src=")([^"]+)(")/gmi;
    var scripts = html.match(scriptRe);
    scripts = (scripts) ? scripts : [];

    // strip html from script tag paths
    for (var i=0; i<scripts.length; i++) {
        var script = scripts[i];
        script = script.replace(/^<script\s+.*src="/i, "");
        script = script.replace(/"$/i, "");
        scripts[i] = script;
    }*/
    // include any "manual" script paths
    if (overrideOptions.scripts) {
        for (i=0; i<overrideOptions.scripts.length; i++) {
            var script = overrideOptions.scripts[i];
            script = scriptPath + script;
            // TODO: better way to check this...
            var present = false;
            for (var s=0; s<scripts.length; s++) {
                if (scripts[s] == script) {
                    present = true;
                    break;
                }
            }
            if (!present) {
                scripts.push(script);
            }
        }
    }
    // load Javascript as string (there has to be a better way)
    for (i=0; i<scripts.length; i++) {
        scripts[i] = fs.readFileSync(scripts[i]).toString();
    }
    scripts = scripts.join("\n");

    // the window "globals" (like $ for jQuery) to make available
    // on the test object
    var exportGlobals = overrideOptions.exportGlobals;
    exportGlobals = (exportGlobals) ? exportGlobals : [];
    // some sane defaults (jQuery, underscore)
    exportGlobals = exportGlobals.concat(exports.defaultGlobals);
    var baseTestOptions = {


        // default setUp function, wraps the override setUp function
        setUp: function(callback) {
            var testObj = this;
            var finalSetup = callback;
            var callSetup = null;
            if (overrideOptions.setUp) {
                finalSetup = function() {
                    overrideOptions.setUp(callback);
                }
            }
            jsdom.env({
                html: html,
                src: scripts,
                done: function(errors, window) {
                    if (errors) {
                        console.log("Errors while loading DOM:");
                        console.log(errors);
                    }
                    if (finalSetup) {
                        callSetup = finalSetup;
                        finalSetup = null;
                    } else {
                        console.log("WARNING: Setup called more than once.");
                        callback();
                    }
                    testObj.window = window;
                    // attach window globals to the test object
                    for (var i=0; i<exportGlobals.length; i++) {
                        var exportGlobal = exportGlobals[i];
                        if (typeof window[exportGlobal] != "undefined") {
                            testObj[exportGlobal] = window[exportGlobal];
                        }
                    }
                    callSetup();
                }
            });
        }
    };

    // look for test methods in the options passed in
    for (var obj in overrideOptions) {
        if (!overrideOptions.hasOwnProperty(obj)) {
            // not sure this is as necessary in node?
            continue;
        }
        if (!obj.match(/^test/i)) {
            // does not start with "test"
            continue;
        }
        // attach test methods / attributes to domTest object
        baseTestOptions[obj] = overrideOptions[obj];
    }

    // default teardown
    var tearDown = overrideOptions.tearDown;
    baseTestOptions.tearDown = (tearDown) ? tearDown : passThrough;

    // return new wrapped test case
    return nodeunit.testCase(baseTestOptions);
};

