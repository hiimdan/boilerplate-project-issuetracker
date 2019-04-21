const MongoClient = require('mongodb');
const assert = require('chai').assert;

let _db;

function connectDB(cb) {
  MongoClient.connect(process.env.DB, function(err, db) {
    if (err) {return cb(err)}
    console.log('now connected to database');
    _db = db;
    cb(null);
  })
}

function getDB() {
  assert.isOk(_db, 'no database connection');
  return _db;
}

module.exports = {
  connectDB: connectDB,
  getDB: getDB
}
