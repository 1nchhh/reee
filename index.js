const input = require('input')
const { v4: uuidv4 } = require('uuid');
const clc = require('cli-color')
const fs = require('fs')
const rs = require('randomstring')
const {
    Worker,
    isMainThread,
    parentPort
} = require('worker_threads');
var logins = require('./logins.json')

if (isMainThread) {
    // This code is executed in the main thread and not in the worker.

    // Create the worker.
    (async() => {
        var count = await input.text('threads:')
        for (i = 0; i < parseInt(count); i++) {
            const worker = new Worker(__filename);
            start(worker)
        }
        async function start(worker) {
            worker.on('message', async(msg) => {
                if (!('' + msg).includes('.') || ("" + msg).includes('\n')) {
                    // console.log(msg)
                    await worker.terminate()
                    try {
                        await worker.terminate()
                        try {
                            await worker.terminate()
                            try {
                                await worker.terminate()
                                try {
                                    await worker.terminate()
                                } catch {}
                            } catch {}
                        } catch {}
                    } catch {}
                    time()
                    console.log(clc.yellow('[INFO] -    ') + 'Terminating.')
                    worker = new Worker(__filename);
                    start(worker)
                } else
                if (typeof msg == 'string' && ('' + msg).startsWith('{')) {
                    logins.push(JSON.parse(msg))
                    fs.writeFileSync('logins.json', JSON.stringify(logins, null, 4))
                    console.log(reTime() + clc.blue('[INFO] -    ') + clc.green(logins.length) + ' accounts created.')
                        // console.log(JSON.parse(msg.replace('LOGIN ', '')).username)
                } else if (('' + msg).includes('RESTART')) {
                    time()
                    await worker.terminate()
                    console.log(clc.blue('[INFO] - ') + '   Restarting bot.')
                    worker = new Worker(__filename);
                    start(worker)
                } else {
                    time()
                    console.log(msg);
                }
            });
        }
    })()
    // Listen for messages from the worker and print them.
} else {
    require('events').EventEmitter.defaultMaxListeners = 20;

    console.working = function(text) {
            parentPort.postMessage(`${clc.green('[WORKING] -')} ${text}`)
        }
        // This code is executed in the worker and not in the main thread.

    // Send a message to the main thread.
    const puppeteer = require('puppeteer-extra')

    // add stealth plugin and use defaults (all evasion techniques)
    const StealthPlugin = require('puppeteer-extra-plugin-stealth')
    puppeteer.use(StealthPlugin())
        // const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha')
    console.log(reTime() + clc.yellow('[INFO] - ') + '   Bot started.')

    function sleep(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }
    // ... puppeteer code

    run()

    async function run() {
        try {
            const browser = await puppeteer.launch({
                headless: true,
                args: ['--user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36"']
            });
            var page = await browser.pages().then(r => {
                return r[0]
            })
            await page.setViewport({ width: 1920, height: 1080 })
            await page.exposeFunction('sleep', async(ms) => {
                return new Promise((resolve) => {
                    setTimeout(resolve, ms);
                });
            })

            await page.goto("https://repl.it/signup")

            const things = await page.$$('input')
            var username = rs.generate(15)
            var email = rs.generate(20) + '@gmail.com'
            var password = rs.generate(20)
            await things[0].focus()
            await sleep(500)
            await page.keyboard.type(username)
            await sleep(500)
            await things[1].focus()
            await sleep(500)
            await page.keyboard.type(email)
            await sleep(500)
            await things[2].focus()
            await sleep(500)
            await page.keyboard.type(password)
            await sleep(300)
            var button = await page.$('button')
            var oldUrl = page.url()
            await button.click()
            await sleep(4500)
            var count = 0
            await checkForCookie()
            async function checkForCookie() {
                if (oldUrl != page.url()) {
                    console.working('Made account with name ' + clc.blue(username) + '.')
                    await page.cookies().then(cookies => {
                        cookies.forEach(async cookie => {
                            if (cookie.name == 'connect.sid') {
                                try {
                                    var data = JSON.stringify({
                                        email,
                                        username,
                                        password,
                                        value: cookie.value,
                                        expires: new Date(cookie.expires * 1000).toLocaleString("en-US", { timeZoneName: "short" })
                                    })
                                    if (data.startsWith('{')) {
                                        parentPort.postMessage(data)
                                        await page.screenshot({ path: `../screenshots/success/screenshot-${uuidv4()}.png` });
                                        await page.close()
                                        parentPort.postMessage(`${clc.green('[WORKING] -')} Made account and closed Browser.`)
                                            // run()
                                        parentPort.postMessage('RESTART')
                                    } else {
                                        parentPort.postMessage(clc.red('[ERROR | RESTARTING]\t') + 'Hcaptcha appeared and wasnt able to continue creation.')
                                        await page.screenshot({ path: `../screenshots/errors/screenshot-${uuidv4()}.png` });
                                        // run()
                                        parentport.postMessage('RESTART')
                                    }
                                } catch {
                                    await page.screenshot({ path: `../screenshots/errors/screenshot-${uuidv4()}.png` });
                                    // parentPort.postMessage(e)
                                    await page.close()
                                    parentPort.postMessage(`${clc.green('[WORKING] -')} Made account and closed Browser.`)
                                        //run()
                                    parentPort.postMessage('RESTART')
                                }
                            }
                        })
                    })
                } else {
                    count++
                    if (count > 5) {
                        parentPort.postMessage('RESTART')
                    } else {
                        parentPort.postMessage(clc.blue('[CHECK] - ') + '  Wasn\'t on correct page.')
                        await sleep(500 + (count * 500))
                        await checkForCookie()
                    }
                }
            }
        } catch (e) {
            try {
                await page.close()
            } catch (e) {}
            // parentPort.postMessage(e)
            parentPort.postMessage(clc.red('[ERROR | RESTARTING]\t') + 'Something happened and the puppeteer instance threw an error.')
                // run()
            parentPort.postMessage('RESTART')
            parentPort.postMessage(e)
        }
    }
}

function time() {
    let now = new Date()
    var formattedTime = now.toTimeString().split(' ')[0]

    process.stdout.write(clc.red(formattedTime) + '\t');
}

function reTime() {
    let now = new Date()
    var formattedTime = now.toTimeString().split(' ')[0]

    return (clc.red(formattedTime) + '\t');
}