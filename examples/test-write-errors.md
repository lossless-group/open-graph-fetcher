---
url: https://this-url-does-not-exist-12345.com
---

# Test Write Errors Functionality

This file demonstrates how the "Write Errors" toggle works when API calls fail.

## Current State

This file has a URL that will likely cause an error when processed:
- **URL**: `https://this-url-does-not-exist-12345.com` (will fail)
- **No existing error fields**

## Testing Instructions

### Test 1: Write Errors = ON
1. Open this file in Obsidian
2. Run "Fetch OpenGraph Data for Current File"
3. **Check "Write Errors"**
4. Click "Fetch for this File"
5. **Expected Result**: Error information should be written to frontmatter

### Test 2: Write Errors = OFF
1. Open this file in Obsidian
2. Run "Fetch OpenGraph Data for Current File"
3. **Uncheck "Write Errors"**
4. Click "Fetch for this File"
5. **Expected Result**: Error should appear in status but not be written to frontmatter

### Test 3: Retry After Error (Write Errors = ON)
1. After Test 1, change the URL to a valid one like `https://www.example.com`
2. Run the command again with "Write Errors" checked
3. **Expected Result**: Error fields should be cleared and replaced with successful metadata

## Expected Results

### Test 1 Result (Write Errors = ON):
```yaml
---
url: https://this-url-does-not-exist-12345.com
og_error: "Failed to fetch OpenGraph data after 3 attempts"
og_error_code: "FETCH_FAILURE"
og_error_timestamp: "2024-01-15T10:30:00.000Z"
---
```

### Test 2 Result (Write Errors = OFF):
```yaml
---
url: https://this-url-does-not-exist-12345.com
---
```

### Test 3 Result (Retry Success):
```yaml
---
url: https://www.example.com
og_title: "Example Domain"
og_description: "This domain is for use in illustrative examples..."
og_image: "https://www.example.com/image.jpg"
og_favicon: "https://www.example.com/favicon.ico"
og_last_fetch: "2024-01-15T10:35:00.000Z"
---
```

## Error Field Details

### `og_error`
- **Type**: String
- **Content**: Human-readable error message
- **Example**: "Failed to fetch OpenGraph data after 3 attempts"

### `og_error_code`
- **Type**: String
- **Content**: Machine-readable error code
- **Examples**: 
  - `"FETCH_FAILURE"` - API request failed
  - `"NO_API_KEY"` - Missing API key
  - `"NETWORK_TIMEOUT"` - Network timeout

### `og_error_timestamp`
- **Type**: String (ISO 8601)
- **Content**: When the error occurred
- **Example**: `"2024-01-15T10:30:00.000Z"`

## Use Cases

### Debugging
- Identify which URLs are problematic
- Track error patterns over time
- Debug API issues

### Batch Processing
- See which files failed in large batches
- Retry failed files later
- Generate error reports

### Monitoring
- Track API reliability
- Monitor rate limit issues
- Identify website changes that break metadata

## Error Types

### Network Errors
- Timeouts
- Connection failures
- DNS resolution issues

### API Errors
- Rate limiting
- Invalid API key
- Server errors

### Processing Errors
- Invalid URLs
- Missing data
- File system issues

## Batch Processing

The writeErrors functionality also works in batch processing:

1. **Select multiple files** with problematic URLs
2. **Enable "Write Errors"** in batch options
3. **Process the batch**
4. **Check each file** for error information in frontmatter

## Error Cleanup

When a file is successfully processed after having an error:
- **Error fields are automatically cleared**
- **Fresh metadata replaces error information**
- **No manual cleanup required**

## Best Practices

### For Development
- Keep "Write Errors" ON during testing
- Use error codes to identify specific issues
- Monitor error timestamps for patterns

### For Production
- Use "Write Errors" for batch processing
- Review error logs periodically
- Retry failed files after fixing issues

### For Debugging
- Check error codes for specific failure types
- Use timestamps to correlate with system events
- Compare error messages across similar URLs 
