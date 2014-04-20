/**
 * Created by artzub on 29.03.2014.
 */

var d3 = require("d3")
    , fs = require("fs")
    , sys = require("sys")
    ;

function loadData() {
    var csaw = require("./js/clearspending.js")
        ;

    var allContracts = [];
    var hashContracts = d3.map({});
    var loaded = 0, total = 0;

    function fun(err, req) {
        if (err) {
            console.log('error', err);
        }
        else {
            var data;
            if (req.responseText) {
                try {
                    data = JSON.parse(req.responseText);
                }
                catch (e) {
                    data = {message: req.responseText};
                }
                //console.log('data', data);
                if (data.contracts && data.contracts.total) {
                    total = data.contracts.total;
                    if (data.contracts.data && data.contracts.data.length) {
                        loaded += data.contracts.data.length;
                        runDataParser(data.contracts.data);
                        console.log(loaded + " of " + total);
                        m++;
                    }
                }
            }
        }
        run();
    }

    function runDataParser(data) {
        setTimeout(getDataParser(data), 300);
    }

    function getDataParser(data) {
        return function() {
            if (!(data && data instanceof Array && data.length))
                return;

            //data.forEach(parseContract);
            saveDataToFile(data);
        }
    }

    function saveDataToFile(data) {
        try {
            fs.open("E:/Temp/grabber/contracts_02_01_2013_" + Date.now() + ".json", "a", 0644, function (err, file_handle) {
                if (err) {
                    console.log(err);
                    return;
                }
                fs.write(file_handle, JSON.stringify(data), null, 'utf8', function (err, written) {
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

    function parseContract(d) {
        var cont = hashContracts.get(d.id);
        if (typeof cont === "undefined") {
            hashContracts.set(d.id, allContracts.push(d) - 1);
            cont = hashContracts.get(d.id);
        }
    }

    csaw.ApiKey = 'oTulPsl8c1dH9yAWa3TRyaYECdKIN94D';
    //var rq = csaw.RequestContractsSelect();
    //rq.dateRange = '01.01.2013-01.01.2014';
    var i = (3437474 / 50) + 1;
    var m = 1;
    loaded = m * 50;
    console.log('run!!!');
    function run() {
        console.log('page : ' + m);
        if (m > i)
            return;
        setTimeout((function (p) {
            return function () {
                var rq = csaw.RequestContractsSelect();
                rq.dateRange = '02.01.2013-03.01.2013';
                rq.page = p;
                rq.get(fun);
            };
        })(m), 100);
    }
    run();
}

function mergeData() {
    var hasContract = {}
        , contracts = []
        , dir = 'E:/Temp/grabber/'
        , allFiles
        ;

    function processFiles() {
        l = allFiles.length;

        setTimeout(inFile, 100);
    }

    var reg = new RegExp("contracts\\d+\\.json")
        , l
        , cur = 0
        ;

    function log(msg) {
        console.log('[' + cur + '/' + l + '] : ' + msg);
    }

    function inFile() {
        var file = allFiles[cur++];

        if (!reg.test(file)) {
            log('ignore file ' + file);
            return;
        }

        try {
            var cs = require(dir + file);
            if (cs) {
                cs.forEach(parseContract);
                log('completed file ' + file);
            }
            else
                log('error load file ' + file);
        }
        catch (e) {
            log('error load file ' + file + '. Error ' + e);
        }
        if (contracts.length > 49950 || cur >= l) {
            saveData(contracts.splice(0))();
        }
        else
            setTimeout(inFile, 100);
    }

    function saveData(css) {
        return function() {
            try {
                var file = "E:/Temp/grabberRes/result_" + Date.now() + ".json";
                fs.open(file, "a", 0644, function (err, file_handle) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    fs.write(file_handle, JSON.stringify(css), null, 'utf8', function (err, written) {
                        if (err) {
                            console.log(err);
                        }

                        console.log('save into file ' + file);

                        fs.close(file_handle);

                        setTimeout(inFile, 100);
                    });
                });
            }
            catch (e) {
                console.log(e);
            }
        }
    }

    fs.readdir(dir, function(err, files) {
        if (err) {
            console.log(err);
            return;
        }
        allFiles = files;
        setTimeout(processFiles, 300);
    });

    function parseContract(d) {
        var c = hasContract[d.id];
        if (typeof c !== "undefined")
            return;
        hasContract[d.id] = contracts.push(d) - 1;
    }
}

function loadDataToDb() {
    var mongoose = require('mongoose');

    var opened
        , finished
        , listRename = []
        , db
        ;

    function getHandleRename(item) {
        return function(err, res) {
            if (err) {
                listRename.push(item);
            }
        }
    }

    function loopRename() {
        if(finished)
            clearInterval(intLoopRename);
        var item = listRename.shift();

        item &&
        fs.rename(item.source, item.target, getHandleRename(item));
    }
    var intLoopRename = setInterval(loopRename, 1);

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
            console.error('connection error:' + sys.inspect(err));
        });

        db.once('open', function () {
            console.log('connection successfully!');

            opened = true;
            fs.readdir(dir, function (err, files) {
                if (err) {
                    console.log(err);
                    return;
                }
                allFiles = files;
                setTimeout(processFiles, 300);
            });
        });
    }
    connect();

    var collection;
    var hasContract = {}
        , contracts = []
        , dir = 'E:/Temp/grabberRes/'
        , dirMove = 'E:/Temp/grabber/'
        , allFiles
        ;

    function processFiles() {
        l = allFiles.length;

        setTimeout(inFile, 100);
    }

    var reg = new RegExp(".*.json")
        , l
        , cur = 0
        , inserting = 0
        ;

    function log(msg) {
        console.log('[' + cur + '/' + l + ' (' + inserting + ')] : ' + msg);
    }

    function inFile() {
        if (cur >= l) {
            finished = true;
            mongoose.connection.close(function(err){ console.log(err) });
            return;
        }

        var file = allFiles[cur++];

        if (!reg.test(file)) {
            log('ignore file ' + file);
            setTimeout(inFile, 100);
        }
        else {
            try {
                var cs = require(dir + file);
                if (!cs)
                    throw new Error('not load data' + file);

                //db.db.collection('test_contracts')
                collection = collection || db.db.collection('test_contracts');
                cs.forEach(insertIntoCollection(collection));
                log('completed file ' + file);
                fsrenameSync(dir + allFiles[cur - 1], dirMove + 'ok_' + allFiles[cur - 1]);
                setTimeout(inFile, 100);
            }
            catch (e) {
                log('error load file ' + file + '. Error ' + sys.inspect(e));
                fsrenameSync(dir + allFiles[cur - 1], dirMove + 'err_' + allFiles[cur - 1]);
                setTimeout(inFile, 100);
            }
        }
    }

    fs.readdir(dir, function(err, files) {
        if (err) {
            console.log(err);
            return;
        }
        allFiles = files;
        setTimeout(processFiles, 300);
    });

    function handleCopyFile(err) {
        if(err)
            console.error(sys.inspect(err));
    }

    function handleInsert(err, result) {
        /*var cont = true;
        try {
            if (err) {
                console.error(err.err);
                fsrenameSync(dir + allFiles[cur - 1], dirMove + 'err_' + allFiles[cur - 1]);
            }
            else {
                fsrenameSync(dir + allFiles[cur - 1], dirMove + 'ok_' + allFiles[cur - 1]);
                inserting += result.length;
                if(inserting >= 500000) {
                    cont = false;
                    inserting = cur = 0;
                    connect();
                }
            }
        }
        catch(e) {
            //sys.puts(sys.inspect(e));
        }
        cont && setTimeout(inFile, 100);*/

        if (!err) {
            inserting++;
        }
    }

    function fsrenameSync(s, t) {
        listRename.push({source:s, target:t});
    }

    function insertIntoCollection(coll) {
        return function(d) {
            coll.insert(d, handleInsert);
        }
    }

    function parseContract(d) {
        collection.insert(d, handleInsert);
    }

    function copyFile(source, target, cb) {
        var cbCalled = false;

        var rd = fs.createReadStream(source);
        rd.on("error", function(err) {
            done(err);
        });
        var wr = fs.createWriteStream(target);
        wr.on("error", function(err) {
            done(err);
        });
        wr.on("close", function(ex) {
            done();
        });
        rd.pipe(wr);

        function done(err) {
            if (!cbCalled) {
                cb(err);
                cbCalled = true;
            }
        }
    }
}
loadDataToDb();
