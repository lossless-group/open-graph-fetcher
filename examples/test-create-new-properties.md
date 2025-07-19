---
url: https://www.example.com/article
og_title: "Existing Title"
---

# Test Create New Properties Functionality

This file demonstrates how the "Create New YAML Properties if None Exist" toggle now works correctly.

## Current State (Before Processing)

This file has some OpenGraph metadata but is missing some fields:
- ✅ **URL**: `https://www.example.com/article`
- ✅ **Title**: `"Existing Title"`
- ❌ **Description**: Missing
- ❌ **Image**: Missing
- ❌ **Favicon**: Missing
- ❌ **Last Fetch**: Missing

## Testing Instructions

### Test 1: Smart Checkbox Logic (Both OFF Prevention)
1. Open this file in Obsidian
2. Run "Fetch OpenGraph Data for Current File"
3. **Uncheck "Create New YAML Properties if None Exist"**
4. **Try to uncheck "Overwrite Existing OpenGraph Data"**
5. **Expected Result**: The "Create New YAML Properties" should automatically get checked
6. **Alternative**: Try the reverse - uncheck "Overwrite Existing" first, then try to uncheck "Create New Properties"
7. **Expected Result**: The "Overwrite Existing" should automatically get checked

### Test 2: Create New Properties = ON, Overwrite Existing = OFF
1. Open this file in Obsidian
2. Run "Fetch OpenGraph Data for Current File"
3. **Check "Create New YAML Properties if None Exist"**
4. **Uncheck "Overwrite Existing OpenGraph Data"**
5. Click "Fetch for this File"
6. **Expected Result**: Missing fields should be added, existing fields should remain unchanged

### Test 3: Create New Properties = OFF, Overwrite Existing = ON
1. Open this file in Obsidian
2. Run "Fetch OpenGraph Data for Current File"
3. **Uncheck "Create New YAML Properties if None Exist"**
4. **Check "Overwrite Existing OpenGraph Data"**
5. Click "Fetch for this File"
6. **Expected Result**: Only existing fields should be updated, no new fields added

### Test 4: Create New Properties = ON, Overwrite Existing = ON
1. Open this file in Obsidian
2. Run "Fetch OpenGraph Data for Current File"
3. **Check "Create New YAML Properties if None Exist"**
4. **Check "Overwrite Existing OpenGraph Data"**
5. Click "Fetch for this File"
6. **Expected Result**: All fields should be added/updated with fresh data

## Expected Results by Test

### Test 1 Result (Smart Logic):
- **Scenario**: Try to uncheck both options
- **Result**: One option automatically gets checked, preventing the "both OFF" state
- **No API call made** when both would be unchecked

### Test 2 Result (Create ON, Overwrite OFF):
```yaml
---
url: https://www.example.com/article
og_title: "Existing Title"
og_description: "Fresh description from API"
og_image: "https://example.com/fresh-image.jpg"
og_favicon: "https://example.com/fresh-favicon.ico"
og_last_fetch: "2024-01-15T10:30:00.000Z"
---
```

### Test 3 Result (Create OFF, Overwrite ON):
```yaml
---
url: https://www.example.com/article
og_title: "Fresh title from API"
---
```

### Test 4 Result (Both ON):
```yaml
---
url: https://www.example.com/article
og_title: "Fresh title from API"
og_description: "Fresh description from API"
og_image: "https://example.com/fresh-image.jpg"
og_favicon: "https://example.com/fresh-favicon.ico"
og_last_fetch: "2024-01-15T10:30:00.000Z"
---
```

## How the Fixed Logic Works

### Create New Properties = OFF
- **Only updates existing fields** (if overwrite is enabled)
- **Never adds new fields** to the frontmatter
- **Preserves the exact structure** of your existing frontmatter

### Create New Properties = ON
- **Adds missing fields** to the frontmatter
- **Updates existing fields** (if overwrite is enabled)
- **Ensures complete metadata** for your notes

### Overwrite Existing = OFF
- **Preserves existing field values**
- **Only adds missing fields** (if create new properties is enabled)

### Overwrite Existing = ON
- **Replaces existing field values** with fresh data from API
- **Adds missing fields** (if create new properties is enabled)

## ⚠️ Smart Checkbox Logic

The plugin now prevents both options from being unchecked simultaneously to avoid wasteful API calls:

### Allowed Combinations:
- ✅ **Create New Properties = ON, Overwrite Existing = OFF**
- ✅ **Create New Properties = OFF, Overwrite Existing = ON**
- ✅ **Create New Properties = ON, Overwrite Existing = ON**

### Prevented Combination:
- ❌ **Create New Properties = OFF, Overwrite Existing = OFF** (would do nothing)

### Automatic Behavior:
- When you uncheck one option and both would become unchecked, the other option automatically gets checked
- This ensures at least one action can be performed
- Prevents API calls that would result in no changes to the file

## Use Cases

### Conservative Approach (Both OFF)
- Preserve all existing data
- Don't add any new fields
- Useful for testing or when you want minimal changes

### Additive Approach (Create ON, Overwrite OFF)
- Add missing metadata
- Preserve existing customizations
- Good for gradually building up metadata

### Refresh Approach (Create OFF, Overwrite ON)
- Update existing fields with fresh data
- Don't add new fields
- Useful for refreshing stale metadata

### Complete Refresh (Both ON)
- Replace all metadata with fresh data
- Add any missing fields
- Ensures complete, up-to-date metadata 
