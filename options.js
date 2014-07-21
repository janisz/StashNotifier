// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
window.addEventListener('load', function() {
  // Initialize the option controls.
  options.isActivated.checked = JSON.parse(localStorage.isActivated);
                                         // The display activation.
  options.frequency.value = localStorage.frequency;
  options.stashUrl.value = localStorage.stashUrl;


  // Set the display activation and frequency.
  options.isActivated.onchange = function() {
    localStorage.isActivated = options.isActivated.checked;
  };

  options.frequency.onchange = function() {
    localStorage.frequency = options.frequency.value;
    localStorage.stashUrl = options.stashUrl.value;
  };

  options.stashUrl.onchange = function() {
    localStorage.frequency = options.frequency.value;
    localStorage.stashUrl = options.stashUrl.value;
  };
});