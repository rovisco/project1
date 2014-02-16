var canalActivo =0;
var selectedProgram = 0;
var schedules = new Array();
var programs = new Array();
var canais = new Array();
var channelStats = new Array();
var seriesList;
var programArray = new Array();

var programDetailTemplate ;
var seriesListTemplate;
var channelListTemplate;
var programListTemplate;
var seriesStatsTemplate;
var pageSize = 10;

$(document).ready(function(){ 

	var templateHtml = $("#programDetail-template").html();
	programDetailTemplate = Handlebars.compile(templateHtml);
	
	templateHtml = $("#seriesList-template").html();
	seriesListTemplate = Handlebars.compile(templateHtml);
	
	templateHtml = $("#channelList-template").html();
	channelListTemplate = Handlebars.compile(templateHtml);

	templateHtml = $("#channelStats-template").html();
	channelStatsTemplate = Handlebars.compile(templateHtml);
	
	templateHtml = $("#programList-template").html();
	programListTemplate = Handlebars.compile(templateHtml);
	
	showSelectGLF();	

});

//User actions
function fileUpload(){

	//$('#loadingModal').modal();

	var data = new FormData();

	jQuery.each($('#inputFile')[0].files, function(i, file) {
		data.append('file'+i, file);
	});

	$.ajax({
		url: '/upload',
		data: data,
		cache: false,
		contentType: false,
		processData: false,
		type: 'POST',
		success: function(data){
			$('#loadingModal').modal('hide');
			alert(data);
		}
	});
}

/*
function fileUpload(){
	
	filename = $("#inputFile").get(0).files[0].name;
	filesize = $("#inputFile").get(0).files[0].size;
	filetype = $("#inputFile").get(0).files[0].type;
	
	console.log("uploaded file=",filename," size=", filesize, " type=",filetype);
	
	$.get(filename,{},function(xml){
		
		canais = loadCanais(xml);
		//console.log("canais=",JSON.stringify(canais));
		showChannels();
		
		schedules =loadSchedules(xml);
		console.log("nrScheds =", schedules.length)
		
		var categories = loadCategories(xml);
		console.log(" vai processar programs");
		programs = loadPrograms(xml);
		console.log("Nr.programas", programs.length);
		
		$("#seriesNav").removeClass("disabled");
	    $("#channelNav").removeClass("disabled");
		$('#loadingModal').modal('hide');
		showChannels();
		//channelStats();
		
	});
	
	$('#loadingModal').modal();
	
	return false;
}

*/

function showSelectGLF(){
	$(".topmenu").removeClass("active");
	$(".menu-area").hide();
	$("#glfNav").addClass("active");
	$("#glfArea").show();
}

function showSeries(){
	//loadSeries(100);
	//showSeriesPage(1,100);
	$(".topmenu").removeClass("active");
	$(".menu-area").hide();
	$("#seriesNav").addClass("active");
	$("#seriesArea").show();
}
 

 function sortResults(collection, prop, asc) {
    collection = collection.sort(function(a, b) {
        if (asc) return (a[prop] > b[prop]) ? 1 : ((a[prop] < b[prop]) ? -1 : 0);
        else return (b[prop] > a[prop]) ? 1 : ((b[prop] < a[prop]) ? -1 : 0);
    });  
	return(collection);
}

function showChannels(){
	console.log("Ler canais");
	
	$(".topmenu").removeClass("active");
	$(".menu-area").hide();
	$("#channelNav").addClass("active");
	$("#channelsArea").show();
	
	$.get('/tvchannels',function(canais,sucess,xht){
		console.log("Canais Lidos="+canais.length);
		
		canais = sortResults(canais,'position',true);
		
		context =  { nrChannels: canais.length, channelList : canais};
		var contents = channelListTemplate(context);
		$('#channelDisplay').html(contents);
		
	});
}

function reloadChannelStatsPage(){

	var pageStatus = $('#channel-stats-pagination').bootstrapPaginator("getPages");

	console.log("current page="+pageStatus.current);
	
	var pageSize = 10;
	startPage = (pageStatus.current-1)*pageSize;
	endPage = startPage+pageSize;
	
	console.log("start="+startPage +"end="+endPage);
	
	if(endPage > channelStats.length) endPage=channelStats.length;
	
	pageItems = channelStats.slice(startPage,endPage);
	context =  {channelList : pageItems};
	var contents = channelStatsTemplate(context);
	$('#channelStatsDisplay').html(contents);
	$(".sort-button").removeClass("btn-primary");
	
}
		
