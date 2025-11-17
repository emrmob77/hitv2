// Background service worker for HitTags extension

// Install event
chrome.runtime.onInstalled.addListener(() => {
  console.log('HitTags extension installed');

  // Create context menu items
  chrome.contextMenus.create({
    id: 'save-bookmark',
    title: 'Save to HitTags',
    contexts: ['page', 'link'],
  });

  chrome.contextMenus.create({
    id: 'create-affiliate',
    title: 'Create Affiliate Link',
    contexts: ['link'],
  });
});

// Context menu click handler
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'save-bookmark') {
    handleSaveBookmark(info, tab);
  } else if (info.menuItemId === 'create-affiliate') {
    handleCreateAffiliate(info, tab);
  }
});

// Handle save bookmark from context menu
async function handleSaveBookmark(info, tab) {
  const url = info.linkUrl || tab.url;
  const title = info.selectionText || tab.title;

  // Store bookmark data temporarily
  await chrome.storage.local.set({
    pendingBookmark: {
      url,
      title,
      timestamp: Date.now(),
    },
  });

  // Open extension popup or show notification
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon-128.png',
    title: 'Bookmark Saved',
    message: `"${title}" has been queued for saving`,
  });
}

// Handle create affiliate link from context menu
async function handleCreateAffiliate(info, tab) {
  const url = info.linkUrl;

  if (!url) return;

  // Store affiliate data temporarily
  await chrome.storage.local.set({
    pendingAffiliate: {
      url,
      timestamp: Date.now(),
    },
  });

  // Show notification (popup will auto-open when user clicks icon)
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon-128.png',
    title: 'Affiliate Link Ready',
    message: 'Click the extension icon to create your affiliate link',
  });
}

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getAuthStatus') {
    chrome.storage.local.get('authToken', (result) => {
      sendResponse({ isAuthenticated: !!result.authToken });
    });
    return true;
  }

  if (request.action === 'saveAuthToken') {
    chrome.storage.local.set({ authToken: request.token }, () => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (request.action === 'logout') {
    chrome.storage.local.remove('authToken', () => {
      sendResponse({ success: true });
    });
    return true;
  }
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // Open popup (default behavior)
});

// Periodic token refresh (optional)
chrome.alarms.create('refreshToken', { periodInMinutes: 60 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'refreshToken') {
    // Implement token refresh logic here
    console.log('Refreshing auth token...');
  }
});
