// Supported tab group colors
const tabGroupColors = [
  "grey", "blue", "red", "yellow", "green", "pink", "purple", "cyan", "orange"
];

// Utility to pick a random color
function getRandomColor() {
  return tabGroupColors[Math.floor(Math.random() * tabGroupColors.length)];
}

function groupTabsByDomain() {
    chrome.tabs.query({}, (tabs) => {
      const domainMap = {};
      tabs.forEach(tab => {
        if (!tab.url?.startsWith('http')) return;
        const domain = new URL(tab.url).hostname;
        if (!domainMap[domain]) domainMap[domain] = [];
        domainMap[domain].push(tab.id);
      });
  
      Object.entries(domainMap).forEach(([domain, tabIds]) => {
        chrome.tabs.group({ tabIds }, (groupId) => {
          chrome.tabGroups.update(groupId, {
            title: domain.replace("www.", "").split('.')[0],
            color: getRandomColor(),
            collapsed: true
          });
        });
      });
    });
  }

  // Function to ungroup all tabs
  function ungroupAllTabs() {
    chrome.tabs.query({}, (tabs) => {
      const groupedTabs = tabs.filter(tab => tab.groupId !== -1).map(tab => tab.id);
      if (groupedTabs.length > 0) {
        chrome.tabs.ungroup(groupedTabs);
      }
    });
  }

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === "groupNow") {
      groupTabsByDomain();
    } else if (msg.action === "ungroupAll") {
      ungroupAllTabs();
    }
  });
  
  // Listen to command
  chrome.commands.onCommand.addListener((command) => {
    if (command === "group-tabs") {
      groupTabsByDomain();
    }
  });
  
  // Scheduled auto-grouping (every 5 min)
  chrome.alarms?.create("autoGroupTabs", { periodInMinutes: 5 });
  
  chrome.alarms?.onAlarm.addListener((alarm) => {
    if (alarm.name === "autoGroupTabs") {
      groupTabsByDomain();
    }
  });
  