function showChannelStats(){
	console.log("Read channelStats");
	$(".topmenu").removeClass("active");
	$(".menu-area").hide();
	$("#channelStatsNav").addClass("active");
	$("#channelsStatsArea").show();
	
	
	$.get('/tvChannelStats',function(canais,sucess,xht){
		console.log("Channel Stats read="+canais.length);
				
		channelStats = sortResults(canais,'position',true);
		
		var pageSize = 10;
		var totalNumberOfPages = Math.ceil(channelStats.length/pageSize);
		
		endPage = pageSize;
		if(endPage > channelStats.length) endPage=channelStats.length;
		pageItems = channelStats.slice(0,endPage);
	
		context =  { channelList : pageItems};
		console.log("Paginação: NrItems"+channelStats.length+ "NrPaginas="+totalNumberOfPages);
		
		var page_options = {
            currentPage: 1,
			numberOfPages:8, //visible pages
            totalPages: totalNumberOfPages, //total pages
			size:'normal', // large,normal, small, mini 
            alignment:'right', // left, center, right
			onPageChanged: function(e,oldPage,newPage){
                //$('#alert-content').text("Current page changed, old: "+oldPage+" new: "+newPage);
				startPage = (newPage-1)*pageSize;
				endPage = startPage+pageSize;
				if(endPage > channelStats.length) endPage=channelStats.length;
				pageItems = channelStats.slice(startPage,endPage);
				context =  {channelList : pageItems};
				var contents = channelStatsTemplate(context);
				$('#channelStatsDisplay').html(contents);
				
				console.log("Pagina="+ newPage +" inicio"+startPage+ "fim="+endPage);
				
            },
			itemContainerClass: function (type, page, current) {
                return (page === current) ? "active" : "pointer-cursor";
            },
			tooltipTitles: function (type, page, current) {
                switch (type) {
                    case "first":
                        return "Primeira página";
                    case "prev":
                        return "Página anterior";
                    case "next":
                        return "Página seguinte";
                    case "last":
                        return "Última página";
                    case "page":
                        return "Ir para página " + page;
                }
            }
        }
		$('#channel-stats-pagination').bootstrapPaginator(page_options);
		
		var contents = channelStatsTemplate(context);
		$('#channelStatsDisplay').html(contents);
	});

}
function loadSeries(pageSize){
	
	if (seriesList == null){
		programsSeries= programs.filter(function (x){ return(x.epId > 0)});
		console.log("Nr programas series=", programsSeries.length);
		console.log("Uma Serie=", programsSeries[0]);
		hash = new HashTable();
		for(i=0;i<programsSeries.length;i++){
			seriesId = programsSeries[i].epId;
			if(! hash.hasItem(seriesId)){
				filtered = schedules.filter(function (x){ return(x.program==programsSeries[i].id)});
				channel = filtered[0].channel;
				serie = new Series(seriesId,programsSeries[i].title,channel,1,filtered.lenght);
				hash.setItem(seriesId,serie);
			}else{
				serie = hash.getItem(seriesId);
				filtered = schedules.filter(function (x){ return(x.program==programsSeries[i].id)});
				serie.nrEpisodes++;
				serie.nrSchedules += filtered.lenght;
				hash.setItem(seriesId,serie);
			}
		}
		seriesList = hash;
		
		nrPages = Math.ceil(seriesList.length/pageSize);
		
		console.log("Nr series=",seriesList.length);
		console.log("Nr Paginas=", nrPages);
		
		$('#page-selection').bootpag({
			total: nrPages
		}).on("page", function(event,num){
			showSeriesPage(num,pageSize);
			//$("#contentDemo").html("Insert content for num="+num)
		});
		
	}
}

function showSeriesPage(pageNum,pageSize){
	
	nrSeries = seriesList.length;
	var seriesIds = seriesList.keys();
	seriesIds.sort(function(a, b){
		return a-b;
	});
	
	var anObject;
	seriesArray = new Array();
	
	startPage = (pageNum-1)*pageSize;
	endPage = startPage+pageSize;
	if(endPage > seriesIds.length) endPage=seriesIds.length;
	
	console.log("página de série: page=", pageNum," Page size=", pageSize," startPage=",startPage, "endPage=",endPage);
	
	for(i=startPage;i<endPage;i++){
		serie = seriesList.getItem(seriesIds[i]);	
		anObject ={ serieId: seriesIds[i], nrEpisodes : serie.nrEpisodes, seriesTitle : serie.name, channel : serie.channel  }   
		seriesArray.push(anObject);
	}
	
	context =  { nrSeries: nrSeries, seriesList : seriesArray};
	var contents = seriesListTemplate(context);
	$('#seriesList').html(contents);
	
} 

function showChannelPrograms (param){

	$.get('/programs/'+param,function(programs,sucess,xht){
		
		console.log("Read programs for channel="+param);
		programs = sortResults(programs,'title',true);
		console.log("Nr programs="+programs.length);
		
		programArray = programs;
		
		context =  { tvChannel: param, programList : programs};
		var contents = programListTemplate(context);
		$('#programList').html(contents);
		
		//$("#channelsArea").show();
	});
}

function showProgramsDetails(programId){

	//var schedule = findSchedule(programId);
	var program = findProgram(programId);
	//var schedProg = new ScheduledProgram(schedule[0],program[0]);
	
	console.log("programa =", program[0]);
	var context = JSON.parse(JSON.stringify(program[0]));
	//var context = program[0];
	
	console.log("context =", context);
	
    var contents = programDetailTemplate(context);
	console.log("contents =", contents);
	
	$('#programDetails').html(contents);
	$('#ProgramDetailsModal').modal();
}

function findChannel(channelId){
    return $.grep(canais, function(n, i){
      return n.id == channelId;
    });
};

function findSchedule(programId){
    return $.grep(schedules, function(n, i){
      return n.program == programId;
    });
};

function findProgram(programId){
    return $.grep(programArray, function(n, i){
      return n.id == programId;
    });
};