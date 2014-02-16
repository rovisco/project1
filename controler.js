
var fs = require('fs');
var util = require('util');
var xml2js = require('xml2js');
var model = require('./model')

function processStats(next){

	model.TvChannel.find(function (err, docs) {
		if (err) return next(err);
	
		model.TvChannelStats.remove(function(err,doc){
			if (err) throw(err);
			for(var i in docs){
				stats = processChannelStats(docs[i].position,next);
			}
			console.log("*** Stats processed");
		});	
		
	});
}

function processChannelStats(channelNr,next) {

	model.TvChannel.findOne({ 'position' : channelNr },function (err, channel) {
		if (err) return next(err);
		//console.log("start stats for chanel read="+channel.name);
		
		model.TvSchedule.find({ 'channel' : channelNr }, function (err, docs) {
			if (err) return next(err);
			
			//console.log("schedules read="+docs.length);
					
			schedules = sortResults(docs,'program',true);
			
			previousId = -1;
			var programIdArray = new Array();
			for(i=0;i<schedules.length;i++){
				if (schedules[i].program > previousId){
					programIdArray.push(schedules[i].program);
					previousId = schedules[i].program;
				}
			}
			//console.log("Nr Program IDs="+programIdArray);
			
			model.TvProgram
				.find()
				.where('id').in(programIdArray)
				.sort('title')
				.exec(function (err, programs) {
					if (err) return next(err);
					//console.log("Nr Program read="+programs.length);
					
					//Cumpute average schedule duration
					var average=0;
					for(var i in docs) { 
						average += docs[i].duration; 
					}		
					average = Math.round(average/docs.length/60);
					//console.log("average duration ="+average);
					
					seriesIdList = new Array();
					
					var channelStats = { 
						position : channel.position, 
						name : channel.name, 
						averageDuration : average,
						nrSchedules : docs.length,
						nrPrograms : programs.length,
						nrEpisodes : 0,
						nrSeries : 0 ,
						title : 0,
						description : 0,
						shortDescription : 0,
						mediumDescription : 0,
						longDescription : 0,
						year : 0,
						type : 0,
						duration : 0,
						origin : 0,
						parental : 0,
						episodeTitle : 0,
						episodeDesc : 0,
						actor : 0,
						director : 0,
						totalActor : 0,
						totalDirector : 0,
						otherCast : 0,
						genre : 0,
						genreStats : [] ,
						parentalStats : [],
						_epg : channel._epg
						
					};
					
					
					for (var j in programs){
						aProgram = programs[j];
						if (aProgram.seriesId){
							channelStats.nrEpisodes++;
							seriesIdList.push(aProgram.seriesId);
						}
						if (aProgram.title) channelStats.title++;
						if (aProgram.genre){ 
							channelStats.genre++;
							itemFound = false;
							for(i=0;i<channelStats.genreStats.length;i++){
								if (channelStats.genreStats[i].genre == aProgram.genre){
									channelStats.genreStats[i].value++;
									itemFound = true;
									break;
								}
							}
							if(itemFound==false){
								newGenre = { genre : aProgram.genre , value : 1}
								channelStats.genreStats.push(newGenre);
							}
						}
						if (aProgram.description){
							channelStats.description++;
							if (aProgram.description.length<=15) channelStats.shortDescription++;
							if (aProgram.description.length>15 && aProgram.description.length<250)  channelStats.mediumDescription++;
							if (aProgram.description.length>=250) channelStats.longDescription++;
						}
						if (aProgram.year) channelStats.year++;
						if (aProgram.duration) channelStats.duration++;
						if (aProgram.origin) channelStats.origin++;
						if (aProgram.parental){ 
							channelStats.parental++;
							itemFound = false;
							for(i=0;i<channelStats.parentalStats.length;i++){
								if (channelStats.parentalStats[i].parental == aProgram.parental){
									channelStats.parentalStats[i].value++;
									itemFound = true;
									break;
								}
							}
							if(itemFound==false){
								newItem = { parental : aProgram.parental , value : 1}
								channelStats.parentalStats.push(newItem);
							}
						}
						if (aProgram.episodeTitle) channelStats.episodeTitle++;
						if (aProgram.episodeDesc) channelStats.episodeDesc++;
						if (aProgram.type) channelStats.type++;
						if (aProgram.cast){
							actorFound = false;
							directorFound = false;
							for (i=0;i<aProgram.cast.length;i++){
								if (aProgram.cast[i].role == 1){
									channelStats.totalActor++;
									if(actorFound == false){
										channelStats.actor++; 
										actorFound = true;
									}
								}
								else if (aProgram.cast[i].role == 2){
									channelStats.totalDirector++;
									if(directorFound == false){
										channelStats.director++; 
										directorFound = true;
									}
								}
								else channelStats.otherCast++;
							}
						}
						
						
					}
					//console.log("Nr episodes ="+ countEpisodes);					
					
					//remove duplicated series IDs
					uniqueSeriesIdList = seriesIdList.filter(function(elem, pos) {
						return seriesIdList.indexOf(elem) == pos;
					})
					//console.log("Nr unique series Ids ="+ uniqueSeriesIdList.length);

					channelStats.nrSeries = uniqueSeriesIdList.length;
					//console.log("Stats ="+util.inspect(channelStats,false,null));
					
					model.TvChannelStats.create(channelStats, function (err, doc) {
						if (err) throw(err);
						//console.log("Channel Stats inserted in DB");
					});
					
				});
			
		});
	});
}

