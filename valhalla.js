/**
 * Created by Cento on 25/03/2016.
 */

//IMPORT DELLE LIBRERIE ED INIZIALIZZAZIONE DEL CRAWLER
var Nightmare = require('nightmare');
var cheerio = require('cheerio')
var fs = require('fs');
var json2csv = require('json2csv');

var nightmare = Nightmare({
    show: true,
    switches: {
        'proxy-server': 'socks5://127.0.0.1:9150',
        'ignore-certificate-errors': true
    }

})


//VARIABILI RELATIVE AL SITO
var usr = 'f2ddt5';
var pass = 'a1s2d3f4g5h6';
var pin = 749613;
var site = 'valhalla';
var deepurl = 'http://valhallaxmn3fydu.onion/login';
var guns_url = "http://valhallaxmn3fydu.onion/intl/categories/2502";

//VARIABILI DI SUPPORTO
var wpn_array = [];
var toCsv = [];

//VARIABILI RELATIVE AL CSV FINALE
var csvHeaders = ["website","product","caliber","vendor","price","description","type","from","to","quantity","used","serial","ammo","escrow","sold_number"];
var date = new Date().toISOString().slice(0, 10);


//fase 1 - login
nightmare
    .goto(deepurl)
    .wait('input[name="user[humanizer_answer]"]')
    .type('input[name="user[name]"]', usr)
    .type('input[name="user[password]"]', pass)
    .wait('form#search')
    .goto(guns_url)
    .inject('js', 'node_modules/jquery/dist/jquery.js')
    .evaluate(function(){
        return $("table.table.products tr td:nth-child(2) a").map(function() {
            return this.href;
        }).get();
    })
    .then(function(wpn_list){
        console.log(wpn_list);
        getWeapons(wpn_list);
    });



// fase 2 - recupero HTML per ogni arma
function getWeapons(lst) {

    var i = 0;
    getCurrentWeapon(i);

    function getCurrentWeapon(num) {

        nightmare
            .goto(lst[num])
            .wait("div.description")
            .inject('js', 'node_modules/jquery/dist/jquery.js')
            .evaluate(function () {
                return $("body").html()
            })
            .then(function (d) {
                wpn_array.push(d);
                num++;
                if(num <= lst.length-1) {
                    console.log(num,(lst.length), "next");
                    getCurrentWeapon(num);
                }
                else {
                    console.log(num,(lst.length),"scrape");
                    scrapeWeapons(wpn_array);
                }
            })
    }
}


// fase 3 - estrazione dei dati
function scrapeWeapons(htmls) {

    htmls.forEach(function(html,index){

        var weapon = {}

        $ = cheerio.load(html);
        weapon.website = site;
        weapon.product = $('div#product-header').next('h1').text().replace(/\n|\t/g,"");
        weapon.vendor = $('ul.list-unstyled a[title^="Visit vendor"]').text().replace(/\n|\t/g,"");
        weapon.price = $('ul.list-unstyled li:nth-child(1)').text().replace(/\n|\t/g,"");
        weapon.quantity = $('ul.list-unstyled li:nth-child(2)').text().replace(/\n|\t/g,"");
        weapon.from = $('ul.list-unstyled li.text-muted').prev().text().replace(/\n|\t/g,"").replace(/\s\u2192.*/g,"");
        weapon.to = $('ul.list-unstyled li.text-muted').prev('li').text().replace(/\n|\t/g,"").replace(/.*\u2192\s/g,"");
        weapon.escrow = $('p.shipping_fee_info strong').text().replace(/\n|\t/g,"");
        weapon.description = $('div.description').text().replace(/\n|\t/g,"");

        console.log(weapon)
        console.log("--------------------");
        toCsv.push(weapon);

    })
    writeCsv(toCsv);
}



// fase 4 - salvataggio su CSV
function writeCsv(arr) {

    console.log("writing csv");
    json2csv({ data: arr, fields: csvHeaders }, function(err, csv) {
        if (err) console.log(err);
        fs.writeFile(site+"_"+date+'.csv', csv, function(err) {
            if (err) throw err;
            console.log('file saved');
            nightmare.end()
        });
    });
}