var request = require('request');
var cheerio = require('cheerio');
var collector = require('./linkCollector');
var url = require('url-parse');
var Promise = require('promise');

// Get first param which is URL to crawl
//var urlStart = process.argv[2];
var urlStart = url('http://www.w3schools.com');
console.log('starting crawler for ' + urlStart);

// Start lvl 1 crawl
var initializeCrawl = function () {
  return new Promise(function (resolved, rejected) {
    console.log('Parsing lvl 1 links');
    request(urlStart, function (err, res, body) {
      if (!err && res.statusCode == 200) {
        // Carse body
        var $ = cheerio.load(body);
        var result;

        // Initialize db and collect lvl 1 links from the body
        collector.initialCrawl($).then(function (numOfResult) {
          // print # of collected links
          console.log('Collected ' + numOfResult + ' on lvl 1 crawl');
          resolved();
        });
      } else {
        console.log('error ' + err);
        resolved();
      }
    });
  });
};

var getCrawlLinks = function (lvl) {
  return new Promise(function (resolved, rejected) {
    collector.findLinksDb({
      type: 'lvl ' + lvl,
    }, function (err, results) {
      if (err)
        console.log(err);
      else {
        resolved(results);
      }
    });
  });
};

////////////////////
var mainCrawl = function (currentLvl, results) {
  return new Promise(function (resolved, rejected) {

    // var promise = new Promise(function (resolved, rejected) {
    // Start lvl crawl
    console.log('Starting lvl ' + currentLvl + ' crawl for links for ' + collector.baseUrl);

    console.log('number of unique links: ' + results.length);
    var count = 0;
    var arr = [];
    results.forEach(function (item) {

      // crawl the site only, no outside links
      if (collector.baseUrl == url(item.link).hostname) {
        // crawl each lvl 1 link and collect them into db
        request(item.link, function (err, res, body) {
          if (!err && res.statusCode == 200) {
            // Parse body
            var $ = cheerio.load(body);

            collector.crawlLinks($, item.link, 'lvl ' + currentLvl, item._id).then(function (data) {
              ++count;

              console.log('parsed ' + count + ' out of ' + results.length);

              // console.log(data);

              data.forEach(function (item) {
                arr.push(item);
              });

              // collector.findLinksDb({ type: 'lvl ' + currentLvl }, function (err, results) {
              //   return results.map(function (i) {
              //     data = data.filter(function (item) {
              //       console.log('filtering ' + (item == i));
              //       return item == i;
              //     });
              //   });
              // });

              // console.log('EGGS OF DATA ' + arr);
              if (count == results.length) {
                console.log('EGGS MASSIVE BULK ' + arr.length);
                collector.bulkSave(arr);
                console.log('MASSIVE bulk save completed');
                resolved();

              }
            });
          }
        });
      }
    });

    // });

    // console.log('RESOLVING lvl 2 BEFORE PROMISE.ALL');
    //
    // //resolve promise
    // promise().then(function () {
    //   console.log('RESOLVED ALL LVL 2 WOHOOO , NUMBER OF LINKS ');
    //   resolve();
    // });

  });
};

// promises.map(function (promise) {
//   console.log('tTESTETST');
//   promise().then(function () {
//     count++;
//     console.log('wating to resolved rest at ' + count);
//     if (count == promises.length) {
//       console.log('RESOLVED ALL LVL 2 WOHOOO , NUMBER OF LINKS ' + count);
//       resolved();
//     }
//   });
// });

// Start lvl 1 crawl
initializeCrawl().then(function () {
  console.log('Lvl 1 crawl completed!');

  // Get links for lvl 2 crawl
  getCrawlLinks(1).then(function (results) {
    console.log('Added ' + results.length + ' unique links from lvl 1 to database.');

    // Start lvl 2 crawl
    mainCrawl(2, results).then(function () {
      console.log('LVL 2 CRAWL COMPLETE!!! WOHOOHOOHO');

      // Get links for lvl 3 crawl
      getCrawlLinks(2).then(function (results) {
        console.log('Added ' + results.length + ' unique links from lvl 2 to database.');

        // Start lvl 3 crawl
        mainCrawl(3, results).then(function () {
          console.log('LVL 3 CRAWL COMPLETE!!! WOHOOHOOHO');

          // collector.clearLinksDb({
          //   type: 'lvl 1',
          // });
          // collector.clearLinksDb({
          //   type: 'lvl 2',
          // });
          // console.log('removed links');
        });
      });
    });

  });

});

// crawl(2, 1);
// console.log('done sync crawled lvl 2');
// crawl(3, 2);
// console.log('done sync crawled lvl 3');
// });
//