exports.getChannelPrograms = function(channelNr,res,next) {

	model.TvSchedule.find({ 'channel' : channelNr }, function (err, docs) {
		if (err) return next(err);
		
		console.log("schedules read="+docs.length);
		
		sorted = sortResults(docs,'program',true);
		//console.log("sorted="+sorted);
		
		previousId = -1;
		var programIdArray = new Array();
		for(i=0;i<sorted.length;i++){
			if (sorted[i].program > previousId){
				programIdArray.push(sorted[i].program);
				previousId = sorted[i].program;
			}
		}
		//console.log("Nr Program IDs="+programIdArray);
		
		model.TvProgram
			.find()
			.where('id').in(programIdArray)
			.sort('title')
			.exec(function (err, programs) {
				if (err) return next(err);
				console.log("Nr Program read="+programs.length);
				res.send(programs);
			});
		
	});

}

exports.newUploadEpg = function(file,res,next) {

	var tmp_path = file.path;
    var target_path = './uploads/' + file.name;
	
	var output = " Empty";
	starTime = Date.now();
    
	console.log(Date.now()-starTime+" - Start Processing");
	
    fs.rename(tmp_path, target_path, function(err) {
        //if (err) throw err;
        // delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
        fs.unlink(tmp_path, function() {
            //if (err) throw err;
			if (err) return next(err);
            console.log(Date.now()-starTime+ ' - file uploaded to: ' + target_path + ' - ' + file.size + ' bytes');
        });
    });
	
	var parser = new xml2js.Parser();
			
	fs.readFile(target_path, function(err, data) {
		if (err) throw err;
		
		parser.parseString(data, function (err, result) {
			if (err) throw err;
			console.log((Date.now()-starTime)/60000+ " - XML Parsing done");
			//console.log(util.inspect(result,false,null));
						
			var schedulesList = result.glf.listings[0].schedules[0].s;	
			
			console.log("Nr Schedules="+ schedulesList.length);
			
			var minDate;
			var maxDate;
			
			//compute minimum and maximum date
			schedulesList.forEach(function (schedule){
				date = new Date(schedule.$.s);
				if (!minDate) minDate = date;
				if(!maxDate) maxDate = date;
				if (date<minDate) minDate = date;
				if (date>maxDate) maxDate = date;
			});
			
			console.log("min date="+minDate);
			console.log("max date="+maxDate);
			
			/*aDate = minDate;
			while(aDate < maxDate){
				console.log("--- Date : "+ aDate);
				aDate.setDate(aDate.getDate()+1);
			}*/
			
			
			model.TvEpg.find().where('fromDate').equals(minDate).where('toDate').equals(maxDate).exec(function (err, docs) {
				if (err) return next(err);
				if(docs.length==0){
					//New EPG file.Create new EPG
					console.log("EPG Novo - nao encontrado na base de dados");
					var anEpg = {
						filename: file.name, 
						filesize : file.size,
						fromDate : minDate,
						toDate : maxDate
					};
					
					model.TvEpg.create(anEpg, function (err, doc) {
						if (err) throw(err);
						console.log("New EPG created:"+doc);
						console.log(util.inspect(doc,false,null));
						processGlf(result,doc,next);
						res.send("UPLOADED");
					})
				}else{
					console.log("EPG encontrado: "+docs);
					processGlf(result,docs[0]);
					res.send("DUPLICATED");
				}	
			});		
		
			
		});
		
	});
	
}


