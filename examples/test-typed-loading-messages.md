---
url: https://www.example.com
---

# Test Typed.js Loading Messages

This file demonstrates the new typed.js loading messages feature that shows creative messages with a typing animation while fetching OpenGraph data.

## What You'll See

When you run "Fetch OpenGraph Data for Current File", you'll see the status message cycle through creative messages with a **typing animation effect**:

### 🎭 **Typing Animation Features**
- **Character-by-character typing**: Messages appear one letter at a time
- **Blinking cursor**: Animated cursor shows typing in progress
- **Backspace effect**: Previous messages are deleted before typing new ones
- **Smooth transitions**: Professional typing animation
- **Looping**: Messages cycle continuously until fetch completes

### 🌳 **Nature & Growth Themes**
- "Plucking the OpenGraph data from its tree..."
- "Harvesting the fruits of the semantic web..."

### ☕ **Beverage & Comfort Themes**
- "Brewing a fresh cup of metadata..."

### 🔮 **Mystical & Magical Themes**
- "Summoning the digital spirits of the web..."
- "Consulting the oracle of structured data..."
- "Casting spells to extract hidden treasures..."

### 📜 **Ancient & Historical Themes**
- "Decoding the ancient hieroglyphs of HTML..."

### 🤖 **Technology & AI Themes**
- "Teaching robots to read between the lines..."

### 💰 **Treasure & Mining Themes**
- "Mining digital gold from the information superhighway..."
- "Wrangling wild metadata into submission..."

### 🧭 **Navigation & Exploration Themes**
- "Navigating the labyrinth of web standards..."

### ⚡ **Power & Energy Themes**
- "Unleashing the power of the OpenGraph protocol..."

## Testing Instructions

### Test 1: Normal Fetch with Typing Animation
1. Open this file in Obsidian
2. Run "Fetch OpenGraph Data for Current File"
3. **Watch the typing animation** as messages appear character by character
4. **Observe the blinking cursor** during typing
5. **See the backspace effect** when switching messages
6. **Notice the smooth transitions** between messages

### Test 2: Slow Network Simulation
1. Open this file in Obsidian
2. **Disconnect your internet** or use a very slow connection
3. Run "Fetch OpenGraph Data for Current File"
4. **Watch more typing animations** during the longer fetch time
5. **See the continuous looping** of messages

### Test 3: Error Case with Typing
1. Change the URL to `https://this-url-does-not-exist-12345.com`
2. Run "Fetch OpenGraph Data for Current File"
3. **Watch typing animation** during the attempt
4. **See typing stop** and error message appear when it fails

## Typing Animation Configuration

### Typed.js Settings
```typescript
{
  strings: this.loadingMessages,
  typeSpeed: 50,        // Characters per second
  backSpeed: 30,        // Backspace speed
  backDelay: 1000,      // Delay before backspacing
  loop: true,           // Continuous looping
  showCursor: true,     // Show blinking cursor
  cursorChar: '|',      // Cursor character
  autoInsertCss: false, // Don't auto-insert CSS
  smartBackspace: true, // Smart backspace behavior
  fadeOut: false,       // No fade out effect
  fadeOutClass: 'typed-fade-out',
  fadeOutDelay: 500
}
```

### Animation Timing
- **Type Speed**: 50 characters per second (adjustable)
- **Backspace Speed**: 30 characters per second
- **Message Delay**: 1 second before starting to backspace
- **Cursor Blink**: 1 second blink cycle
- **Loop Duration**: Continuous until fetch completes

## CSS Styling

### Typing Element
```css
.typing-element {
  color: var(--text-normal);
  font-size: 0.95em;
  line-height: 1.4;
}
```

### Blinking Cursor
```css
.typed-cursor {
  color: var(--text-accent);
  font-weight: bold;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
```

## Technical Implementation

### Dependencies Added
```json
{
  "dependencies": {
    "typed.js": "^2.1.0"
  },
  "devDependencies": {
    "@types/typed.js": "^2.0.0"
  }
}
```

