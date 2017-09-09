var express = require('express'),
    mongoose = require('mongoose'),
    app = express(),
    data = require('./data'),
    MongoClient = require('mongodb').MongoClient,
    fluxSchema = require('./schema/fluxSchema'),
    file = require('./convertcsv.json');

var port = 3000 || process.env.PORT,
    url = 'mongodb://test:test@ds125113.mlab.com:25113/fluxdatabase';

app.use('/assets', express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
mongoose.connect(url, {useMongoClient: true});
app.locals.fulldate = function(year, day) {
    var year = year - 1;
    var dat = new Date('12/31/'+year);
    dat.setDate(dat.getDate() + day);
    return dat;
}
var Flux = mongoose.model('fluxdata', fluxSchema);

app.get('/', function(req, res){
    res.render('index');

    // Flux.collection.insertMany(file, function(err,r){
    //     if(err){
    //         console.log(err);
    //     }
    // });
})

app.get('/query', function(req,res){
    res.render('query');
});

app.get('/range', function(req,res){
    res.render('range');
});

app.get('/data', function(req,res){
    if(req.query.search){
        let q = req.query.search;
        var d = daysCalc(q.year, q.month, q.day);


        Flux.find({year: q.year, day: d}, function(err, data){
        if(err){
            console.log(err);
        } else {
            res.render('data', {data: data});
        }
    })}
    else if(req.query.que){
        let q = req.query.que;        
        var d1 = q.begin;
        var d2 = q.end;
        Flux.find({day: {$gte:d1, $lt: d2}}, function(err, data){
            if(err){
                console.log(err);
            } else {
                res.render('data', {data:data});
            }
        })
    }
    else if(req.query.date){
        let date = req.query.date;
        var year = date.slice(-4);
        console.log(year);
    }
    else {
    Flux.find({}, function(err, data){
        if(err){
            console.log(err);
        } else {
            res.render('data', {data: data});
        }
    })};

});

app.listen(port, function(err){
    if(!err){
        console.log("Server has started!");
    }
})

function daysCalc(yr, mth, day){
    var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
    var firstDate = new Date(yr,0,0);
    var secondDate = new Date(yr,mth-1,day);

    var diffDays = Math.ceil((secondDate - firstDate)/oneDay);
    console.log(diffDays);
    return diffDays;
}