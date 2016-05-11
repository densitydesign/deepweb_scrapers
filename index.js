var inputs = [];
var imgs=[];
//var cp = require('child_process');
var casper = require('casper').create(
    { verbose: true,
        logLevel: 'debug'
    }
);


function getInputs() {
    var inputs = document.querySelectorAll('input');
    console.log(inputs);
    return Array.prototype.map.call(inputs, function(e) {
        return e.getAttribute('name');
    });
}

function getImages() {
    var imgs = document.querySelectorAll('img');
    console.log(imgs);
    return Array.prototype.map.call(imgs, function(e) {
        this.echo(e);
        return e.getAttribute('src');
    });
}

casper.start('http://oasisnvwltxvmqqz.onion/welcome', function() {
    this.echo("1");
});

casper.then(function() {

    this.echo("2");

/*
    var finished = false;

    cp.execFile('/usr/bin/python','test.py', {},function(_,stdout,stderr){
        console.log(stdout);
        console.log(stderr);
        finished = true;
    });
    this.waitFor(function check(){
        return finished;
    }, function then(){
        // can stay empty
    });

   /* solver.decodeUrl(url, {pollingInterval: 10000}, function(err, result, invalid) {
        console.log(result.text);
    });*/
});

casper.then(function() {

    this.echo("3");

    imgs = this.evaluate(getImages);
    inputs = this.evaluate(getInputs);
/*
    this.fillSelectors('form', {
        'input[name = username ]' : 'f2ddt5',
        'input[name = password ]' : 'a1s2d3'
    }, true);*/
});

casper.then(function() {

    this.echo("4");

    this.capture('google.png', {
        top: 0,
        left: 0,
        width: 500,
        height: 400
    });
});

casper.then(function(){
    this.echo("5");
    this.echo(imgs.length + ' images found:');
   // this.echo(inputs.length + ' inputs found:');
})

casper.run(function() {
    this.echo("6");
    // echo results in some pretty fashion
    this.echo(imgs.length + ' images found:');
    this.echo(inputs.length + ' inputs found:').exit();
    
});