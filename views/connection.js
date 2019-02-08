var mysql = require('mysql');

const db = mysql.createConnection({
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: 'password',
    database: 'fluxdatabase'
});

db.connect(function(err){
    if(err){
        throw err;
    }
    console.log('MySql Connected!!');
})

module.exports = db;