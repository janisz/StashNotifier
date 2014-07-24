var widgets = require("sdk/widget");
var tabs = require("sdk/tabs");
var widget = widgets.Widget({
  id: "mozilla-link",
  label: "Mozilla website",
  contentURL: require("sdk/self").data.url("48.png"),
  onClick: function() {
    tabs.open("http://developer.mozilla.org/");
  }
});