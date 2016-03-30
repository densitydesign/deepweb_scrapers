/**
 * Created by Cento on 25/03/2016.
 */
// librerie
var Nightmare = require('nightmare');
var cheerio = require('cheerio');
var fs = require('fs');
var json2csv = require('json2csv');


//inizializzazione nightmare (scraper)
    var nightmare = Nightmare({
    show: true,
    switches: {
        'proxy-server': 'socks5://127.0.0.1:9150',
        'ignore-certificate-errors': true
    }

})


//dati del sito
var site = 'oasis';
var date = new Date();
var usr = 'f2ddt5';
var pass = 'a1s2d3';
var deepurl = 'http://oasisnvwltxvmqqz.onion';

//variabili di supporto
var wpn_array = [];
var toCsv = [];

//variabili per il csv finale
var csvHeaders = ["website","product","caliber","vendor","price","description","type","from","to","quantity","used","serial","ammo","escrow","sold_number"];
var date = new Date().toISOString().slice(0, 10);




//Fase 1 - login
nightmare
    .goto(deepurl)
    //inserimento credenziali
    .type('input[name="username"]', usr)
    .type('input[name="password"]', pass)
    //attesa dell'inserimento del captcha e del raggiungimento della pagina principale
    .wait("div.four.wide.column")
    //reindirizzamento sull'url relativo alle armi
    .goto('http://oasisnvwltxvmqqz.onion/93')
    //inserimento jquery nella pagina
    .inject('js', 'node_modules/jquery/dist/jquery.js')
    //il corpo della funzione "evaluate" viene eseguita nel browser!
    //serve solo a recuperare dati dalla pagina, no nsi possono usare librerie di node
    .evaluate(function(){
        return $("div.items a.header").map(function() {
            return this.href;
        }).get();
    })
    //la funzione "then" prende in ingresso il return della "evaluate"
    //il codice viene eseguito su node
    .then(function(wpn_list){
        //console.log(wpn_list);
        getWeapons(wpn_list);
    });



//Fase 2 - recupero HTML per ogni arma
function getWeapons(lst) {

    var i = 0;
    getCurrentWeapon(i);

    function getCurrentWeapon(num) {

        nightmare
            .goto(lst[num])
            .inject('js', 'node_modules/jquery/dist/jquery.js')
            .evaluate(function () {
                return $("body").html()
            })
            .then(function (d) {
                wpn_array.push(d);
                num++;
                if(num <= lst.length -1) {
                    getCurrentWeapon(num);
                }
                else {
                    scrapeWeapons(wpn_array);
                }
            })
    }
}

//Fase 3 - estrazione dei dati
function scrapeWeapons(htmls) {

    htmls.forEach(function(html,index){

        var weapon = {};
        var re = new RegExp('<i class="globe icon"><\/i>(.*)$');

        //cheerio è una libreria per lo scraping di pagine HTML
        //si usa esattamente come jQuery
        $ = cheerio.load(html);
        weapon.website = site;
        weapon.product = $('h2.ui.header').text();
        weapon.vendor = $('table tr:first-of-type td:nth-of-type(2)').text();
        weapon.price = $('table tr:nth-of-type(2) td:nth-of-type(2)').text();
        weapon.type = $('table tr:nth-of-type(3) td:nth-of-type(2)').text();
        weapon.quantity = $('table tr:nth-of-type(5) td:nth-of-type(2)').text();
        weapon.from = $('table tr:nth-of-type(7) td:nth-of-type(2)').text();
        weapon.to = re.exec($('table tr:nth-of-type(6) td:nth-of-type(2)').html())[1];
        //weapon.escrow = $('label:contains(Escrow)').next('span').text().replace(/\n|\t/g,"");
        weapon.description = $('h4').next('p.wrap').text().replace(/\n|\t/g,"");

        console.log(weapon)
        console.log("--------------------");
        toCsv.push(weapon);

    })
    writeCsv(toCsv);
}

//Fase 4 - Salvataggio su CSV
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