function processGlf(result,glf,next) {
				
	model.TvSchedule.remove({ _epg: glf.id }, function(err) {
		if (err) throw(err);
		model.TvProgram.remove({ _epg: glf.id },function(err){
			if (err) throw(err);
			model.TvChannel.remove({ _epg: glf.id },function(err){
				if (err) throw(err);
				model.TvName.remove({ _epg: glf.id },function(err){
					if (err) throw(err);
					model.TvGenre.remove({ _epg: glf.id },function(err){
						if (err) throw(err);
						model.TvChannelStats.remove({ _epg: glf.id },function(err){
							if (err) throw(err);
							console.log("*** Removing processed");
							///////////////////
							//process schedules
							///////////////////
							var schedulesList = result.glf.listings[0].schedules[0].s;	
							var schedules = new Array();
							
							schedulesList.forEach(function (schedule){
								var aSchedule = {};
								aSchedule.program=schedule.$.p;
								aSchedule.channel=schedule.$.c;
								aSchedule.duration=schedule.$.d;
								aSchedule.startTime=schedule.$.s;
								aSchedule._epg=glf._id;
								schedules.push(aSchedule);
							});
							model.TvSchedule.create(schedules, function (err, doc) {
								if (err) throw(err);
								console.log("*** Schedules processed: "+schedules.length);
								//////////////////
								//Process Programs
								//////////////////
								var programList = result.glf.listings[0].programs[0].p;
								var programs = new Array();
								programList.forEach(function (program){
									aProgram = parseProgram(program);
									aProgram._epg=glf._id;
									programs.push(aProgram);
								});
								model.TvProgram.create(programs, function (err, doc) {
									if (err) throw(err);
									console.log("*** Programs processed: "+programs.length);
									/////////////////////
									//Process TV Channels
									/////////////////////
									var channelList = result.glf.channels[0].c;
									var channels = new Array();
									//console.log(util.inspect(channelList,false,null));
									channelList.forEach(function (canal){
										var aChannel ={};
										aChannel.name = canal.$.l;
										aChannel.position = canal.$.id;
										aChannel.code = canal.$.c;
										aChannel.date = Date.now();
										aChannel._epg=glf._id;
										channels.push(aChannel);
									});					
									model.TvChannel.create(channels, function (err, doc) {
										if (err) throw(err);
										console.log("*** Channels processed: "+channels.length);
										///////////////
										//Process Cast
										///////////////
										var namesList = result.glf.listings[0].programroles[0].names[0].n;
										//console.log(util.inspect(namesList,false,null));
										var names = new Array();
										namesList.forEach(function (name){
											var aName = {};
											aName.id=name.$.id;
											aName.firstName=name.$.fname;
											aName.lastName=name.$.lname;
											if(name.$.mname) aName.middleName=name.$.mname;
											aName._epg=glf._id;
											names.push(aName);
										});
										model.TvName.create(names, function (err, doc) {
											if (err) throw(err);
											console.log("*** Names processed "+names.length);
											///////////////
											//Process Genres
											///////////////
											var genresList = result.glf.listings[0].programcategories[0].c;
											var genres = new Array();
											genresList.forEach(function (genre){
												var aGenre = {};
												aGenre.id=genre.$.id;
												aGenre.value=genre.$.value;
												aGenre.mscname=genre.$.mscname;
												aGenre._epg=glf._id;
												genres.push(aGenre);
												subgenres = genre.c;
												
												if(subgenres){
													subgenres.forEach(function (subgenre){
														var asGenre = {};
														asGenre.id=subgenre.$.id;
														asGenre.value=subgenre.$.value;
														asGenre.mscname=subgenre.$.mscname;
														asGenre._epg=glf._id;
														genres.push(asGenre);					
													});
												}
											});
											model.TvGenre.create(genres, function (err, doc) {
												if (err) throw(err);
												console.log("*** Genres processed: "+genres.length);
												processStats(next);
											});
										});
									});
								});
							});
						});
					});
				});	
			});		
		});
	});
}
			

