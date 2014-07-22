function updateOptions() {
  localStorage.isActivated = options.isActivated.checked;
  localStorage.frequency = options.frequency.value;
  localStorage.stashUrl = options.stashUrl.value;
}

window.addEventListener('load', function () {

  options.isActivated.checked = JSON.parse(localStorage.isActivated);

  options.frequency.value = localStorage.frequency;
  options.stashUrl.value = localStorage.stashUrl;

  options.isActivated.onchange = updateOptions;
  options.frequency.onchange = updateOptions;
  options.stashUrl.onchange = updateOptions;
});