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
var site = 'black_market_guns';
var deepurl = 'http://armsmhmd4c3hb5xu.onion/';

//VARIABILI DI SUPPORTO
var wpn_array = [];
var toCsv = [];

//VARIABILI RELATIVE AL CSV FINALE
var csvHeaders = ["website","product","caliber","vendor","price","description","type","from","to","quantity","used","serial","ammo","escrow","sold_number"];
var date = new Date().toISOString().slice(0, 10);


//fase 1 - login
nightmare
    .goto(deepurl)
    //.wait(function(){return document.title == "BMG (Black Market Guns) : Trusted source for worldwide GUN shipment"})
    .inject('js', 'node_modules/jquery/dist/jquery.js')
    .evaluate(function(){
    	return $("td")
    			.map(function(){return $(this).html()})
    			.get();
    })
    .then(function(wpn_array){
    	scrapeWeapons(wpn_array);
    	//console.log(wpn_array);
    })

// fase 3 - estrazione dei dati
function scrapeWeapons(htmls) {
	
    htmls.forEach(function(html,index){
		console.log(index);
		
        var weapon = {}
        var re_caliber = new RegExp('<strong>Caliber</strong>: ?(.+?)<br>');
        var re_capacity = new RegExp('<strong>Capacity</strong>: ?(.+?)<br>');
        var re_price = new RegExp('([0-9.]+) BTC');

        $ = cheerio.load(html);
        weapon.website = site;
        weapon.product = $('.name').text();
        weapon.price = re_price.exec($('.order'))[1];
        
        try
        {
        
	        weapon.caliber = re_caliber.exec($('.spec'))[1];
		}
		catch (e)
        {
        	console.log("qualcosa non va: "+e);
        }

        try
        {

            weapon.ammo = re_capacity.exec($('.spec'))[1];
        }
        catch (e)
        {
            console.log("qualcosa non va: "+e);
        }
        console.log(weapon)
        console.log("--------------------");
        toCsv.push(weapon);
        
        if($('.name').text() == "Ammunition")
        {
        	console.log("trovato");
        	scrapeAmmos(html);
        }
        
    })
    
    //scrapeAmmos(htmls[htmls.length - 1]);s
    writeCsv(toCsv);
}

function scrapeAmmos(html)
{
	console.log("AMMOS");
	
	var $ = cheerio.load(html);
	var test = $(".order").html();
	var results = test.match(/([^\t]+?)[\n\t]+\$.+\((.+?) /g)
	for(var i=0; i<results.length; i++)
	{
		var weapon = {};
		weapon.website = site;
		weapon.product = "Ammunition"
		weapon.caliber = results[i].match(/([^\t]+?)[\n\t]/)[1];
		weapon.price = results[i].match(/\$.+\((.+?) /)[1];
		console.log(weapon)
        console.log("--------------------");
        toCsv.push(weapon);
		
	}	
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