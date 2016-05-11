/**
 * Created by Cento on 25/03/2016.
 */
var Nightmare = require('nightmare');
var nightmare = Nightmare({
    show: true,
    switches: {
        'proxy-server': 'socks5://127.0.0.1:9150',
        'ignore-certificate-errors': true
    }
})

nightmare
    .goto('http://yahoo.com')
    .type('input[title="Search"]', 'github nightmare')
    .click('#uh-search-button')
    .wait('#main')
    .evaluate(function () {
        return document.querySelector('#main .searchCenterMiddle li a').href
    })
    .end()
    .then(function (result) {
        console.log(result)
    })