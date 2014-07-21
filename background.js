function show() {
  var xhr = new XMLHttpRequest();
    var pullRequests = '/rest/inbox/latest/pull-requests?role=reviewer&start=0&limit=10&avatarSize=64&state=OPEN&order=oldest';
  xhr.open("GET", localStorage.stashUrl + pullRequests, true);
  xhr.onreadystatechange = function () {
    console.log(xhr);
    if (xhr.readyState == 4 && xhr.status == 200) {
      // JSON.parse does not evaluate the attacker's scripts.
      console.log(xhr.responseText);
      var resp = JSON.parse(xhr.responseText);
      if (resp.size == 0) {
        chrome.browserAction.setBadgeText({text: ''});
        return;
      }

      notification = new Notification('Pull Request', {
        icon: '64.png',
        body: resp.values[0].title,
        tag: 'stash_notifier'
      });

      chrome.browserAction.setBadgeText({text: resp.size.toString(10)});
    } else if (xhr.readyState == 4) {
      notification = new Notification('Unable to connect', {
        icon: '64.png',
        body: 'Something went wrong',
        tag: 'stash_notifier_fail'
      });
      chrome.browserAction.setBadgeText({text: 'Error'});
    }
  };
  xhr.send();
}

// Conditionally initialize the options.
if (!localStorage.isInitialized) {
  localStorage.isActivated = true;   // The display activation.
  localStorage.frequency = 1;        // The display frequency, in minutes.
  localStorage.isInitialized = true; // The option initialization.
}

// While activated, show notifications at the display frequency.
if (JSON.parse(localStorage.isActivated)) {
  show();
}

var interval = 0; // The display interval, in minutes.

setInterval(function () {
  interval++;

  if (
    JSON.parse(localStorage.isActivated) &&
    localStorage.frequency <= interval
    ) {
    show();
    interval = 0;
  }
}, 1000);


// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function (tab) {
  console.log(localStorage.stashUrl);
  chrome.tabs.create({ url: localStorage.stashUrl });
});
