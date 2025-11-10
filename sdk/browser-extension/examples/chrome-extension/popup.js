/**
 * Example Chrome Extension Popup
 * Uses the HitV2 SDK to save bookmarks
 */

import { HitV2SDK } from '@hitv2/browser-extension-sdk';

// Initialize SDK with stored credentials
let sdk;

async function initSDK() {
  const { apiKey, secretKey } = await chrome.storage.sync.get([
    'apiKey',
    'secretKey',
  ]);

  if (!apiKey || !secretKey) {
    showSetupRequired();
    return null;
  }

  return new HitV2SDK({ apiKey, secretKey });
}

// Save current page as bookmark
document.getElementById('saveButton')?.addEventListener('click', async () => {
  try {
    const sdk = await initSDK();
    if (!sdk) return;

    const button = document.getElementById('saveButton');
    button.disabled = true;
    button.textContent = 'Saving...';

    const result = await sdk.extension.bookmarkCurrentTab();

    button.textContent = '✓ Saved!';
    setTimeout(() => {
      window.close();
    }, 1000);
  } catch (error) {
    console.error('Error saving bookmark:', error);
    alert('Failed to save bookmark: ' + error.message);
    document.getElementById('saveButton').disabled = false;
  }
});

// Check if current page is already bookmarked
async function checkBookmarked() {
  try {
    const sdk = await initSDK();
    if (!sdk) return;

    const isBookmarked = await sdk.extension.isCurrentTabBookmarked();

    const statusEl = document.getElementById('status');
    if (isBookmarked) {
      statusEl.textContent = '✓ This page is bookmarked';
      statusEl.className = 'status bookmarked';
      document.getElementById('saveButton').textContent = 'Already Saved';
      document.getElementById('saveButton').disabled = true;
    } else {
      statusEl.textContent = 'Not bookmarked yet';
      statusEl.className = 'status';
    }
  } catch (error) {
    console.error('Error checking bookmark:', error);
  }
}

// View recent bookmarks
document.getElementById('viewButton')?.addEventListener('click', async () => {
  try {
    const sdk = await initSDK();
    if (!sdk) return;

    const result = await sdk.bookmarks.list({ limit: 10 });

    const listEl = document.getElementById('recentList');
    listEl.innerHTML = '';

    result.data.forEach((bookmark) => {
      const li = document.createElement('li');
      li.innerHTML = `
        <a href="${bookmark.url}" target="_blank">
          ${bookmark.title || bookmark.url}
        </a>
      `;
      listEl.appendChild(li);
    });

    document.getElementById('recentSection').style.display = 'block';
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    alert('Failed to fetch bookmarks: ' + error.message);
  }
});

// Open options page
document.getElementById('settingsButton')?.addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

function showSetupRequired() {
  document.getElementById('mainContent').style.display = 'none';
  document.getElementById('setupRequired').style.display = 'block';
}

// Initialize on load
checkBookmarked();
