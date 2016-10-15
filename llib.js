var debug = 1;
var console = {}
console.log = (function () {return function (x) {if (debug) {process.stdout.write(ll.ansitime('magenta','llib     ') + x + '\n');}}})();

/**
 * Created by todd on 10/13/2016.
 */
exports.ansi = function (color,text){
    var codes = {
        white: 37
        , black: 30
        , blue: 34
        , cyan: 36
        , green: 32
        , magenta: 35
        , red: 31
        , yellow: 33
        , grey: 90
        , brightBlack: 90
        , brightRed: 91
        , brightGreen: 92
        , brightYellow: 93
        , brightBlue: 94
        , brightMagenta: 95
        , brightCyan: 96
        , brightWhite: 97
        , bold: 1
        , italic: 3
        , underline: 4
        , inverse: 7
        , unbold: 22
        , unitalic: 23
        , ununderline: 24
        , uninverse: 27
    }

    return '\x1b['+codes[color]+'m'+text+'\x1b['+codes['black']+'m';

}
exports.ansitime = function(color,text){

    return new Date().toLocaleTimeString()+ ' '+this.ansi(color,text.rpad(14))

}
String.prototype.rpad = function(length) {
    var str = this;
    while (str.length < length)
        str = str + ' ';
    return str;
}
exports.cleanup = function(callback) {
//https://github.com/nodejs/node-v0.x-archive/blob/master/doc/api/process.markdown#exit-codes
//http://stackoverflow.com/questions/14031763/doing-a-cleanup-action-just-before-node-js-exits
    // catch ctrl+c event and exit normally

    process.on('SIGINT', function () {
        server.send({console:"Witzy server DOWN-SIGINT",serverup:false},2)

        console.log('Ctrl-C...');

    });

    //catch uncaught exceptions, trace, then exit normally
    process.on('uncaughtException', function(e) {
        console.log('Uncaught Exception...');
        process.stdin.resume();
        console.log('\n'+e.stack);
        server.send({console:"Witzy server DOWN-UNCAUGHTEXCEPTION",error:e,serverup:false},1)


        //  process.exit(1);
    });
};


process.stdin.on('readable', function() {
    var chunk = process.stdin.read();
if (chunk !== null) {
   console.log(chunk)
}
});


