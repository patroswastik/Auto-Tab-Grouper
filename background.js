// Supported tab group colors
const tabGroupColors = [
  "grey",
  "blue",
  "red",
  "yellow",
  "green",
  "pink",
  "purple",
  "cyan",
  "orange",
];

// Utilities
function getRandomColor() {
  return tabGroupColors[Math.floor(Math.random() * tabGroupColors.length)];
}

// Variables
let autoGroupInterval = 30; // Default 30 minutes

// Load saved interval on extension load
chrome.storage.local.get(["groupingInterval"], (res) => {
  autoGroupInterval = res.groupingInterval ?? 30;
  chrome.alarms.clear("autoGroupTabs", () => {
    chrome.alarms.create("autoGroupTabs", {
      periodInMinutes: autoGroupInterval,
    });
  });
});

// Group tabs by domain
function groupTabsByDomain() {
  chrome.tabs.query({}, (tabs) => {
    const domainMap = {};

    tabs.forEach((tab) => {
      if (!tab.url?.startsWith("http")) return;
      const domain = new URL(tab.url).hostname;
      if (!domainMap[domain]) domainMap[domain] = [];
      domainMap[domain].push(tab.id);
    });

    Object.entries(domainMap).forEach(([domain, tabIds]) => {
      chrome.tabs.group({ tabIds }, (groupId) => {
        chrome.tabGroups.update(groupId, {
          title: domain.replace("www.", "").split(".")[0],
          color: getRandomColor(),
          collapsed: true,
        });
      });
    });
  });
}

// Ungroup all tabs
function ungroupAllTabs() {
  chrome.tabs.query({}, (tabs) => {
    const groupedTabs = tabs
      .filter((tab) => tab.groupId !== -1)
      .map((tab) => tab.id);
    if (groupedTabs.length > 0) {
      chrome.tabs.ungroup(groupedTabs);
    }
  });
}

// Remove duplicate tabs (within the same window)
function removeDuplicateTabs() {
  chrome.tabs.query({}, (tabs) => {
    const windowTabMap = {};

    tabs.forEach((tab) => {
      if (!tab.url?.startsWith("http")) return;
      const windowId = tab.windowId;
      if (!windowTabMap[windowId]) {
        windowTabMap[windowId] = [];
      }
      windowTabMap[windowId].push(tab);
    });

    const duplicates = [];

    Object.values(windowTabMap).forEach((tabList) => {
      const urlMap = new Map();
      tabList.forEach((tab) => {
        const cleanURL = tab.url.split("#")[0]; // remove fragment part
        if (urlMap.has(cleanURL)) {
          duplicates.push(tab.id);
        } else {
          urlMap.set(cleanURL, tab.id);
        }
      });
    });

    if (duplicates.length > 0) {
      chrome.tabs.remove(duplicates);
    }
  });
}

// Message listener from popup
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "groupNow") {
    chrome.storage.local.get("autoGrouping", (data) => {
      if (data.autoGrouping ?? true) {
        groupTabsByDomain();
      }
    });
  } else if (msg.action === "ungroupAll") {
    ungroupAllTabs();
  } else if (msg.action === "removeDuplicates") {
    removeDuplicateTabs();
  } else if (msg.action === "updateInterval") {
    chrome.storage.local.get(["groupingInterval"], (res) => {
      autoGroupInterval = res.groupingInterval ?? 30;
      chrome.alarms.clear("autoGroupTabs", () => {
        chrome.alarms.create("autoGroupTabs", {
          periodInMinutes: autoGroupInterval,
        });
      });
    });
  }
});

// Keyboard shortcut listener
chrome.commands.onCommand.addListener((command) => {
  if (command === "group-tabs") {
    chrome.storage.local.get("autoGrouping", (data) => {
      if (data.autoGrouping ?? true) {
        groupTabsByDomain();
      }
    });
  }
});

// Alarm listener for auto-grouping
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "autoGroupTabs") {
    chrome.storage.local.get("autoGrouping", (data) => {
      if (data.autoGrouping ?? true) {
        groupTabsByDomain();
      }
    });
  }
});
