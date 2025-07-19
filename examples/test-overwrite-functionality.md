---
url: https://www.example.com/article
og_title: "Old Title - This should be overwritten when toggle is ON"
og_description: "Old description that should be replaced with fresh data"
og_image: "https://old-image-url.com/image.jpg"
og_favicon: "https://old-favicon.com/favicon.ico"
og_last_fetch: "2024-01-01T00:00:00.000Z"
---

# Test Overwrite Functionality

This file demonstrates how the "Overwrite Existing OpenGraph Data" toggle works.

## Current State (Before Processing)

This file already has OpenGraph metadata in the frontmatter:
- **Title**: "Old Title - This should be overwritten when toggle is ON"
- **Description**: "Old description that should be replaced with fresh data"
- **Image**: "https://old-image-url.com/image.jpg"
- **Favicon**: "https://old-favicon.com/favicon.ico"
- **Last Fetch**: "2024-01-01T00:00:00.000Z"

## Testing Instructions

### Test 1: Overwrite Existing = OFF (Default)
1. Open this file in Obsidian
2. Run "Fetch OpenGraph Data for Current File"
3. **Leave "Overwrite Existing OpenGraph Data" unchecked**
4. Click "Fetch for this File"
5. **Expected Result**: The existing metadata should remain unchanged

### Test 2: Overwrite Existing = ON
1. Open this file in Obsidian
2. Run "Fetch OpenGraph Data for Current File"
3. **Check "Overwrite Existing OpenGraph Data"**
4. Click "Fetch for this File"
5. **Expected Result**: All existing metadata should be replaced with fresh data from the URL

## What Each Toggle Does

### Overwrite Existing OpenGraph Data
- **OFF**: Only add missing OpenGraph fields, preserve existing ones
- **ON**: Replace all existing OpenGraph fields with fresh data from the API

### Create new YAML properties if none exists?
- **OFF**: Only update existing OpenGraph fields, don't add new ones
- **ON**: Add new OpenGraph fields if they don't exist in the frontmatter

### Write Errors
- **OFF**: Don't write error information to the file
- **ON**: Include error details in the frontmatter if fetching fails

### Update Fetch Date
- **OFF**: Don't update the last fetch timestamp
- **ON**: Update the timestamp to show when data was last fetched

## Use Cases

### When to Use "Overwrite Existing = OFF"
- You want to preserve manually edited metadata
- You're running the plugin multiple times and want to keep the first result
- You have custom descriptions or titles you don't want to lose

### When to Use "Overwrite Existing = ON"
- You want to refresh stale metadata with the latest from the website
- The website has updated its OpenGraph data
- You want to ensure consistency across your vault
- You're doing a bulk refresh of all your bookmarks

## Notes

- The URL field is always updated regardless of the overwrite setting
- The fetch date is controlled by the "Update Fetch Date" toggle, not the overwrite toggle
- This functionality works the same in both single file and batch processing modes 
