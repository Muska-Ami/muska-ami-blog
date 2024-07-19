(function () {
  "use strict";
  var devtools = {
    open: false,
    orientation: null,
  };
  var threshold = 160;
  var emitEvent = function (state, orientation) {
    window.dispatchEvent(
      new CustomEvent("devtoolschange", {
        detail: {
          open: state,
          orientation: orientation,
        },
      })
    );
  };
  setInterval(function () {
    var widthThreshold = window.outerWidth - window.innerWidth > threshold;
    var heightThreshold = window.outerHeight - window.innerHeight > threshold;
    var orientation = widthThreshold ? "vertical" : "horizontal";

    if (
      !(heightThreshold && widthThreshold) &&
      ((window.Firebug &&
        window.Firebug.chrome &&
        window.Firebug.chrome.isInitialized) ||
        widthThreshold ||
        heightThreshold)
    ) {
      if (!devtools.open || devtools.orientation !== orientation) {
        emitEvent(true, orientation);
      }
      devtools.open = true;
      devtools.orientation = orientation;
    } else {
      if (devtools.open) {
        emitEvent(false, null);
      }
      devtools.open = false;
      devtools.orientation = null;
    }
  }, 500);
  if (typeof module !== "undefined" && module.exports) {
    module.exports = devtools;
  } else {
    window.devtools = devtools;
  }
})();

var devtools_notice = false;

window.addEventListener("devtoolschange", function (e) {
  if (e.detail.open) {
    sakura.stop(true);
    if (!devtools_notice)
      new NoticeJs({
        text: "检测到 DevTools 已打开，已关闭樱花效果。",
        position: "topRight",
      }).show();
    devtools_notice = true;
  } else {
    sakura.start();
    if (devtools_notice)
      new NoticeJs({
        text: "检测到 DevTools 已关闭，已开启樱花效果。",
        position: "topRight",
      }).show();
    devtools_notice = false;
  }
});
