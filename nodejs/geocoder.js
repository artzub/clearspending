/**
 * Created by artzub on 21.04.2014.
 */

var MultiGeocoder = require('multi-geocoder'),
    geocoder = new MultiGeocoder({
        //provider: 'google', //'yandex',
        coordorder: 'latlong',
        lang: 'ru-RU'
    });

function findSuppliers() {
    var mongoose = require('mongoose');

    var opened
        , db
        ;

    function connect(err) {
        if (err) {
            console.error(sys.inspect(err));
            return;
        }

        if(opened) {
            opened = false;
            console.log('disconnecting...!');
            mongoose.connection.close(connect);
            return;
        }

        console.log('disconnect successfully!');

        mongoose.connect('mongodb://localhost/clearspending');
        db = mongoose.connection;

        db.on('error', function (err) {
            console.error('connection error:' + err);
        });

        db.once('open', function () {
            console.log('connection successfully!');

            opened = true;
            setTimeout(processDb, 300);
        });
    }
    connect();

    var collection
        , all
        , fixed = 0
        , cursor
        , timer
        , inrun = 0
        ;

    function log(fixed, id, err) {
        console.log([
            'run: ',
            inrun,
            ' [',
            fixed,
            '/',
            all,
            '] ',
            id,
            ' | ',
            typeof err !== 'undefined' ? err : ''
        ].join(''));
    }

    function processDb() {
        collection = db.db.collection('customer');

        collection.count({latlng : null, latlng_notfound: null}, function(err, count) {
            if (err)
                throw err;
            all = count;
            cursor = collection.find({latlng : null, latlng_notfound: null});
            run();
        });
    }

    function run() {
        var l = 10;
        while(l--)
        setTimeout(function() {
            inrun++;
            cursor.next(getCoordinate);
        }, 100);
    }

    function getCoordinate(err, item) {
        inrun--;
        if (!item) {
            return;
        }

        var address = item.factualAddress;
        if (address) {
            var adds = address.addressLine.split(',');
            var l = adds.length;
            address = adds[1].trim() + ', ' + adds[l - 4].trim() + ', ' + adds[l - 3].trim() + ', ' + adds[l - 2].trim();
        }

        if(item.latlng || item.latlng_notfound || !address) {
            //log(fixed++, item._id, 'skip');
            run();
        }
        else {
            //address = address.trim().split('\n')[0].replace('Юридический адрес:', '').trim();

            /*if (!item.latlng) {
                console.log(JSON.stringify({ _id :  item._id , adr : address }));
                run();
                return;
            }*/

            geocoder.geocode([address])
                .then(handleGetCoordinate(item));
        }
    }

    function handleGetCoordinate(item) {
        return function(res) {
            try {
                if (res && res.type == 'FeatureCollection' && res.features && res.features.length) {
                    var latlng = res.features[0];

                    fixed++;
                    if (latlng.geometry && latlng.geometry.coordinates) {
                        item.latlng = latlng.geometry.coordinates;
                        collection.save(item, handleUpdate(item));
                    }
                    else {
                        item.latlng_notfound = true;
                        collection.save(item, handleUpdate(item));
                    }
                }
                else {
                    throw new Error('not found data');
                }
            }
            catch (e) {
                log(fixed, item._id, e);
                run();
            }
        }
    }

    function handleUpdate(item) {
        return function(err, res) {
            log(fixed, item._id, err ? err : item.latlng ? '+' : '-');
            run();
        }
    }
}
findSuppliers();
