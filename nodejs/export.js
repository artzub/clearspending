/**
 * Created by artzub on 24.04.2014.
 */

!function() {
    var mongoose = require('mongoose');
    var sys = require('sys');
    var fs = require('fs');

    var opened
        , db
        ;

    var args = process.argv.slice(2);

    function connect(err) {
        if (err) {
            console.error(sys.inspect(err));
            return;
        }

        if(opened) {
            opened = false;
            console.log('disconnecting...!');
            mongoose.connection.close(function() { });
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

    var all
        , fixed = 0
        , cursor
        , timer
        , inrun = 0
        , customers
        , suppliers

        , result = {
            contracts : [],
            customers : [],
            suppliers : [],
            budgetLevels : []
        }
        , hashSuppliers = {}
        , hashCustomers = {}
        , hashBudgeLevels = {}

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

    var visited = {};

    function processDb() {
        var contracts = db.db.collection('contract');
        customers = db.db.collection('customer');
        suppliers = db.db.collection('supplier');

        var query = {
            //signDate : /2013-01-.*/, price : {$gte : 1000000}
            signDate : /2013.*/, price : {$gte : 500000000}
        };

        contracts.count(query, function(err, count) {
            if (err)
                throw err;
            all = count;
            cursor = contracts.find(query);
            run();
        });
    }

    function saveDataToFile(data) {
        try {
            var filename = (args || [])[0] || 'result.json';
            fs.open(filename, "w", 0644, function (err, file_handle) {
                if (err) {
                    console.log(err);
                    return;
                }
                fs.write(file_handle, JSON.stringify(data, null, 2), null, 'utf8', function (err, written) {
                    if (err) {
                        console.log(err);
                    }
                    fs.close(file_handle);
                });
            });
        }
        catch (e) {
            console.log(e);
        }
    }

    function run() {
        if (opened && inrun >= all) {
            //console.log(JSON.stringify(result/*, null, 2*/));
            saveDataToFile(result);
            connect();
            return;
        }

        var l = 10;
        while(l-- && opened)
            setTimeout(function() {
                opened &&
                    cursor.next(handleContract);
            }, 100);
    }

    function handleContract(err, item) {
        if (!item || visited[item._id] || inrun >= all || !opened) {
            return;
        }

        visited[item._id] = 1;

        customers.findOne({_id : item.customer_id}, handleCustomer(item));
    }

    function handleCustomer(contr) {
        return function(err, item) {
            if(!item || !item.latlng || !item.latlng.length) {
                inrun++;
                run();
                return;
            }

            suppliers.findOne({_id : contr.supplier_id}, handleSupplier(contr, item));
        }
    }

    function getCustomer(d) {
        return {
            _id: d._id,
            latlng: d.latlng,
            name: (d.shortName || "").trim(),
            address : d.factualAddress.addressLine
        }
    }

    function getSupplier(d) {
        return {
            _id: d._id,
            name: (d.organizationName || "").trim(),
            latlng: d.latlng,
            address : d.factualAddress && d.factualAddress != '-' ? d.factualAddress : d.postAddress
        }
    }

    function handleSupplier(contr, cust) {
        return function(err, item) {
            if (!item || !item.latlng || !item.latlng.length) {
                inrun++;
                run();
                return;
            }

            var b = contr.finances.budgetLevel || {code : "01", name : "федеральный бюджет"} ;
            var bi = hashBudgeLevels[b.code];
            if (typeof bi === "undefined")
                bi = hashBudgeLevels[b.code] = result.budgetLevels.push(b);

            var s = hashSuppliers[item._id];
            if (typeof s === "undefined")
                s = hashSuppliers[item._id] = result.suppliers.push(getSupplier(item)) - 1;

            var c = hashCustomers[cust._id];
            if (typeof c === "undefined")
                c = hashCustomers[cust._id] = result.customers.push(getCustomer(cust)) - 1;

            result.contracts.push({
                _id: contr._id,
                regNum : contr.regNum,
                sd: contr.signDate,
                pd: contr.publishDate,
                prd: contr.protocolDate,
                p : contr.price,
                pt : contr.product || 0,
                b : bi,
                c: c,
                s: s
            });
            console.log(inrun + '/' + all);
            inrun++;
            run();
        }
    }
}();