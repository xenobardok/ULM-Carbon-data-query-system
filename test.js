var express = require('express'),
    app = express();


const db = require('./views/connection.js');

   var port = 80;

app.use('/assets', express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.locals.fulldate = function(year, day) {
    var year = year - 1;
    var dat = new Date('12/31/'+year);
    dat.setDate(dat.getDate() + day);

    return dat.toLocaleDateString("en-US");
}

app.get('/', function(req, res){
    let sql = ""
    res.render('index');
})

app.get('/query', function(req,res){
    res.render('query');
});

app.get('/range', function(req,res){
    res.render('range');
});

app.get('/data', function(req,res){
    if(req.query.date){
        let date = req.query.date.date;
        console.log(date);
        let year = date.slice(-4);
        var d = daysCalc(year, date);
        console.log(req.query.date.varChoose);
        let sql = "SELECT * FROM fluxdata WHERE day = ?";
        db.query(sql, d , function(err, data){
            if(err){
                console.log(err);
            } else {
                res.render('data', {data: data, variable:req.query.date.varChoose});
            }
        })
    }
    else if(req.query.range){
        let q = req.query.range;
         console.log(q.begin);
         console.log(q.end);
        var y1 = q.begin.slice(-4);
        var y2 = q.end.slice(-4);
        var d1 = daysCalc(y1, q.begin);
        var d2 = daysCalc(y2, q.end);
        console.log("year1:"+y1 +" year2:"+ y2+ " days1"+ d1+ " days2:"+ d2);
        
        if(y1===y2){
            let sql = "SELECT * FROM fluxdata WHERE year = " + db.escape(y1) + " AND day BETWEEN " + d1 + " AND "+ d2+" ORDER BY year, day";
            db.query(sql, function(err, data){
                if(err){
                    console.log(err);
                } else {
                    res.render('data', {data:data, variable:req.query.range.varChoose});
                }
            })

            // Flux.find({year:{$gte:y1, $lt: y2+1}, day: {$gte:d1, $lt: d2+1}}, function(err, data){
            //     if(err){
            //         console.log(err);
            //     } else {
            //         res.render('data', {data:data});
            //     }
            // }).sort({day:1});
        }
        else if(y1<y2){
            let sql = "SELECT * FROM fluxdata WHERE year >= "+ y1 + " AND day >= "+ d1 + " AND year <= "+ y2+ " AND day < "+ d2 +" ORDER BY year, day";
            db.query(sql, function(err, data){
                if(err){
                    console.log(err);
                } else {
                    res.render('data', {data:data, variable:req.query.range.varChoose});
                }
            })
        }
        // Flux.find({
        //     $or : [
        //         { year: y1, day: {$gte: d1} },
        //         { year: y2, day: {$lte: d2+1 } }
        //     ]
        // }, function(err, data){
        //     if(err){
        //         console.log(err);
        //     } else {
        //         res.render('data', {data:data});
        //     }
        // }).sort({year:1, day:1});
    
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

app.get('*', function(req,res){
    res.send('404 error!');
});

app.listen(port, function(err){
    if(!err){
        console.log("Server has started!");
    }
})

function daysCalc(year, fuldate){
    
    var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
    var firstDate = new Date(year,0,0);
    var secondDate = new Date(fuldate);

    var diffDays = Math.ceil((secondDate - firstDate)/oneDay);
    // console.log(diffDays);
    return diffDays;
}
