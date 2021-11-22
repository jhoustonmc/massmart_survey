document.addEventListener("dblclick", () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
      .catch(error => console.error(error));
  } else if (document.fullscreenElement) {
    document.exitFullscreen()
      .catch((err) => console.error(err))
  }
});