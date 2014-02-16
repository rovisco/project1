


function CanalTv (id, code,name){
	this.id = id;
	this.code = code;
	this.name = name;
} 

function TvChannelStats(id,code,name,genre,parental,description5,description100,description256,descriptionbig,episodes,programs,episodeName,year,country,director,actors){
	this.id = id;
	this.code = code;
	this.name = name;
	this.genre = genre;
	this.parental = parental;
	this.decription5 = description5;
	this.description100 = description100;
	this.description256 = description256;
	this.descriptionbig = descriptionbig;
	this.episodes = episodes;
	this.episodeName = episodeName;
	this.programs = programs;
	this.year = year;
	this.country = country;
	this.director = director;
	this.actors = actors;
} 

function RoleName (id, firstName,middleName,lastName){
	this.id = id;
	this.firstName = firstName;
	this.lastName = lastName;
	this.middleName = middleName;
	
	this.fullName = fullName;
	function fullName(){
	  return (this.firstName+' '+this.middleName+' '+this.lastName);
	}
} 

function Schedule (channel, program,startTime,duration){
	this.channel = channel;
	this.program = program;
	this.startTime = startTime;
	this.duration = duration;
} 

function Category (categId, categName,categCode){
	this.categId = categId;
	this.categName = categName;
	this.categCode = categCode;
} 

function Series (id, name,channel, nrEpisodes,nrSchedules){
	this.id = id;
	this.name = name;
	this.channel = channel;
	this.nrEpisodes = nrEpisodes;
	this.nrSchedules = nrSchedules;
}

function Program (id, reducedTitle,title,description,reducedDescription,episodeTitle,relYear,duration,parental,origin,epId,epName,genre,type){
	this.id = id;
	this.reducedTitle = reducedTitle;
	this.title = title;
	this.description=description;
	this.reducedDescription = reducedDescription;
	this.episodeTitle = episodeTitle;
	this.relYear = relYear;
	this.duration = duration;
	this.parental = parental;
	this.origin = origin;
	this.epId = epId;
	this.epName = epName;
	this.genre = genre;
	this.type=type; //Movie, Series, Other
} 

function ScheduledProgram (schedule,program){
	this.id = program.id;
	this.reducedTitle = program.reducedTitle;
	this.title = program.title;
	this.description= program.description;
	this.reducedDescription = program.reducedDescription;
	this.episodeTitle = program.episodeTitle;
	this.relYear = program.relYear;
	this.duration = program.duration;
	this.parental = program.parental;
	this.origin = program.origin;
	this.epId = program.epId;
	this.epName = program.epName;
	this.genre = program.genre;
	this.type = program.type; //Movie, Series, Other
	this.channel = schedule.channel;
	this.program = schedule.program;
	this.startTime = schedule.startTime;
	this.schedDuration = schedule.duration;
} 

function loadPrograms(xml){
	var programs = new Array();
	
	$(xml).find("programs").each(function(){
		$(this).find("p").each(function(){	
			id = $(this).attr("id");
			rt = $(this).attr("rt");
			d =  $(this).attr("d");
			rd = $(this).attr("rd");
			t = $(this).attr("t");
			et =  $(this).attr("et");
			if(!et) et = 0;
			relYear = 0;
			duration =0;
			parental = 0;
			origin = 0;
			epId = 0;
			epName = 0;
			genre = 0;
			programType = 0;
			
			$(this).find("c").each(function(){
				genre = $(this).attr("id");
			});	
			$(this).find("f").each(function(){
				flag = $(this).attr("id");
				if (flag==1) programType = "Movie";
				else if (flag == 2) programType = "Series";
				
			});	
			
			$(this).find("k").each(function(){
				kId = $(this).attr("id");
				kValue = $(this).attr("v");
				
				switch(kId) {
					case "1": //year
						relYear = kValue;
						break;					
					case "2": //episode ID
						epId = kValue;
						break; 
					case "3": //ep name
						epName = kValue;
						break; 	
					case "4": //duration
						duration = kValue;					
						break; 
					case "5": //origem
						origin = kValue;					
						break; 		
					case "9": //parental class
						parental = kValue;					
						break; 										
					break; 
					
				}
				
			});
			var program= new Program(id,rt,t,d,rd,et,relYear,duration,parental,origin,epId,epName,genre,programType);
			programs.push(program);		
			//if(id==1191810) console.log("programa=",JSON.stringify(program));		
		});
	});
	
	/*canais.sort(function(a, b){
		return a.id-b.id;
	});
	*/
	return(programs);
}