exports.loadEpg = function(file,res,next) {

	var tmp_path = file.path;
    var target_path = './uploads/' + file.name;
	
	var output = " Empty";
	starTime = Date.now();
    
	console.log(Date.now()-starTime+" - Start Processing");
	
    fs.rename(tmp_path, target_path, function(err) {
        //if (err) throw err;
        // delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
        fs.unlink(tmp_path, function() {
            //if (err) throw err;
			if (err) return next(err);
            console.log(Date.now()-starTime+ ' - file uploaded to: ' + target_path + ' - ' + file.size + ' bytes');
        });
    });
	
	var parser = new xml2js.Parser();
			
	fs.readFile(target_path, function(err, data) {
		if (err) throw err;
		
		parser.parseString(data, function (err, result) {
			if (err) throw err;
			console.log((Date.now()-starTime)/60000+ " - XML Parsing done");
			//console.log(util.inspect(result,false,null));
			
			///////////////////
			//process schedules
			///////////////////
			
			var schedulesList = result.glf.listings[0].schedules[0].s;	
			var schedules = new Array();
			
			console.log("Nr Schedules="+ schedulesList.length);
			
			model.TvSchedule.remove(function(err,doc){
				if (err) throw(err);
				schedulesList.forEach(function (schedule){
					var aSchedule = {};
					aSchedule.program=schedule.$.p;
					aSchedule.channel=schedule.$.c;
					aSchedule.duration=schedule.$.d;
					aSchedule.startTime=schedule.$.s;
					schedules.push(aSchedule);
					
					model.TvSchedule.create(aSchedule, function (err, doc) {
						if (err) throw(err);
					})
				});
			});		
			
			//console.log("Schedules processed");
			
			schedules = sortResults(schedules,'program',true);
			console.log("Nr Schedules read="+ schedules.length);
			
			//console.log(util.inspect(schedules[100],false,null));
			//console.log(util.inspect(schedules[200],false,null));
			
			var minDate;
			var maxDate;
			
			//compute minimum and maximum date
			schedules.forEach(function (schedule){
				date = new Date(schedule.startTime);
				if (!minDate) minDate = date;
				if(!maxDate) maxDate = date;
				if (date<minDate) minDate = date;
				if (date>maxDate) maxDate = date;
			});
			
			console.log("min date="+minDate);
			console.log("max date="+maxDate);
			
			aDate = minDate;
			while(aDate < maxDate){
				console.log("--- Date : "+ aDate);
				aDate.setDate(aDate.getDate()+1);
			}
	
			//////////////////
			//Process Programs
			//////////////////
			
			var programList = result.glf.listings[0].programs[0].p;
			
			//console.log(util.inspect(programList[100],false,null));
		
			model.TvProgram.remove(function(err,doc){
				if (err) throw(err);
				programList.forEach(function (program){
					aProgram = parseProgram(program);
					
					model.TvProgram.create(aProgram, function (err, doc) {
						if (err) throw(err);
					});
				});
			});
			console.log("Programas processados="+programList.length);
			//programs = sortResults(programs,'id',true);
			
			//console.log(util.inspect(programs[200],false,null));
			
			/////////////////////
			//Process TV Channels
			/////////////////////
			
			var channelList = result.glf.channels[0].c;
			//console.log(util.inspect(channelList,false,null));
			
			model.TvChannel.remove(function(err,doc){
				if (err) throw(err);
				channelList.forEach(function (canal){
					//console.log(util.inspect(canal.$,false,null));
					var aChannel ={};
					aChannel.name = canal.$.l;
					aChannel.position = canal.$.id;
					aChannel.code = canal.$.c;
					aChannel.date = Date.now();
												
					model.TvChannel.create(aChannel, function (err, doc) {
						if (err) throw(err);
						console.log("new channel inserted in DB:"+ canal.$.l );
					});
					
				});		
				
				console.log("Canais TV processados="+channelList.length);
			});
			

			///////////////
			//Process Cast
			///////////////
			var namesList = result.glf.listings[0].programroles[0].names[0].n;
			//console.log(util.inspect(namesList,false,null));
			
			model.TvName.remove(function(err,doc){
				if (err) throw(err);

				namesList.forEach(function (name){
					var aName = {};
					aName.id=name.$.id;
					aName.firstName=name.$.fname;
					aName.lastName=name.$.lname;
					if(name.$.mname) aName.middleName=name.$.mname;
					
					model.TvName.create(aName, function (err, doc) {
						if (err) throw(err);
						//console.log("new name inserted in DB:"+);
					});

				});
				
				console.log("Elenco processado="+namesList.length);
			});
			
			///////////////
			//Process Genres
			///////////////
			var genresList = result.glf.listings[0].programcategories[0].c;
			
			model.TvGenre.remove(function(err,doc){
				if (err) throw(err);
				
				genresList.forEach(function (genre){
					var aGenre = {};
					aGenre.id=genre.$.id;
					aGenre.value=genre.$.value;
					aGenre.mscname=genre.$.mscname;
					subgenres = genre.c;
					
					if(subgenres){
						subgenres.forEach(function (subgenre){
							var asGenre = {};
							asGenre.id=subgenre.$.id;
							asGenre.value=subgenre.$.value;
							asGenre.mscname=subgenre.$.mscname;
							
							model.TvGenre.create(asGenre, function (err, doc) {
								if (err) throw(err);
							});
					
						});
					}
				});
			});
			//console.log(util.inspect(genres[2],false,null));
			console.log("Genres processed");
				
			
			
			//names = sortResults(names,'firstName',true);
			//console.log(util.inspect(names,false,null));
			
			
			output = JSON.stringify(result);
			res.send("Upload com sucesso");
		});
		
	});
	
}


