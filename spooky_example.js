
var Spooky = require('spooky');
var $ = require('cheerio');
var url = 'http://oasisnvwltxvmqqz.onion/welcome';

var images = [];



var spooky = new Spooky({
    child: {
        proxy: '127.0.0.1:9150',
        'proxy-type':'socks5'
    },
    casper: {
        logLevel: 'debug',
        verbose: true
    }
}, function (err) {
    if (err) {
        e = new Error('Failed to initialize SpookyJS');
        e.details = err;
        throw e;
    }


    spooky.start(url);

    spooky.then(function () {
        this.emit('hello', 'Hello, from ' + this.evaluate(function () {
                return document.title;
            }));
    });

    spooky.then(function(){
        this.capture('screenshot.png');
    });

    spooky.then(function(){
        var self = this;
        var img = self.getElementAttribute('img','src');

        

    })
    spooky.run();
});

spooky.on('error', function (e, stack) {
    console.error(e);

    if (stack) {
        console.log(stack);
    }
});


 // Uncomment this block to see all of the things Casper has to say.
 // There are a lot.
 // He has opinions.
 spooky.on('console', function (line) {
 console.log(line);
 });
 

spooky.on('hello', function (greeting) {
    console.log(greeting);
});

spooky.on('log', function (log) {
    if (log.space === 'remote') {
        console.log(log.message.replace(/ \- .*/, ''));
    }
});