function loadSchedules(xml){
	var schedules = new Array();
	$(xml).find("schedules").each(function(){
		$(this).children().each(function(){
			channelNr = $(this).attr("c");
			programNr = $(this).attr("p");
			startTime = $(this).attr("s");
			duration =$(this).attr("d");
			var schedule= new Schedule(channelNr,programNr,startTime,duration);	
			schedules.push(schedule);				
		});
	});
	
	/*canais.sort(function(a, b){
		return a.id-b.id;
	});
	*/
	return(schedules);
}

function loadCanais(xml){
	var canais = new Array();
	$(xml).find("channels").each(function(){
		$(this).children().each(function(){
			channelCode = $(this).attr("c");
			channelNumber = $(this).attr("id");
			channelName = $(this).attr("l");
			var canal= new CanalTv(channelNumber,channelCode,channelName);	
			canais.push(canal);				
		});
	});
	
	canais.sort(function(a, b){
		return a.id-b.id;
	});
	
	return(canais);
}

function loadCategories(xml){
	var categories = new Array();
	$(xml).find("programcategories").each(function(){
		$(this).find("c").each(function(){
			categId = $(this).attr("id");
			categName = $(this).attr("value");
			categCode = $(this).attr("mscname");
			
			var categ= new Category(categId,categName,categCode);	
			categories.push(categ);				
		});
	});
	
	/*canais.sort(function(a, b){
		return a.id-b.id;
	});
	*/
	return(categories);
}

function loadRolesNames(xml){
	var roleNames = new Array();
	
	$(xml).find("names").each(function(){
		$(this).children().each(function(){
			roleId = $(this).attr("id");
			roleLast = $(this).attr("lname");
			roleFirst = $(this).attr("fname");
			roleMiddle = $(this).attr("mname");
			if (!roleFirst) roleFirst =' ';
			if (!roleMiddle) roleMiddle =' ';
			var role= new RoleName(roleId,roleFirst,roleMiddle,roleLast);	
			
			roleNames.push(role);				
		});
	});	
	roleNames.sort(function(a, b){
		return a.id-b.id;
	});
	
	return(roleNames);
}


function writeRoleNames(xml,roles){ 
// Build an HTML string
	myHTMLOutput = '';
	myHTMLOutput += '<table width="98%" border="1" cellpadding="0" cellspacing="0">';
	myHTMLOutput += '<th>ID</th><th>Name</th>';
	
	output = '';
	for(i=0;i<roles.length;i++){
		output += '<tr>';
		output += '<td>'+ roles[i].id+ '</td>';
		output += '<td>'+ roles[i].fullName() +'</td>';
		output += '</tr>';
	}
	
	myHTMLOutput = myHTMLOutput + output;
	myHTMLOutput += '</table>';
	
	// Update the DIV called Content Area with the HTML string
	$("#ActorsArea").append(myHTMLOutput);
}

function channelStats(){
	
	hash = new HashTable();
	
	for(i=0;i<programs.length;i++){
		programId = programs[i].id;
		filteredSchedules = schedules.filter(function (x){ return(x.program==programId)});
		channelId = filteredSchedules[0].channel;
		tvChannelObj = findChannel(channelId);
		console.log("tvchannel=",tvChannelObj);
		
		if(! hash.hasItem(channelId)){
			programs[i].genre > 0 ? genre = 1 : genre = 0;
			channel = new TvChannelStats(channelId, tvChannelObj.code,tvChannelObj.name,genre,0,0,0,0,0,0,0,0,0,0,0,0);		
			console.log("channelStats=",channelStats);
			//channelStats = new TvChannelStats (channelId, tvChannelObj.code,tvChannelObj.name,genre,parental,description5,description100,description256,descriptionbig,episodes, programs,episodeName,year,country)
			hash.setItem(channelId,channel);
		}else{
				//serie = hash.getItem(seriesId);
				//filtered = schedules.filter(function (x){ return(x.program==programsSeries[i].id)});
				//serie.nrEpisodes++;
				//serie.nrSchedules += filtered.lenght;
				//hash.setItem(seriesId,serie);
		}
		
	}
}
