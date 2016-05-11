/**
 * Created by django on 24/03/16.
 */
var Nightmare = require('nightmare');

var myurl = 'http://oasisnvwltxvmqqz.onion/welcome';

var nightmare = Nightmare({
    show: true,
        switches: {
            'proxy-server': 'socks5://127.0.0.1:9150',
            'ignore-certificate-errors': true
        }
})

nightmare
    .goto(myurl)
    .type('input[name="username"]', 'f2ddt5')
    .type('input[name="password"]', 'a1s2d3')
    .wait("div.four.wide.column")
    .click("a[href=http://oasisnvwltxvmqqz.onion/89]")
    //.end()





