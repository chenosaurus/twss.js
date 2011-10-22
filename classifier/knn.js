var docUtils = require("../utils/document")
  , analyze  = require("../utils/analyze");

var getDistance = function(doc1, doc2, numWordsInNgram) {
  if (!numWordsInNgram) numWordsInNgram = 1;

  var tfidf = analyze.getTfidf( [doc1, doc2], numWordsInNgram )
    , distance = 0;

  for (var ngram in tfidf[0]) {
    var neighbourTfidf = tfidf[1][ngram];

    if (neighbourTfidf === undefined) neighbourTfidf = 0;

    distance += Math.abs( tfidf[0][ngram] - neighbourTfidf );
  }

  return distance;
};

exports.isTwss = function(options) {
  var promt           = docUtils.cleanDocument(options.promt)
    , trainingData    = options.trainingData  || {}
    , numNeighbours   = options.numNeighbours || 3
    , numWordsInNgram = options.numWordsInNgram || 1
    , promts          = [];

  // TODO: Optimize by creating the neighbourhood as the distances are calculated
  for (var trainingType in trainingData) {
    var data = trainingData[trainingType];

    for (var i = 0; i < data.length; i++) {
      var trainingPromt = data[i];

      promts.push({
        "distance": getDistance( promt, trainingPromt, numWordsInNgram ),
        "type":     trainingType,
        "promt":    trainingPromt
      });
    }
  }

  // Sort after distance (asc)
  promts.sort(function(a, b) {
    return a.distance - b.distance;
  });

  // We don't need to know how many negative neighbours there are since that can be easily deduced
  var numPosPromts = 0;
  for (var neighbour = 0; neighbour < numNeighbours; neighbour++) {
    if ( promts[neighbour].type == 'pos' ) numPosPromts++;

    // If the majority of promts are positive, it is a twss promt
    if ( numPosPromts > numNeighbours >> 1 ) return true;
  }

  return false;
};

/*
Added the KNN classifier, tfidf algorithm and fixed small aesthetical issues
Major
* Using KNN in the bot
* Added the tfidf algorithm to analyze.js

Minor
* Added a dot to a multiline comment in nbc.js
* Bot ignores tweets with @
* Fixed the name of kss.js to knn.js
* Added a todo in analyze.js and document.js

*/