### Type Declaration
```typescript
declare class Typed {
  constructor(element: string | Element, options?: any);
  destroy(): void;
  reset(): void;
  start(): void;
  stop(): void;
  toggle(): void;
}
```

### Instance Management
- **Creation**: New Typed instance for each fetch
- **Cleanup**: Proper destruction on completion/error/close
- **Memory Management**: No memory leaks from abandoned instances

## User Experience Benefits

### 🎬 **Visual Appeal**
- Professional typing animation
- Engaging visual feedback
- Modern, polished appearance

### ⏱️ **Perceived Performance**
- Makes waiting feel faster
- Provides constant visual activity
- Reduces user impatience

### 🎯 **Clear Feedback**
- Obvious that work is happening
- Prevents confusion about frozen UI
- Shows progress through animation

### 🎨 **Branding**
- Unique, memorable experience
- Sets plugin apart from others
- Creates positive emotional connection

## Animation Customization

### Speed Adjustments
- **Fast Typing**: Increase `typeSpeed` to 80-100
- **Slow Typing**: Decrease `typeSpeed` to 20-30
- **Fast Backspace**: Increase `backSpeed` to 50-80
- **Slow Backspace**: Decrease `backSpeed` to 10-20

### Visual Customization
- **Cursor Style**: Change `cursorChar` to different symbols
- **Cursor Color**: Modify CSS for `.typed-cursor`
- **Text Styling**: Adjust `.typing-element` CSS
- **Animation Timing**: Modify `@keyframes blink`

### Behavior Customization
- **No Backspace**: Set `backSpeed: 0`
- **No Cursor**: Set `showCursor: false`
- **No Loop**: Set `loop: false`
- **Fade Effects**: Enable `fadeOut: true`

## Performance Considerations

### Memory Management
- **Instance Cleanup**: Always destroy Typed instances
- **Element Cleanup**: Clear DOM elements properly
- **Event Cleanup**: Remove event listeners

### Animation Performance
- **CSS Animations**: Use hardware acceleration
- **Smooth Transitions**: Optimize for 60fps
- **Minimal DOM**: Keep DOM changes minimal

### Browser Compatibility
- **Modern Browsers**: Full support for CSS animations
- **Fallbacks**: Graceful degradation for older browsers
- **Mobile Support**: Touch-friendly interactions

## Future Enhancements

### Smart Typing
- **URL-based Messages**: Different messages for different sites
- **Time-based Animation**: Faster/slower based on time of day
- **User Preferences**: Remember user's preferred speed
- **Contextual Timing**: Adjust based on network speed

### Advanced Animations
- **Typewriter Sound**: Optional sound effects
- **Color Cycling**: Different colors for different messages
- **Emoji Integration**: Animated emojis with text
- **3D Effects**: CSS 3D transformations

### Interactivity
- **Click to Skip**: Skip to next message
- **Pause/Resume**: User control over animation
- **Speed Control**: User-adjustable typing speed
- **Message Feedback**: Rate messages as helpful/funny

## Best Practices

### Animation Design
- **Keep it smooth**: 60fps animations
- **Don't distract**: Subtle, professional appearance
- **Be consistent**: Maintain timing and style
- **Consider accessibility**: Don't rely solely on animation

### Technical Implementation
- **Cleanup properly**: Always destroy instances
- **Handle errors**: Graceful fallback if animation fails
- **Performance first**: Optimize for smooth experience
- **Memory efficient**: Avoid memory leaks

### User Experience
- **Provide value**: Animation should enhance experience
- **Respect preferences**: Allow users to disable
- **Be responsive**: Adapt to user interactions
- **Stay relevant**: Connect to actual task

## Conclusion

The typed.js loading messages transform the plugin into a modern, engaging experience. The typing animation provides clear feedback while making the waiting time feel shorter and more entertaining.

The implementation is production-ready with proper cleanup, error handling, and performance optimizations. Users will enjoy watching the creative messages being typed out while their OpenGraph data is being fetched! 
