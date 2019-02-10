const express = require('express'),
    fileUpload = require('express-fileupload'),
    bodyParser = require('body-parser'),
    { convertCSVToArray } = require('convert-csv-to-array'),
    ObjectsToCsv = require('objects-to-csv'),
    fs = require('fs'),
    app = express();
    
app.use(bodyParser.urlencoded({extended:true}));
app.use(fileUpload({
    safeFileNames:true,
    preserveExtension:true
}));
let totalData;
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
    let totalData = new Object();
    if(req.query.date){
        let date = req.query.date.date;
        console.log(date);
        let year = date.slice(-4);
        var d = daysCalc(year, date);
        // console.log(req.query.date.varChoose);
        let sql = "SELECT * FROM fluxdata WHERE day = ?";
        db.query(sql, d , function(err, data){
            if(err){
                console.log(err);
            } else {
                totalData = data;
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
                    totalData = data;
                    res.render('data', {data:data, variable:req.query.range.varChoose});
                }
            })
        }
        else if(parseInt(y1)<parseInt(y2)){
            if(parseInt(y1)+1<parseInt(y2)){
                res.send("please choose a valid year range. Remember, you can only have a year difference of 1");
            }
            let sql = "select * from fluxdata where year>= "+ y1 +" and day >= "+d1 + " union select * from fluxdata where year<= "+ y2 +" and day <= " + d2 +" order by year,day";
            db.query(sql, function(err, data){
                if(err){
                    console.log(err);
                } else {
                    totalData=data;
                    res.render('data', {data:data, variable:req.query.range.varChoose});
                }
            })
            
        }
    
    }
    else {
        res.render('info', {info:"Something went wrong, please check your input"});
    };

});

app.get('/upload', function(req, res){
    res.render('upload');
});

app.post('/upload', function(req,res){
    const header = ['year', 'day', 'time', 'Hs', 'tau', 'u_star', 'Ts_stdev', 'Ts_Ux_cov', 'Ts_Uy_cov', 'Ts_Uz_cov', 'Ux_stdev', 'Ux_Uy_cov', 'Ux_Uz_cov', 'Uy_stdev', 'Uy_Uz_cov', 'Uz_stdev', 'wnd_spd', 'rslt_wnd_spd', 'wnd_dir_sonic', 'std_wnd_dir', 'wnd_dir_compass', 'Ux_Avg', 'Uy_Avg', 'Uz_Avg', 'Ts_Avg', 'sonic_azimuth', 'sonic_samples_Tot', 'no_sonic_head_Tot', 'no_new_sonic_data_Tot', 'amp_l_f_Tot', 'amp_h_f_Tot', 'sig_lck_f_Tot', 'del_T_f_Tot', 'aq_sig_f_Tot', 'sonic_cal_err_f_Tot', 'Fc_wpl', 'LE_wpl', 'Hc', 'CO2_stdev', 'CO2_Ux_cov', 'CO2_Uy_cov', 'CO2_Uz_cov', 'H2O_stdev', 'H2O_Ux_cov', 'H2O_Uy_cov', 'H2O_Uz_cov', 'Tc_stdev', 'Tc_Ux_cov', 'Tc_Uy_cov', 'Tc_Uz_cov', 'CO2_mean', 'H2O_mean', 'amb_tmpr_Avg', 'amb_press_mean', 'Tc_mean', 'rho_a_mean', 'Fc_irga', 'LE_irga', 'CO2_wpl_LE', 'CO2_wpl_H', 'H2O_wpl_LE', 'H2O_wpl_H', 'irga_samples_Tot', 'no_irga_head_Tot', 'no_new_irga_data_Tot', 'irga_bad_data_f_Tot', 'gen_sys_fault_f_Tot', 'sys_startup_f_Tot', 'motor_spd_f_Tot', 'tec_tmpr_f_Tot', 'src_pwr_f_Tot', 'src_tmpr_f_Tot', 'src_curr_f_Tot', 'irga_off_f_Tot', 'irga_sync_f_Tot', 'amb_tmpr_f_Tot', 'amb_press_f_Tot', 'CO2_I_f_Tot', 'CO2_Io_f_Tot', 'H2O_I_f_Tot', 'H2O_Io_f_Tot', 'CO2_Io_var_f_Tot', 'H2O_Io_var_f_Tot', 'CO2_sig_strgth_f_Tot', 'H2O_sig_strgth_f_Tot', 'CO2_sig_strgth_mean', 'H2O_sig_strgth_mean', 'T_tmpr_rh_mean', 'e_tmpr_rh_mean', 'e_sat_tmpr_rh_mean', 'H2O_tmpr_rh_mean', 'RH_tmpr_rh_mean', 'rho_a_tmpr_rh_mean', 'Rn_Avg', 'Rn_meas_Avg', 'Rain_TE525_Tot', 'LWS_mV_Avg', 'LWS_mV_Max', 'LWS_mV_Min', 'WetSeconds', 'WindSpd_WXT_mean', 'WindDir_WXT_mean', 'WindDir_WXT_StdDev', 'AirTemp_WXT_Avg', 'RH_WXT', 'AirPress_WXT', 'Rain_WXT_Tot', 'Hits_WXT_Tot', 'PAR_Den_Avg', 'PAR_Tot_Tot', 'panel_tmpr_Avg', 'batt_volt_Avg', 'slowsequence_Tot'];
    if (Object.keys(req.files).length == 0) {
        return res.status(400).render('info', {info:"No files were uploaded"});
    }
    let fluxFile = req.files.fluxFile;
    let filePath =__dirname+'\\newUploads\\'+fluxFile.name;
    fluxFile.mv(filePath, function(err){
        if(err)
            res.render('info',{info:err});
    });

    fs.readFile(filePath, 'utf8', (err, data)=>{
        // console.log(data);
        const resultArray = convertCSVToArray(data, {
            type: 'array',
            separator: ',', // use the separator you use in your csv (e.g. '\t', ',', ';' ...)
        });
        try {
            let single = resultArray[0];
            // console.log(single);
            let sql = "SELECT * from fluxdata where year="+single[0]+" AND day = " + single[1]+ " and time = "+ single[2];
            console.log(sql);
            db.query(sql, function(err, data){
                if(err){
                    console.log(err);
                    res.send(err);
                } else {
                    // console.log(data);
                    if(data.length>0){
                        fs.unlink(filePath, (err) => {
                            if (err) console.log(err);
                        });
                        res.status(400).render("info", {info:"Duplicate data found! Please add new data"});
                    } else{
                        sql = "INSERT INTO fluxdata VALUES ? ";
                        // console.log(resultArray[0].length);
                        db.query(sql, [resultArray], (err, result) => {
                            if (err) 
                                res.render('info', {info:"There is some error with the sql command, please contact the developer"});;
                            console.log("Number of records inserted: "+ result.affectedRows);
                            fs.unlink(filePath, (err) => {
                                if (err) console.log(err);
                            });
                            res.render('info', {info: ("Number of records inserted: "+ result.affectedRows)});
                        })
                    } 
                }
            })
        } catch (error) {
            console.error(error);
            res.render('info', {info:"There is some error with the file, make sure you are uploading a correctly formatted csv file"});
        }
        
    });

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
