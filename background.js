// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/*
 Displays a notification with the current time. Requires "notifications"
 permission in the manifest file (or calling
 "webkitNotifications.requestPermission" beforehand).
 */
function show() {

  var xhr = new XMLHttpRequest();
  xhr.open("GET", localStorage.stashUrl, true);
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

      notification = new Notification(resp.title, {
        /* The notification's icon - For Chrome in Windows, Linux & Chrome OS */
        icon: '64.png',
        /* The notification’s subtitle. */
        body: resp.body,
        /*
         The notification’s unique identifier.
         This prevents duplicate entries from appearing if the user has multiple instances of your website open at once.
         */
        tag: 'tag'
      });

      chrome.browserAction.setBadgeText({text: resp.size.toString(10)});
    } else if (xhr.readyState == 4) {
      notification = new Notification('Unable to connect', {
        /* The notification's icon - For Chrome in Windows, Linux & Chrome OS */
        icon: '64.png',
        /* The notification’s subtitle. */
        body: 'Something went wrong',
        /*
         The notification’s unique identifier.
         This prevents duplicate entries from appearing if the user has multiple instances of your website open at once.
         */
        tag: 'tag_fail'
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
