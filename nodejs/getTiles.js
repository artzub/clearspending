/**
 * Created by artzub on 30.04.2014.
 */

var request = require('request')
    , fs = require('fs')
    , l = ['a', 'b', 'c', 'd']
    , pattern = 'http://{s}.tiles.mapbox.com/v3/artzub.hp68ld67/{z}/{x}/{y}.png'
    , filePattern = 'E:/temp/tiles/{z}/{x}/{y}.png'
    , dir = 'E:/temp/tiles/'
    , oldFilePattern = 'E:/temp/tiles/{z}.{x}.{y}.png'
    , loadPattern = '{z}.{x}.{y}.png'
    , maxZoom = 19
    , s = 'a'
    , z = 0
    , x = 0
    , y = 0
    , curTiles
    , li = 0
    ;

function calcCountTiles(zoom) {
    return Math.pow(2, zoom || 0);
}

function getFixedPattern(pattern, s, z, x, y) {
    return pattern
        .replace('{s}', s)
        .replace('{z}', z)
        .replace('{x}', x)
        .replace('{y}', y);
}

function log(str) {
    str && console.log(str);
}

var hashDir = {};

function inside(obj) {

    while(true) {
        var url = getFixedPattern(pattern, s, obj.z, obj.x, obj.y)
            , file = getFixedPattern(filePattern, s, obj.z, obj.x, obj.y)
            , oldFile = getFixedPattern(oldFilePattern, s, obj.z, obj.x, obj.y)
            , strLog = getFixedPattern(loadPattern, s, obj.z, obj.x, obj.y)
            ;

        if (!hashDir[obj.z]) {
            hashDir[obj.z] = fs.existsSync(dir + obj.z) ? (hashDir[obj.z] || {}) : null;
            if (!hashDir[obj.z]) {
                fs.mkdirSync(dir + obj.z, 0777);
                hashDir[obj.z] = {};
            }
        }

        if (!hashDir[obj.z][obj.x]) {
            hashDir[obj.z][obj.x] = fs.existsSync(dir + obj.z + '/' + obj.x) ? true : null;
            if (!hashDir[obj.z][obj.x]) {
                fs.mkdirSync(dir + obj.z + '/' + obj.x, 0777);
                hashDir[obj.z][obj.x] = {};
            }
        }

        if (!fs.existsSync(file) && !fs.existsSync(oldFile)) {
            log(strLog);
            request(url).pipe(
                fs.createWriteStream(file)
            );
            //run(nextStep());
        }
        else {
            log(strLog + ': skip');
            if (fs.existsSync(oldFile))
                fs.renameSync(oldFile, file);
//            obj = nextStep();
//            if (!obj)
//                break;
        }
        obj = nextStep();
        if (!obj)
            break;
    }
}

function run(obj) {
    setTimeout(function() {
        inside(obj)
    }, 1);
}

function nextStep() {
    if (z < maxZoom) {
        if (x < curTiles - 1) {
            if (y < curTiles - 1) {
                y++;
            }
            else {
                x++;
                y = 0;
            }
        }
        else {
            x = y = 0;
            z++;
            if (z >= maxZoom)
                return null;
            curTiles = calcCountTiles(z);
        }
        return {z : z, x : x, y : y};
    }
    return null;
}

!function() {
    //z = 9;
    //x = 276;
    z = 0;
    x = 0;
    curTiles = calcCountTiles(z);
    y = 0;
    s = l[li];

    run({z : z, x : x, y : y});
}();