exports.getEpgChannels = function(res,next){
	
	model.TvChannel.find(function (err, docs) {
		if (err) return next(err);
		console.log("TV Channels read="+docs.length);		
		res.send(docs);
	});
}


exports.getChannelStats = function(res,next){
	
	model.TvChannelStats.find(function (err, docs) {
		if (err) return next(err);
		console.log("TV Channels Stats read="+docs.length);		
		res.send(docs);
	});
}

 function sortResults(collection, prop, asc) {
    collection = collection.sort(function(a, b) {
        if (asc) return (a[prop] > b[prop]) ? 1 : ((a[prop] < b[prop]) ? -1 : 0);
        else return (b[prop] > a[prop]) ? 1 : ((b[prop] < a[prop]) ? -1 : 0);
    });  
	return(collection);
}

function include(arr,obj) {
    return (arr.indexOf(obj) != -1);
}


function parseProgram(program){

	var aProgram = {};
	aProgram.id=program.$.id;
	aProgram.title=program.$.t;
	aProgram.description=program.$.d;
	
	if(program.$.et) 
		aProgram.episodeTitle=program.$.et;
	
	if(program.c){ //first genre is considered
		aProgram.genre= program.c[0].$.id;
	}
	
	if(program.f){ //first type is considered
		if(program.f[0].$.id==2) aProgram.type= "SERIES";
		else if(program.f[0].$.id==1) aProgram.type= "MOVIE";
		else aProgram.type= "OTHER";
	}
	
	if(program.r){
		rList = program.r;
		persons = new Array();
		rList.forEach(function (rParam){
			aPerson = { role : rParam.$.r, order : rParam.$.o , reference : rParam.$.n }; 
			persons.push(aPerson);
		});
		
		aProgram.cast = persons;
	}	
	
	if(program.k){
		kList = program.k;
		kList.forEach(function (kParam){
			switch(kParam.$.id) {
				case "1": //year
					aProgram.year = kParam.$.v;
					break;					
				case "2": //episode ID
					aProgram.seriesId = kParam.$.v;
					break; 
				case "3": //ep name
					aProgram.episodeDesc = kParam.$.v;
					break; 	
				case "4": //duration
					aProgram.duration = kParam.$.v;					
					break; 
				case "5": //origem
					aProgram.origin = kParam.$.v;					
					break; 		
				case "9": //parental class
					aProgram.parental = kParam.$.v;					
					break; 										
				break; 
			}
		});
		
	}
	return(aProgram);
	
}
