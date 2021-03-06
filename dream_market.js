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
var pass = 'a1s2d3';
var pin = 749613;
var site = 'dream_market';
var deepurl = 'http://lchudifyeqm4ldjj.onion';
var guns_url = "http://lchudifyeqm4ldjj.onion/?category=194";

//VARIABILI DI SUPPORTO
var raw_wpns = [];
var wpn_array = [];
var toCsv = [];

//VARIABILI RELATIVE AL CSV FINALE
var csvHeaders = ["website","product","caliber","vendor","price","description","type","from","to","quantity","used","serial","ammo","escrow","sold_number"];
var date = new Date().toISOString().slice(0, 10);


//fase 1 - login
nightmare
    .goto(deepurl)
    .wait('input[name="login"]')
    .type('input[name="login"]', usr)
    .type('input[name="password"]', pass)
    .wait(function(){
        return document.title == "Welcome"
    })
    .goto(guns_url)
    .inject('js', 'node_modules/jquery/dist/jquery.js')
    .evaluate(function(){
        return $("ul.pageNav:first-child .pager").length/2;
    })
    .then(function(pages){
        //console.log(wpn_list);
        getWeaponPages(pages,1);
    });


function getWeaponPages(p, num) {

    nightmare
    .goto(guns_url+"&page="+num)
    .inject('js', 'node_modules/jquery/dist/jquery.js')
    .evaluate(function () {
        return $("div.oImage a").map(function () {
            return this.href;
        }).get();
    })
        .then(function (wpn_list) {
            console.log(num, p);
            num = num+1;
            raw_wpns = raw_wpns.concat(wpn_list);
            if(num >= p+1) {
                console.log("scrape now!");
                console.log(raw_wpns);
                getWeapons(raw_wpns);
            }
            else{
                console.log("get next page");
                getWeaponPages(p, num);
            }
        });

}

// fase 2 - recupero HTML per ogni arma
function getWeapons(lst) {

    var i = 0;
    getCurrentWeapon(i);

    function getCurrentWeapon(num) {

        console.log("##########");

        nightmare
            .goto(lst[num])
            .wait("body")
            .inject('js', 'node_modules/jquery/dist/jquery.js')
            .evaluate(function () {

                    return $("body").html()

            })
            .then(function (d) {
                console.log("this is d", d.length);
                $ = cheerio.load(d);
                console.log($(".content"),$(".content").length);
                if(!$(".content").length) {
                    console.log("re-run!");
                    setTimeout(function() {

                        getCurrentWeapon(num);
                    }, 10000)
                }
                else {
                    wpn_array.push($(".content").html());
                    num++;
                    if (num <= lst.length - 1) {
                        console.log(num, (lst.length), "next");
                        getCurrentWeapon(num);
                    }
                    else {
                        console.log(num, (lst.length), "scrape");
                        scrapeWeapons(wpn_array);
                    }
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
        weapon.product = $('.title').text();
        weapon.vendor = $('label:contains(Vendor)').next('span').find('a').text().replace(/\n|\t/g,"");
        weapon.price = $('label:contains(Price)').next('span').text().replace(/\n|\t/g,"");
        weapon.from = $('label:contains(Ships from)').next('span').text().replace(/\n|\t/g,"");
        weapon.to = $('label:contains(Ships to)').next('span').text().replace(/\n|\t/g,"");
        weapon.escrow = $('label:contains(Escrow)').next('span').text().replace(/\n|\t/g,"");
        weapon.description = $('#offerDescription').text().replace(/\n|\t/g,"");

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
        });
    });
}