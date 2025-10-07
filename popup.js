document.addEventListener("DOMContentLoaded", function () {
  const groupButton = document.getElementById("groupTabs");
  const ungroupButton = document.getElementById("ungroupTabs");
  const removeButton = document.getElementById("removeDuplicates");
  const intervalSlider = document.getElementById("groupInterval");
  const intervalLabel = document.getElementById("intervalLabel");
  const applyInterval = document.getElementById("applyInterval");
  const toggleCheckbox = document.getElementById("toggleGroup");

  chrome.storage.local.get(["groupingInterval", "autoGrouping"], (res) => {
    const interval = res.groupingInterval ?? 30;
    intervalSlider.value = interval;
    intervalLabel.textContent = `Every ${interval} minutes`;

    const percentage = ((interval - 5) / (120 - 5)) * 100;
    intervalSlider.style.background = `linear-gradient(to right, #4CAF50 0%, #4CAF50 ${percentage}%, #d3d3d3 ${percentage}%, #d3d3d3 100%)`;

    // Set toggle state
    toggleCheckbox.checked = res.autoGrouping ?? true;
  });

  intervalSlider.addEventListener("input", (e) => {
    const value = e.target.value;
    intervalLabel.textContent = `Every ${value} minutes`;

    const percentage = ((value - 5) / (120 - 5)) * 100;
    intervalSlider.style.background = `linear-gradient(to right, #4CAF50 0%, #4CAF50 ${percentage}%, #d3d3d3 ${percentage}%, #d3d3d3 100%)`;
  });

  applyInterval.addEventListener("click", () => {
    const newInterval = Number(intervalSlider.value);
    chrome.storage.local.set({ groupingInterval: newInterval }, () => {
      chrome.runtime.sendMessage({ action: "updateInterval" });
    });
  });

  groupButton?.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "groupNow" });
  });

  ungroupButton?.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "ungroupAll" });
  });

  removeButton?.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "removeDuplicates" });
  });

  toggleCheckbox?.addEventListener("change", () => {
    chrome.storage.local.set({ autoGrouping: toggleCheckbox.checked });
  });
});
