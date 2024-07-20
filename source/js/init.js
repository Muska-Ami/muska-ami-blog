document.addEventListener("DOMContentLoaded", (event) => {
  clickEffect();
  sakuraGenerate();

  window.addEventListener("devtoolschange", function (e) {
    if (e.detail.open) {
      window.sakura.stop(true);
      window.sakura = null;
      Toastify({
        text: "检测到 DevTools 已打开，已关闭樱花效果。",
      }).showToast();
    } else {
      //window.sakura.start();
      sakuraGenerate();
      Toastify({
        text: "检测到 DevTools 已关闭，已开启樱花效果。",
      }).showToast();
    }
  });
});

var sakura;

function sakuraGenerate() {
  sakura = new Sakura("body");
  window.sakura = sakura;
}
