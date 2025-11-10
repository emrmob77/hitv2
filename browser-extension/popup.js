// Configuration
const API_BASE_URL = 'https://your-domain.com'; // Update with actual domain
const DASHBOARD_URL = `${API_BASE_URL}/dashboard`;

// Get current tab info
async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

// Show status message
function showStatus(message, type = 'success') {
  const statusEl = document.getElementById('status');
  statusEl.textContent = message;
  statusEl.className = `status ${type}`;

  setTimeout(() => {
    statusEl.className = 'status';
  }, 5000);
}

// Show/hide loading
function setLoading(isLoading) {
  const forms = document.querySelectorAll('form');
  const loading = document.getElementById('loading');

  forms.forEach(form => {
    form.style.display = isLoading ? 'none' : 'block';
  });

  loading.className = isLoading ? 'loading active' : 'loading';
}

// Get auth token from storage
async function getAuthToken() {
  const result = await chrome.storage.local.get('authToken');
  return result.authToken;
}

// Initialize popup
async function initPopup() {
  const tab = await getCurrentTab();

  // Pre-fill form with current page info
  document.getElementById('title').value = tab.title;
  document.getElementById('url').value = tab.url;
  document.getElementById('aff-title').value = tab.title;
  document.getElementById('aff-url').value = tab.url;

  // Tab switching
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const tabName = tab.dataset.tab;
      document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
      });
      document.getElementById(`${tabName}-tab`).classList.add('active');
    });
  });

  // Bookmark form submission
  document.getElementById('bookmark-form').addEventListener('submit', handleBookmarkSubmit);

  // Affiliate form submission
  document.getElementById('affiliate-form').addEventListener('submit', handleAffiliateSubmit);

  // Open dashboard link
  document.getElementById('open-dashboard').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: DASHBOARD_URL });
  });
}

// Handle bookmark submission
async function handleBookmarkSubmit(e) {
  e.preventDefault();
  setLoading(true);

  try {
    const formData = new FormData(e.target);
    const tags = formData.get('tags')
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const bookmarkData = {
      title: formData.get('title'),
      url: formData.get('url'),
      description: formData.get('description'),
      tags: tags,
      privacy_level: formData.get('is_public') ? 'public' : 'private',
    };

    const token = await getAuthToken();

    if (!token) {
      showStatus('Please log in to HitTags first', 'error');
      setLoading(false);
      return;
    }

    const response = await fetch(`${API_BASE_URL}/api/bookmarks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(bookmarkData),
    });

    if (!response.ok) {
      throw new Error('Failed to save bookmark');
    }

    showStatus('Bookmark saved successfully!', 'success');

    // Reset form after a delay
    setTimeout(() => {
      e.target.reset();
    }, 1500);

  } catch (error) {
    console.error('Error saving bookmark:', error);
    showStatus('Failed to save bookmark. Please try again.', 'error');
  } finally {
    setLoading(false);
  }
}

// Handle affiliate link submission
async function handleAffiliateSubmit(e) {
  e.preventDefault();
  setLoading(true);

  try {
    const formData = new FormData(e.target);

    const affiliateData = {
      title: formData.get('title'),
      target_url: formData.get('url'),
      description: formData.get('description'),
    };

    const token = await getAuthToken();

    if (!token) {
      showStatus('Please log in to HitTags first', 'error');
      setLoading(false);
      return;
    }

    const response = await fetch(`${API_BASE_URL}/api/affiliate/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(affiliateData),
    });

    if (!response.ok) {
      throw new Error('Failed to create affiliate link');
    }

    const result = await response.json();

    showStatus(`Affiliate link created! Short URL: ${result.shortUrl}`, 'success');

    // Copy to clipboard
    if (result.shortUrl) {
      await navigator.clipboard.writeText(result.shortUrl);
      showStatus('Affiliate link copied to clipboard!', 'success');
    }

    // Reset form after a delay
    setTimeout(() => {
      e.target.reset();
    }, 1500);

  } catch (error) {
    console.error('Error creating affiliate link:', error);
    showStatus('Failed to create affiliate link. Please try again.', 'error');
  } finally {
    setLoading(false);
  }
}

// Initialize when popup opens
document.addEventListener('DOMContentLoaded', initPopup);
