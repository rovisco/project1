var express = require('express');
var mongoose = require('mongoose')

var uri = 'mongodb://localhost/epgdb';
global.db = mongoose.createConnection(uri);

var routes = require('./routes')

var app = express();

// The number of milliseconds in one day
var oneDay = 86400000;

// Use compress middleware to gzip content
app.use(express.compress());
//app.use(express.bodyParser());
app.use(express.bodyParser({uploadDir:'./uploads'}));

// Serve up content from public directory
app.use(express.static(__dirname + '/public', { maxAge: oneDay }));
app.post('/upload', routes.upload);
app.get('/tvchannels', routes.tvChannels);
app.get('/tvChannelStats', routes.tvChannelStats);
app.get('/programs/:channelNr', routes.programs);

app.listen(process.env.PORT || 8000, function () {
  console.log('listening on http://localhost:8000');
})