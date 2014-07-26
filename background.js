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
