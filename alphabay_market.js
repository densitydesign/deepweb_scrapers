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
var site = 'alphabay_market';
var date = new Date();
var usr = 'f2ddt5';
var pass = 'a1s2d3f4g5h6';
var deepurl = 'http://pwoah7foa6au2pul.onion/challenge.php';
var page = 1;

//variabili di supporto
var wpn_list = [];
var wpn_array = [];
var toCsv = [];

//variabili per il csv finale
var csvHeaders = ["website","product","caliber","vendor","price","description","type","from","to","quantity","used","serial","ammo","escrow","sold_number"];
var date = new Date().toISOString().slice(0, 10);




//Fase 1 - login
nightmare
    .goto(deepurl)
    .wait('input[name="answer"]')
//    .goto(deepurl)
    //inserimento credenziali
    .wait('input[name="user"]')
    .type('input[name="user"]', usr)
    .type('input[name="pass"]', pass)
    //attesa dell'inserimento del captcha e del raggiungimento della pagina principale
    .wait("div.content1")
    //reindirizzamento sull'url relativo alle armi
    .then(function(){
        console.log("getPage"+page)    
        getPageAmmo(page);
    })

//scrape pagina Ammunitions
function getPageAmmo(page) {
    
    nightmare
        .goto('http://pwoah7foa6au2pul.onion/search.php?cat47=on&cat99=on&pg='+page)
        .inject('js', 'node_modules/jquery/dist/jquery.js')
        .evaluate(function(){
            return $("body").html()
        })
        //la funzione "then" prende in ingresso il return della "evaluate"
        //il codice viene eseguito su node
        .then(function(wpn_page){
            $ = cheerio.load(wpn_page);
            var imgSrc = $('div.content2 div.tcl:nth-last-of-type(2) a.page:last-child img.std').attr('src');
            console.log("imgSrc", imgSrc );
            if(imgSrc == "images/nolast.png") {
                $ = cheerio.load(wpn_page);
                $('a.bstd').each(function(){
                    var link = $(this).attr('href');
                    wpn_list.push(link);
                });
                console.log('ultimo push Ammo!!!');
                page = 1;
                //lista successiva
                getPagePistols(page);
            }
            else {
                //aggiungi a lista generale
                $ = cheerio.load(wpn_page);
                $('a.bstd').each(function(){
                    var link = $(this).attr('href');
                    wpn_list.push(link);
                });
                console.log('Ammo pushato!!');
                page++;
                getPageAmmo(page);
            }
        });
    
}

//scrape pagina Pistols
function getPagePistols(page) {
    
    nightmare
        .goto('http://pwoah7foa6au2pul.onion/search.php?cat48=on&cat100=on&pg='+page)
        .inject('js', 'node_modules/jquery/dist/jquery.js')
        .evaluate(function(){
            return $("body").html()
        })
        //la funzione "then" prende in ingresso il return della "evaluate"
        //il codice viene eseguito su node
        .then(function(wpn_page){
            $ = cheerio.load(wpn_page);
            var imgSrc = $('div.content2 div.tcl:nth-last-of-type(2) a.page:last-child img.std').attr('src');
            console.log("imgSrc", imgSrc );
            if(imgSrc == "images/nolast.png") {
                $ = cheerio.load(wpn_page);
                $('a.bstd').each(function(){
                    var link = $(this).attr('href');
                    wpn_list.push(link);
                });
                console.log('ultimo push Pistol!!!');
                page = 1;
                //lista successiva
                getPageGuns(page);
            }
            else {
                //aggiungi a lista generale
                $ = cheerio.load(wpn_page);
                $('a.bstd').each(function(){
                    var link = $(this).attr('href');
                    wpn_list.push(link);
                });
                console.log('Pistol pushato!!');
                page++;
                getPagePistols(page);
            }
        });
    
}

//scrape pagina Guns
function getPageGuns(page) {
    
    nightmare
        .goto('http://pwoah7foa6au2pul.onion/search.php?cat49=on&cat101=on&pg='+page)
        .inject('js', 'node_modules/jquery/dist/jquery.js')
        .evaluate(function(){
            return $("body").html()
        })
        //la funzione "then" prende in ingresso il return della "evaluate"
        //il codice viene eseguito su node
        .then(function(wpn_page){
            $ = cheerio.load(wpn_page);
            var imgSrc = $('div.content2 div.tcl:nth-last-of-type(2) a.page:last-child img.std').attr('src');
            console.log("imgSrc", imgSrc );
            if(imgSrc == "images/nolast.png") {
                $ = cheerio.load(wpn_page);
                $('a.bstd').each(function(){
                    var link = $(this).attr('href');
                    wpn_list.push(link);
                });
                console.log('ultimo push Guns!!!');
                //fase successiva
                getWeapons(wpn_list);
            }
            else {
                //aggiungi a lista generale
                $ = cheerio.load(wpn_page);
                $('a.bstd').each(function(){
                    var link = $(this).attr('href');
                    wpn_list.push(link);
                });
                console.log('Guns pushato!!');
                page++;
                getPageGuns(page);
            }
        });
    
}



//Fase 2 - recupero HTML per ogni arma
function getWeapons(lst) {
    console.log(lst.length);
    var i = 0;
    getCurrentWeapon(i);

    function getCurrentWeapon(num) {
        console.log(lst[num]);
        nightmare
            .goto("http://pwoah7foa6au2pul.onion/" + lst[num])
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

        //cheerio è una libreria per lo scraping di pagine HTML
        //si usa esattamente come jQuery
        $ = cheerio.load(html);
        weapon.website = site;
        weapon.product = $('h1.std').text();
        weapon.vendor = $('div.content2 div:nth-child(2) a.std').text().replace(/\n|\t/g,"").replace(/.\u002a\u002a./g,"");
        weapon.price = $('form[name="formListing"] div.tcl:last-child span.std').text().split("USD ").pop()+" USD";
        weapon.type = $('form[name="formListing"] div.tcl:nth-of-type(1) div.tcl:nth-of-type(4)').next().text().replace(/\n|\t/g,"");
        weapon.quantity = $('form[name="formListing"] div.tcl:nth-of-type(1) div.tcl:nth-of-type(7)').next().text().replace(/\n|\t/g,"");
        weapon.from = $('form[name="formListing"] div.tcl:nth-of-type(2) div.tcl:nth-of-type(4)').next().text().replace(/\n|\t/g,"");
        weapon.to = $('form[name="formListing"] div.tcl:nth-of-type(2) div.tcl:nth-of-type(7)').next().text().replace(/\n|\t/g,"");
        weapon.escrow = $('form[name="formListing"] div.tcl:nth-of-type(2) div.tcl:nth-of-type(10)').next().text().replace(/\n|\t/g,"");
        weapon.description = $('h1.std').next().text().replace(/\n|\t/g,"");

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
            //Chiudi Electron
            nightmare.end();
        });
    });
}