var db = require('./dbDriver');
var url = require('url');
var Promise = require('promise');

//var urlStart = url.parse(process.argv[2]);
var urlStart = url.parse('http://www.w3schools.com/');

// Initialize database and add the relevant collection for crawl start
// db.createModelDb(urlStart.hostname);
db.createModelDb('test');

// Collect Links function - lvl 1
var initialCrawl = function ($) {
  return new Promise(function (resolved, rejected) {

    console.log('Collecting links from lvl 1, and saving them to DB');
    var collectedLinks = 0;

    // Collect links from the page
    var links = $('a[href]');

    var promises = [];

    // store Links in memory DB
    links.each(function (i, element) {
      var resolvedUrl = url.resolve(urlStart, $(this).attr('href'));

      // If link is valid, insert into DB
      if (resolvedUrl.indexOf('http') > -1) {
        var promise = db.saveToDb({
          type: 'lvl 1',
          title: $(this).text(),
          link: resolvedUrl,
          parent: '',
        });
        promises.push(promise);
      }
    });

    Promise.all(promises).then(function (data) {
      console.log('Resolved all save to db promises');
      resolved(promises.length);
    });

  });
};

// Collect Links function - lvl 2 - 5
var crawlLinks = function ($, crawlUrl, type, parent) {
  return new Promise(function (resolved, rejected) {

    // console.log('inside crawlLinks count ');

    // Collect links from the page
    var links = $('a[href]');
    var obj = [];
    var promises = [];
    var end = links.length;
    var count = 0;

    // store Links in memory DB
    links.each(function (item) {
      var resolvedUrl = url.resolve(urlStart, $(this).attr('href'));
      count++;

      // If link is valid, insert into DB
      if (resolvedUrl.indexOf('http') > -1) {
        // var promise = db.saveToDb
        var toInsert = {
          type: type,
          title: $(this).text(),
          link: resolvedUrl,
          parent: parent,
        };
        obj.push(toInsert);

        if (count = end) {
          // console.log('index ' + count + 'end ' + end);
          // console.log(obj);
          resolved(obj);
        }
      }

    });

    // Promise.all(promises).then(function () {
    //   console.log('Resolved links for LVL 2 crawl promises for ' + crawlUrl);
    //   resolved(promises.length);
    // });
  });
};

// Exports
module.exports.initialCrawl = initialCrawl;
module.exports.baseUrl = urlStart.hostname;
module.exports.crawlLinks = crawlLinks;

// DB exports
module.exports.db = db;
module.exports.bulkSave = db.bulkSave;
module.exports.findLinksDb = db.findLinksDb;
module.exports.clearLinksDb = db.clearLinksDb;
