// Content script for HitTags extension
// Runs on every page to provide quick bookmark functionality

// Inject floating action button (optional)
let floatingButton = null;

// Initialize content script
function init() {
  // Listen for keyboard shortcuts
  document.addEventListener('keydown', handleKeyboardShortcuts);

  // Listen for messages from background script
  chrome.runtime.onMessage.addListener(handleMessage);
}

// Handle keyboard shortcuts
function handleKeyboardShortcuts(e) {
  // Ctrl/Cmd + Shift + B - Quick save bookmark
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'B') {
    e.preventDefault();
    quickSaveBookmark();
  }

  // Ctrl/Cmd + Shift + A - Quick create affiliate link
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'A') {
    e.preventDefault();
    quickCreateAffiliate();
  }
}

// Quick save bookmark
async function quickSaveBookmark() {
  const pageData = {
    title: document.title,
    url: window.location.href,
    description: getMetaDescription(),
    image: getOGImage(),
  };

  // Send to background script
  chrome.runtime.sendMessage({
    action: 'quickSaveBookmark',
    data: pageData,
  });

  // Show inline notification
  showNotification('Bookmark saved!', 'success');
}

// Quick create affiliate link
async function quickCreateAffiliate() {
  const selectedLink = getSelectedLink();

  if (!selectedLink) {
    showNotification('Please select a link first', 'error');
    return;
  }

  chrome.runtime.sendMessage({
    action: 'quickCreateAffiliate',
    url: selectedLink,
  });

  showNotification('Creating affiliate link...', 'info');
}

// Get meta description
function getMetaDescription() {
  const metaDesc = document.querySelector('meta[name="description"]');
  return metaDesc ? metaDesc.content : '';
}

// Get Open Graph image
function getOGImage() {
  const ogImage = document.querySelector('meta[property="og:image"]');
  return ogImage ? ogImage.content : '';
}

// Get selected link
function getSelectedLink() {
  const selection = window.getSelection();
  if (!selection.rangeCount) return null;

  const range = selection.getRangeAt(0);
  const container = range.commonAncestorContainer;

  // Find closest anchor tag
  let anchor = container.nodeType === 1 ? container : container.parentElement;
  while (anchor && anchor.tagName !== 'A') {
    anchor = anchor.parentElement;
  }

  return anchor ? anchor.href : null;
}

// Show inline notification
function showNotification(message, type = 'info') {
  // Remove existing notification
  const existing = document.getElementById('hittags-notification');
  if (existing) {
    existing.remove();
  }

  // Create notification element
  const notification = document.createElement('div');
  notification.id = 'hittags-notification';
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 999999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 500;
    animation: slideIn 0.3s ease-out;
  `;
  notification.textContent = message;

  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(notification);

  // Auto-remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Handle messages from background script
function handleMessage(request, sender, sendResponse) {
  if (request.action === 'getPageData') {
    sendResponse({
      title: document.title,
      url: window.location.href,
      description: getMetaDescription(),
      image: getOGImage(),
    });
  }

  if (request.action === 'showNotification') {
    showNotification(request.message, request.type);
  }
}

// Initialize
init();

// Export for testing (optional)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getMetaDescription,
    getOGImage,
    getSelectedLink,
  };
}
