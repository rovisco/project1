
var epg = require('./controler')

exports.upload = function (req, res, next) {
	//console.log(req.files);
	//epg.loadEpg(req.files.file0,res,next);
	epg.newUploadEpg(req.files.file0,res,next);
	//res.send('file upload done:'+ loadResult);
}

exports.tvChannels = function (req, res, next) {
	epg.getEpgChannels(res,next);
}

exports.tvChannelStats = function (req, res, next) {
	epg.getChannelStats(res,next);
}

exports.programs  = function (req, res, next) {
	var channel = req.params.channelNr;
	console.log("param channel="+channel);
	if(!channel) return next("Channel not present");
	
	epg.getChannelPrograms(channel,res,next);
	
}