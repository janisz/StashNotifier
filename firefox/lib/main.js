var buttons = require('sdk/ui/button/action');
var tabs = require("sdk/tabs");

var button = buttons.ActionButton({
  id: "stash-link",
  label: "Stash",
  icon: {
    "32": "./48.png",
    "128": "./48.png"
  },
  onClick: handleClick
});


function createPullRequestNotification(pullRequest) {
  return new Notification(pullRequest.author.user.displayName, {
    icon: pullRequest.author.user.avatarUrl.split("?")[0],
    body: pullRequest.title,
    tag: 'stash_notifier_' + pullRequest.fromRef.latestChangeset
  }).onclick = function () {
    window.open(pullRequest.links.self[0].href)
  };
}

function handleClick(state) {
//  createPullRequestNotification({author : { user : {displayName : "Yoda", avatarUrl : "https://s3.amazonaws.com/ksr/avatars/1488070/Yoda.small.jpg?1365456091"}}, title : "Add missing dependency to Force.js", fromRef : {latestChangeset : 112}})
  tabs.open("http://www.mozilla.org/");
}

var timers = require("sdk/timers");
var notifications = require("sdk/notifications")

var i=0;
var timerId = timers.setInterval(function() {
  notifications.notify({
    title: "Jabberwocky",
    text: "'Twas brillig, and the slithy toves",
    data: "did gyre and gimble in the wabe",
    onClick: function (data) {
      console.log(data);
      // console.log(this.data) would produce the same result.
    }
  });
  if (i>4) timers.clearInterval(timerId);
}, 5000);
