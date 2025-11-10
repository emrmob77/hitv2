# HitTags Browser Extension

A Chrome/Edge browser extension for quickly saving bookmarks and creating affiliate links from any webpage.

## Features

- **Quick Bookmark Saving**: Save any webpage as a bookmark with one click
- **Affiliate Link Creation**: Create affiliate links instantly from any URL
- **Context Menu Integration**: Right-click on any link to save or create affiliate links
- **Keyboard Shortcuts**:
  - `Ctrl/Cmd + Shift + B` - Quick save current page
  - `Ctrl/Cmd + Shift + A` - Create affiliate link from selected link
- **Auto-fill**: Automatically captures page title, URL, and metadata
- **Tag Support**: Add tags to organize your bookmarks
- **Privacy Controls**: Choose between public and private bookmarks

## Installation

### Development Mode

1. Open Chrome/Edge and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked"
4. Select the `browser-extension` directory
5. The extension should now appear in your browser toolbar

### Production Build

1. Update `API_BASE_URL` in `popup.js` with your production domain
2. Create icon files in the `icons/` directory:
   - icon-16.png (16x16)
   - icon-32.png (32x32)
   - icon-48.png (48x48)
   - icon-128.png (128x128)
3. Zip the extension directory
4. Upload to Chrome Web Store or Edge Add-ons store

## Configuration

Before using the extension, you need to:

1. Update `API_BASE_URL` in `popup.js` with your HitTags domain
2. Ensure you're logged in to HitTags in your browser
3. The extension will automatically use your authentication session

## File Structure

```
browser-extension/
├── manifest.json          # Extension configuration
├── popup.html            # Extension popup UI
├── popup.js              # Popup logic and API calls
├── background.js         # Background service worker
├── content.js            # Content script for page interaction
├── icons/                # Extension icons (to be added)
│   ├── icon-16.png
│   ├── icon-32.png
│   ├── icon-48.png
│   └── icon-128.png
└── README.md            # This file
```

## API Integration

The extension communicates with the HitTags API using the following endpoints:

- `POST /api/bookmarks` - Create a new bookmark
- `POST /api/affiliate/create` - Create an affiliate link

Authentication is handled via Bearer token stored in local storage.

## Privacy & Permissions

The extension requires the following permissions:

- `activeTab`: Access the current tab's URL and title
- `storage`: Store authentication token and user preferences
- `contextMenus`: Add context menu items for quick actions
- `host_permissions`: Make API calls to the HitTags server

## Development

To modify the extension:

1. Make your changes to the source files
2. Reload the extension in `chrome://extensions/`
3. Test the changes in your browser

## Future Enhancements

- [ ] Drag-and-drop link sorting
- [ ] Bulk bookmark import
- [ ] Collection quick-add
- [ ] Offline bookmark queue
- [ ] Link preview before saving
- [ ] Screenshot capture
- [ ] Reading mode integration

## Support

For issues or feature requests, please visit:
https://github.com/your-org/hittags/issues

## License

MIT License - see main project LICENSE file
