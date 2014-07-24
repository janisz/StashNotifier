var buttons = require('sdk/ui/button/action');
var tabs = require("sdk/tabs");

var button = buttons.ActionButton({
  id: "stash-link",
  label: "Stash",
  icon: {
    "32": "./48.png",
    "128": "./128.png"
  },
  onClick: handleClick
});


var notifications = require("sdk/notifications");
var self = require("sdk/self");
function createErrorNotification() {
  notifications.notify({title: 'Unable to connect',
    iconURL: self.data.url('128.png'),
    text: 'Something went wrong',
    data: require('sdk/simple-prefs').prefs['stashUrl'],
    onClick: function (url) { tabs.open(url); }
  });
}

function createPullRequestNotification(pullRequest) {
  notifications.notify({title: pullRequest.author.user.displayName,
    iconURL: pullRequest.author.user.avatarUrl.split("?")[0],
    text: pullRequest.title,
    data: pullRequest.links.self[0].href,
    tag: 'stash_notifier_' + pullRequest.fromRef.latestChangeset,
    onClick: function (url) { tabs.open(url); }
  })
}

var Request = require("sdk/request").Request;
function show() {
  var pullRequests = '/rest/inbox/latest/pull-requests?role=reviewer&start=0&limit=10&avatarSize=64&state=OPEN&order=oldest';
  Request({
    url: require('sdk/simple-prefs').prefs['stashUrl'] + pullRequests,
    onComplete: function (response) {
      console.log(response);
      if (response.status === 200 && response.json) {
        response.json.values.forEach(createPullRequestNotification);
      } else {
        createErrorNotification();
      }
    }
  }).get();
}

function handleClick(state) {
  tabs.open(require('sdk/simple-prefs').prefs['stashUrl']);
}

var timers = require("sdk/timers");
var interval=0;
var timerId = timers.setInterval(function() {
  interval++;
  if (interval>require('sdk/simple-prefs').prefs['frequency']) {
    show();
    interval = 0;
  }
}, 1000);
