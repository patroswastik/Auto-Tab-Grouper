document.addEventListener("DOMContentLoaded", function () {
  const groupButton = document.getElementById("groupTabs");
  const ungroupButton = document.getElementById("ungroupTabs");

  if (groupButton && chrome?.runtime?.sendMessage) {
    groupButton.addEventListener("click", () => {
      chrome.runtime.sendMessage({ action: "groupNow" });
    });
  } else {
    console.error("Button or chrome.runtime not available.");
  }

  if (ungroupButton && chrome?.runtime?.sendMessage) {
    ungroupButton.addEventListener("click", () => {
      chrome.runtime.sendMessage({ action: "ungroupAll" });
    });
  } else {
    console.error("Button or chrome.runtime not available.");
  }
});

document.getElementById("openDashboard").addEventListener("click", () => {
  chrome.tabs.create({ url: chrome.runtime.getURL("dashboard.html") });
});
