
var Schema = require('mongoose').Schema;


var epgSchema = Schema({ 
	filename: String, 
	filesize : Number,
	uploadDate :  {type : Date, default : Date.now },
	fromDate : Date,
	toDate : Date
});

var channelSchema = Schema({ 
	name: String, 
	position : Number,
	code : String,
	date : {type : Date, default : Date.now },
	_epg : { type: Schema.Types.ObjectId, ref: 'TvEpg' }
});

var scheduleSchema = Schema({ 
	channel: { type: Number, index: true },
	program : { type: Number, index: true },
	duration : Number,
	startTime : Date,
	_epg : { type: Schema.Types.ObjectId, ref: 'TvEpg' }
});

var programSchema = Schema({ 
	id : { type: Number, index: true },
	title : String,
	description : String,
	genre : Number,
	type : String,
	year : Number,
	duration : Number,
	origin : String,
	parental : String,
	episodeTitle : String,
	seriesId : { type: Number, index: true },
	episodeDesc : String,
	cast: [{ role: Number, order: Number, reference : Number }],
	_epg : { type: Schema.Types.ObjectId, ref: 'TvEpg' }
});

var nameSchema = Schema({ 
	id : { type: Number, index: true },
	firstName : String,
	lastName : String,
	middleName : String,
	_epg : { type: Schema.Types.ObjectId, ref: 'TvEpg' }
});

var genreSchema = Schema({ 
	id : { type: Number, index: true },
	value : String,
	mscname : String,
	_epg : { type: Schema.Types.ObjectId, ref: 'TvEpg' }
});

var channelStatsSchema = Schema({ 	
	position : Number, 
	name : String, 
	averageDuration : Number,
	nrSchedules : Number,
	nrPrograms : Number,
	nrEpisodes : Number,
	nrSeries : Number,
	title : Number,
	description : Number,
	shortDescription : Number,
	mediumDescription : Number,
	longDescription : Number,
	year : Number,
	type : Number,
	duration : Number,
	origin : Number,
	parental : Number,
	episodeTitle : Number,
	episodeDesc : Number,
	actor : Number,
	director : Number,
	totalActor : Number,
	totalDirector : Number,
	otherCast : Number,
	genre : Number,
	genreStats : [{ genre: Number, value: Number }],
	parentalStats :[{ parental: String, value: Number }],
	_epg : { type: Schema.Types.ObjectId, ref: 'TvEpg' }
});

// db is global
//compile Schemas
module.exports.TvChannel = db.model('TvChannel', channelSchema);
module.exports.TvSchedule = db.model('TvSchedule', scheduleSchema);
module.exports.TvProgram = db.model('TvProgram', programSchema);
module.exports.TvName = db.model('TvName', nameSchema);
module.exports.TvGenre = db.model('TvGenre', genreSchema);
module.exports.TvChannelStats = db.model('TvChannelStats', channelStatsSchema);
module.exports.TvEpg = db.model('TvEpg', epgSchema);
