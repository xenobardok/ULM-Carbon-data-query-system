var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

// Connection URL
var url = 'mongodb://sunil.jamkatel7:911emergency@ds125113.mlab.com:25113/fluxdatabase';

var findDocuments = function(db, callback) {
  // Get the documents collection
  var collection = db.collection('fluxdata');
  // Find some documents
  collection.find({"day":306}).toArray(function(err, docs) {
    assert.equal(err, null);
    console.log("Found the following records");
    
    callback(docs);
  });
}

// Use connect method to connect to the server
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected successfully to server");

  findDocuments(db, function() {
      console.log(db)
      db.close();
    });
});