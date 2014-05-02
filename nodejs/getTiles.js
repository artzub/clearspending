/**
 * Created by artzub on 30.04.2014.
 */

var request = require('request')
    , fs = require('fs')
    , l = 'abcd'
    ;

var s = , z = 0, x = 0, y = 0;

function run() {
    request('http://{s}.tiles.mapbox.com/v3/artzub.hp68ld67/{z}/{x}/{1}.png').pipe(
        fs.createWriteStream('E:/tiles/{s}.{z}.{x}.{y}.png')
    );
}