// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/*
 Displays a notification with the current time. Requires "notifications"
 permission in the manifest file (or calling
 "webkitNotifications.requestPermission" beforehand).
 */
function show() {
  var time = /(..)(:..)/.exec(new Date());     // The prettyprinted time.
  var hour = time[1] % 12 || 12;               // The prettyprinted hour.
  var period = time[1] < 12 ? 'a.m.' : 'p.m.'; // The period of the day.

  notification =  new Notification('Title', {
    /* The notification's icon - For Chrome in Windows, Linux & Chrome OS */
    icon: '48.png',
    /* The notification’s subtitle. */
    body: 'Body',
    /*
     The notification’s unique identifier.
     This prevents duplicate entries from appearing if the user has multiple instances of your website open at once.
     */
    tag: 'tag'
  });
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
