var cookies = require('./logins.json');

Date.prototype.getUnixTime = function() {
    return (this.getTime() / 1000) | 0;
};
if (!Date.now)
    Date.now = function() {
        return new Date();
    };
Date.time = function() {
    return Date.now().getUnixTime();
};
// This code is executed in the main thread and not in the worker.

// Create the worker.


function ini(i) {
    if (r == cookies.length) {
        console.log(clc.blue('[INFO] - ') + '   Done!')
        process.exit()
    } else
        run(cookies[i]).then(() => {
            i++
            if (cookies[i]) {
                ini(i)
                console.log('running cookie', i)
            }
        })
}

// Listen for messages from the worker and print them.
// This code is executed in the worker and not in the main thread.

// Send a message to the main thread.
const clc = require("cli-color");
const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())
require('events').EventEmitter.defaultMaxListeners = Number.POSITIVE_INFINITY;
var amt = 7
var r = 0
for (e = 0; e < amt; e++) {
    var i = (Math.floor(cookies.length / amt) * e)
    ini(i)
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
// ... puppeteer code

async function run(cookie) {
    return new Promise(async(resolve) => {
        console.log(clc.yellow("[INFO] - ") + "   Bot started.");
        const browser = await puppeteer.launch({
            headless: true,
        });
        var page = await browser.pages().then((r) => {
            return r[0];
        });
        try {
            cookie.domain = "repl.it";
            cookie.name = "connect.sid";
            cookie.expires = new Date(cookie.expires).getUnixTime();
            await page.setCookie(cookie);
            await page.goto("https://repl.it/claim?code=digitalLife2020");
            await page.exposeFunction('c', c => {
                console.log(c)
            });

            console.log(
                `${clc.green("[WORKING] -")} Step 1:\tNavigated to claim code page.`
            );
            await sleep(1750)
            await page.evaluate(() => {
                var button = document.getElementsByClassName("jsx-2252546946 content sentence-case");
                button = button[0];
                button.click();
            });
            console.log(
                `${clc.green("[WORKING] -")} Step 2:\tClicked claim button.`
            );
            await sleep(500);
            r++
            await page.close();
            console.log(
                `${clc.green("[WORKING] -")} Step 3:\tClosed Browser.`
            );
            resolve()
        } catch (e) {
            page.close()
            console.log(
                clc.red("[ERROR | RESTARTING]\t") +
                "Something happened and the puppeteer instance threw an error."
            );
            resolve()
        }
    })
}