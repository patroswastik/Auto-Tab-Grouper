document.addEventListener("DOMContentLoaded", function () {
  const groupButton = document.getElementById("groupTabs");
  const ungroupButton = document.getElementById("ungroupTabs");
  const removeButton = document.getElementById("removeDuplicates");
  const intervalSlider = document.getElementById("groupInterval");
  const intervalLabel = document.getElementById("intervalLabel");
  const applyInterval = document.getElementById("applyInterval");

  chrome.storage.local.get(["groupingInterval"], (res) => {
    const interval = res.groupingInterval ?? 30;
    intervalSlider.value = interval;
    intervalLabel.textContent = `Every ${interval} minutes`;
  
    const percentage = ((interval - 5) / (120 - 5)) * 100;
    intervalSlider.style.background = `linear-gradient(to right, #4CAF50 0%, #4CAF50 ${percentage}%, #d3d3d3 ${percentage}%, #d3d3d3 100%)`;
  });
  

  intervalSlider.addEventListener("input", (e) => {
    const value = e.target.value;
    intervalLabel.textContent = `Every ${value} minutes`;
  
    // Fill the slider track up to the thumb
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
});
