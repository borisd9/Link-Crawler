var mongoose = require('mongoose');
var Promise = require('promise');
var uniqueValidator = require('mongoose-unique-validator');

// Establish connection to DB
var connection = mongoose.connect('mongodb://localhost/test');

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('connection to db established successfully');
});

// Create schema for link entity
var linkSchema = new mongoose.Schema({
  type: String,
  title: String,
  link:

  //
  {
    type: String,
    unique: true,
  },
  parent: String,
});

// model var
var model;

var createModelDb = function (name) {
  linkSchema.plugin(uniqueValidator, {
    message: 'Error, expected "{VALUE}" to be Unique',
  });
  model = db.model(name, linkSchema);
  console.log('model created ' + name);

  //model.collection.ensureIndex({ link: 1 });
};

// Save to db function as a promise
var saveToDb = function (data) {
  return new Promise(function (resolved, rejected) {
    var obj = {
      type: data.type,
      title: data.title,
      link: data.link,
      parent: data.parent,
    };

    // create model
    var link = new model(obj);

    // save model to db, wont add if the value is not unique
    link.save(function (err, item) {
      resolved();
    });
  });
};

// Save to db function as a promise
var bulkSave = function (arr) {
  return new Promise(function (resolved, rejected) {
    // save model to db, wont add if the value is not unique
    console.log('Bulk inserting ' + arr.length + ' items');
    model.collection.insert(arr, {
      ordered: false,
    });

    function onInsert(err, docs) {
    if (err) console.log('EGGS ' + err);

    resolved();
  }

  });

};

// Find links by query function, query is JSON object
var findLinksDb = function (query, callback) {
  model.find(query, function (err, links) {
    if (err)
      callback(err.errors.link.message, null);
    else {
      callback(null, links);
    }
  });
};

var clearLinksDb = function (query) {
  console.log('removing ..');
  model.find(query, function (err, links) {
    links.forEach(function (link) {
      link.remove();
    });
  });
};

//Exports
module.exports.createModelDb = createModelDb;
module.exports.saveToDb = saveToDb;
module.exports.findLinksDb = findLinksDb;
module.exports.clearLinksDb = clearLinksDb;
module.exports.bulkSave = bulkSave;
