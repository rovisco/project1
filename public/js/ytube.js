
var videoArray = new Array();

$(document).ready(function(){ 

	var templateHtml = $("#youTubeVideoList-template").html();
	youTubeVideoListTemplate = Handlebars.compile(templateHtml);
	
	templateHtml = $("#videoPlayer-template").html();
	videoPlayerTemplate = Handlebars.compile(templateHtml);
	
	$("#youTubeListArea").hide();
	
});

function handleAPILoaded() { 
	console.log("API Loaded");
	$('#search-button').attr('disabled', false);
}

function googleApiLoad() {
  gapi.client.setApiKey('AIzaSyDdBJcFqP6u4nr_GxT0F5_pJglWnkpDCbE');
  gapi.client.load('youtube', 'v3', function() {
    handleAPILoaded();
  });
}



function youTubeTest(){

	search_input= $("#yt_search_text").val();
	
	console.log("Pesquisar="+search_input);
	
	var keyword= encodeURIComponent(search_input);
	
	var yt_url='http://gdata.youtube.com/feeds/api/videos?q='+search_input+'&format=5&max-results=5&v=2&alt=jsonc'; 
	console.log(yt_url);
	
	$.ajax({
		url: yt_url,
		dataType: "jsonp",
		async: "true",
		success: function(response) {
			console.log(response);
			
			if(response.data.items){
				videoArray = response.data.items;
				context =  { search_keyword : search_input , nrVideos: response.data.totalItems, videoList : response.data.items};
				var contents = youTubeVideoListTemplate(context);
				$('#youTubeListArea').show();
				$('#youTubeListArea').html(contents);
			}
		}
	});
}

function youTubeTestV3(){

	console.log("Start test V3");
	
	search_input= $("#yt_search_text").val();
	
	console.log("Pesquisar="+search_input);
	
	var keyword= encodeURIComponent(search_input);
	
	var yt_request = gapi.client.youtube.search.list({
		part: 'id',
		q : search_input,
		maxResults : 5
	});
	
	console.log(yt_request);
	yt_request.execute(function(response) {
		
		
		var videoList="";
		for (var i in response.result.items){
			//console.log("item snippet= "+JSON.stringify(response.result.items[i].snippet));
			//console.log("item id= "+response.result.items[i].id.videoId);
			if (i>0) videoList += ",";
			videoList += response.result.items[i].id.videoId;
			
		}
		console.log("VideoList="+videoList);
		yt_request2 = gapi.client.youtube.videos.list({
			part: 'snippet,contentDetails,statistics,topicDetails,player',
			id : videoList,
		});
		yt_request2.execute(function(response) {
			if(response.result.items){
				videoArray = response.result.items;
				context =  { search_keyword : search_input , nrVideos: response.result.pageInfo.resultsPerPage, videoList : response.result.items};
				var contents = youTubeVideoListTemplate(context);
				$('#youTubeListArea').show();
				$('#youTubeListArea').html(contents);
			}
			
		});
		
		
	});
	
}

function playVideoModal(videoId){
	console.log("video inout:"+videoId);
	var video = findVideo(videoId);	
	console.log("video =", video[0]);
	
	var context = JSON.parse(JSON.stringify(video[0]));
	
	//var video_frame="<iframe width='640' height='385' src='http://www.youtube.com/embed/"+videoId+"' frameborder='0' type='text/html'></iframe>";

	context =  { title : video[0].snippet.title,  videoId : video[0].id};
	
	var contents = videoPlayerTemplate(context);
	

	//ytPlayer.loadVideoById(videoId, 5, "large");
	//ytPlayer.playVideo();
	
	$('#videoPlayerContents').html(contents);
	
	$('#videoPlayerModal').modal();
}

function findVideo(videoId){
    return $.grep(videoArray, function(n, i){
      return n.id == videoId;
    });
};

