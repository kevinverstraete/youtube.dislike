var likemeta = {};
meta.response = null;
meta.playerresponse = null;
likemeta.done = false;
likemeta.getLikes = function(){
  try {
	// ytInitialData is the data on loading of page
    var data = ytInitialData;
	if (meta.response) {
      	data = meta.response;
	}
    var contents = data.contents.twoColumnWatchNextResults.results.results.contents.filter((x) => x.videoPrimaryInfoRenderer != null)[0];
    var buttons = contents.videoPrimaryInfoRenderer.videoActions.menuRenderer.topLevelButtons;
    var likebutton = buttons.filter(x => x.toggleButtonRenderer != null).filter(x => x.toggleButtonRenderer.targetId == 'watch-like')[0];
    var liketext = likebutton.toggleButtonRenderer.toggledText.accessibility.accessibilityData.label;
    return Number.parseInt(liketext.replace('.','').replace(',',''), 10);	
  } catch {
    return null;
  }
};
likemeta.getRating = function(){
  try {
	var data = ytInitialPlayerResponse;
	if(meta.playerresponse){
      data = meta.playerresponse;
	}
    return data.videoDetails.averageRating;
  } catch {
    return null;
  }  
};
likemeta.getDislikes = function() {
  var likes = likemeta.getLikes();
  var rating = likemeta.getRating();
  if(rating == null || likes == null) return null;
  likemeta.done = true; // mark as such
  return Math.round((likes * (5 - rating)) / (rating - 1));
};
likemeta.getButtons = function() {
  if (document.getElementById("menu-container").offsetParent === null) {
    return document.querySelector(
      "ytd-menu-renderer.ytd-watch-metadata > div"
    );
  } else {
    return document
      .getElementById("menu-container")
      ?.querySelector("#top-level-buttons-computed");
  }
};
likemeta.getDislikeButton = function() {
  return likemeta.getButtons().children[1];
};
likemeta.subscribe = function(){
  document.addEventListener("yt-navigate-finish", function (event) {
	meta.response = event.detail.response.response;
	meta.playerresponse = event.detail.response.playerResponse;
	likemeta.done = false;
    likemeta.execute();
  });
};
likemeta.execute = function(){
  try {
    var dislikes = likemeta.getDislikes();
	if (dislikes != null) {
      try {
	    var button = likemeta.getDislikeButton();
		var textElement = button.querySelector("#text");
		textElement.innerText = dislikes;
	  } catch {}
	}
  } catch {
  } finally {
    if (!likemeta.done) {
	  setTimeout(function() {
	    likemeta.execute();
	  }, 300);
	}
  }
}
likemeta.subscribe();
likemeta.execute();

