// dependencies.
var express = require('express')
  , twitter = require('ntwitter')
  , _ = require('underscore')
  , path = require('path')
  , fs = require('fs');

//Create an express app
var app = express();

var api_key = 'TFq0DX5SwCWzDpEx6HBLtNTmA';
var api_secret = 'yv38LSlOFmzjaH0ijkW4fFLwXDb3PF7CVjdgvCk9CG94ii13YO';
var access_token = '1077979254-paG2anZXMWhes0Uftrfh40MBm7KgGYTzgfxyyiY';
var access_token_secret = 'YIqxqmevGCLm6suYz1iRmSSzBlVIiNB1cvWtXEl4ADF3i';

// Twitter tags array.
var watchSymbols = ['bomni'];

var watchList = {
    total: 0,
    symbols: {}
};

_.each(watchSymbols, function(v) { watchList.symbols[v] = 0; });

//Generic Express setup
app.set('port', process.env.PORT || 3000);
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/components', express.static(path.join(__dirname, 'components')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

var t = new twitter({
    consumer_key: api_key,
    consumer_secret: api_secret,
    access_token_key: access_token,
    access_token_secret: access_token_secret
});

t.stream('statuses/filter', { track: watchSymbols }, function(stream) {
  stream.on('data', function(tweet) {
    var claimed = false;
    if (tweet.text !== undefined) {
      var text = tweet.text.toLowerCase();
      _.each(watchSymbols, function(v) {
          if (text.indexOf(v.toLowerCase()) !== -1) {
              watchList.symbols[v]++;
              claimed = true;
          }
      });
      if (claimed) {
        if ('development' == app.get('env')) {
          console.log('tag found, updating file')
        }
        fs.writeFile( "output.txt", Date.now() ); 
      }
    }
  });
});