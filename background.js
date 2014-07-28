function createErrorNotification() {
  return new Notification('Unable to connect', {
    icon: '128.png',
    body: 'Something went wrong',
    tag: 'stash_notifier_fail'
  });
}

function createPullRequestNotification(pullRequest) {
  return new Notification(pullRequest.author.user.displayName, {
    icon: pullRequest.author.user.avatarUrl.split("?")[0],
    body: pullRequest.title,
    tag: 'stash_notifier_' + pullRequest.fromRef.latestChangeset
  }).onclick = function () {
    window.open(pullRequest.links.self[0].href);
  };
}

function shouldShowNotification() {
  return localStorage.isActivated === 'true';
}
function handleError() {
  chrome.browserAction.setBadgeText({text: 'Error'});
  if (shouldShowNotification()) {
    createErrorNotification();
  }
}

function processStashResponse(xhr) {
  return function () {
    if (xhr.readyState == 4 && xhr.status == 200) {
      try {
        var resp = JSON.parse(xhr.responseText);
        chrome.browserAction.setBadgeText({text: resp.size === 0 ? '' : resp.size.toString(10)});
        if (shouldShowNotification()) {
          resp.values.forEach(createPullRequestNotification);
        }
      } catch (e) {
        console.error(e);
        chrome.browserAction.setBadgeText({text: 'Error'});
        if (shouldShowNotification()) {
          createErrorNotification();
        }
      }
    } else if (xhr.readyState == 4) {
      handleError();
    }
  };
}

function show() {
  var xhr = new XMLHttpRequest();
  var pullRequests = '/rest/inbox/latest/pull-requests?role=reviewer&start=0&limit=10&avatarSize=64&state=OPEN&order=oldest';
  xhr.open("GET", localStorage.stashUrl + pullRequests, true);
  xhr.onreadystatechange = processStashResponse(xhr);
  xhr.send();
}

// Conditionally initialize the options.
if (!localStorage.isInitialized) {
  localStorage.isActivated = true;   // The display activation.
  localStorage.frequency = 10;
  localStorage.isInitialized = true; // The option initialization.
}

// While activated, show notifications at the display frequency.
if (JSON.parse(localStorage.isActivated)) {
  show();
}

var interval = 0; // The display interval, in seconds.

setInterval(function () {
  interval++;
  if (localStorage.frequency <= interval) {
    show();
    interval = 0;
  }
}, 1000);


// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function (tab) {
  chrome.tabs.create({ url: localStorage.stashUrl });
  show();
});

chrome.omnibox.onInputStarted.addListener(function () {
  var xhr = new XMLHttpRequest();
  var recentRepositoriesUrl = '/rest/api/1.0/profile/recent/repos';
  xhr.open("GET", localStorage.stashUrl + recentRepositoriesUrl, true);
  xhr.onreadystatechange = processStashRecentReposResponse(xhr);
  xhr.send();
});

var recentRepositories;

function processStashRecentReposResponse(xhr) {
  return function () {
    if (xhr.readyState == 4 && xhr.status == 200) {
      try {
        recentRepositories = [];
        JSON.parse(xhr.responseText).values.forEach(function (repo) {
          recentRepositories.push({name: repo.name, url: repo.links.self[0].href});
        });
      } catch (e) {
        console.error(e);
      }
    }
  };
}

chrome.omnibox.onInputChanged.addListener(showSugesstions);

function showSugesstions(text, suggest) {
  var suggestions = [
    {content: localStorage.stashUrl, description: "Home"},
  ];
  if (recentRepositories) {
    recentRepositories.forEach(function (repo) {
      suggestions.push({content: repo.url, description: repo.name});
    });
  }
  if (text) {
    suggestions.sort(function (a, b) {
      return levDist(a.description, text) / a.description.length - levDist(b.description, text) / b.description.length;
    });
  }
  suggest(suggestions);
}

// This event is fired with the user accepts the input in the omnibox.
chrome.omnibox.onInputEntered.addListener(
  function (text) {
    chrome.tabs.update({
      url: text
    });
  }
);


//http://stackoverflow.com/a/11958496
//http://www.merriampark.com/ld.htm, http://www.mgilleland.com/ld/ldjavascript.htm, Damerau–Levenshtein distance (Wikipedia)
var levDist = function(s, t) {
  var d = []; //2d matrix

  // Step 1
  var n = s.length;
  var m = t.length;

  if (n == 0) return m;
  if (m == 0) return n;

  //Create an array of arrays in javascript (a descending loop is quicker)
  for (var i = n; i >= 0; i--) d[i] = [];

  // Step 2
  for (var i = n; i >= 0; i--) d[i][0] = i;
  for (var j = m; j >= 0; j--) d[0][j] = j;

  // Step 3
  for (var i = 1; i <= n; i++) {
    var s_i = s.charAt(i - 1);

    // Step 4
    for (var j = 1; j <= m; j++) {

      //Check the jagged ld total so far
      if (i == j && d[i][j] > 4) return n;

      var t_j = t.charAt(j - 1);
      var cost = (s_i == t_j) ? 0 : 1; // Step 5

      //Calculate the minimum
      var mi = d[i - 1][j] + 1;
      var b = d[i][j - 1] + 1;
      var c = d[i - 1][j - 1] + cost;

      if (b < mi) mi = b;
      if (c < mi) mi = c;

      d[i][j] = mi; // Step 6

      //Damerau transposition
      if (i > 1 && j > 1 && s_i == t.charAt(j - 2) && s.charAt(i - 2) == t_j) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost);
      }
    }
  }

  // Step 7
  return d[n][m];
}