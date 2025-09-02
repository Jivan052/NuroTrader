# AgentChatWidget Component Documentation

The `AgentChatWidget` component is a sophisticated, floating chat interface that enables users to interact with the AI agent powered by AgentKit. It's designed to provide a seamless and responsive user experience with advanced features.

## Features

### UI/UX
- **Floating Widget**: Appears in any corner of the screen (configurable)
- **Expandable Interface**: Toggle between minimized (icon) and expanded (full chat) views
- **Fullscreen Mode**: Expand to fill the entire viewport for detailed conversations
- **Responsive Design**: Adapts to different screen sizes and devices
- **Animated Transitions**: Smooth animations between states
- **Theme Support**: Light, dark, or auto theme options

### Chat Functionality
- **Message History**: Maintains conversation history during the session
- **Loading States**: Visual indicators for when the agent is processing
- **Typing Indicator**: Animation shown while the agent is "typing"
- **Empty State**: Suggestions provided when no messages are present
- **Timestamp Display**: Shows when messages were sent

### Markdown and Formatting
- **ReactMarkdown Integration**: Renders rich text formatting
- **Code Block Highlighting**: Properly formats and displays code
- **Table Support**: Formats tabular data correctly
- **List Rendering**: Properly formats ordered and unordered lists
- **Auto-formatting**: Intelligently formats agent responses for better readability

### User Interaction
- **Copy to Clipboard**: One-click copying of message content
- **Visual Feedback**: Shows confirmation when text is copied
- **Keyboard Navigation**: ESC key to exit fullscreen mode
- **Text Area Expansion**: Input area grows as the user types
- **Auto-scroll**: Automatically scrolls to the latest message

## Props

| Prop Name | Type | Default | Description |
|-----------|------|---------|-------------|
| `initialExpanded` | boolean | `false` | Whether the widget should start in expanded mode |
| `position` | string | `'bottom-right'` | Position of the widget on the screen (`'bottom-right'`, `'bottom-left'`, `'top-right'`, `'top-left'`) |
| `theme` | string | `'auto'` | Color theme for the widget (`'light'`, `'dark'`, or `'auto'`) |

## Usage Example

```jsx
import AgentChatWidget from '@/components/AgentChatWidget';

function MyApp() {
  return (
    <div>
      {/* Your main app content */}
      
      {/* Chat widget that appears in the bottom-right corner */}
      <AgentChatWidget 
        initialExpanded={false}
        position="bottom-right"
        theme="auto"
      />
    </div>
  )
}
```

## State Management

The component manages several pieces of state:

- **Messages**: Array of chat messages with user and assistant responses
- **Input**: Current value of the text input field
- **Loading**: Boolean indicating if the agent is processing a request
- **Expanded**: Whether the chat widget is expanded or collapsed
- **IsFullscreen**: Whether the widget is in fullscreen mode
- **ShowTypingIndicator**: Whether to show the agent typing animation
- **CopiedMessageId**: Tracks which message has been copied to the clipboard

## Message Formatting

The `formatAgentResponse` function handles several improvements to raw agent responses:

1. **Cleanup**: Removes redundant separators and excessive whitespace
2. **Code Block Formatting**: 
   - Detects code snippets and wraps them in proper markdown code blocks
   - Preserves language specifications for syntax highlighting
3. **Table Formatting**: Ensures markdown tables have proper formatting
4. **Whitespace Handling**: Preserves important whitespace while removing excess

## Key Functions

| Function | Purpose |
|----------|---------|
| `handleSendMessage` | Sends user input to the agent API and processes responses |
| `formatAgentResponse` | Processes and formats agent responses for better display |
| `copyToClipboard` | Copies message content to the clipboard with visual feedback |
| `toggleFullscreen` | Toggles between normal and fullscreen display modes |
| `toggleExpanded` | Toggles between collapsed and expanded widget states |

## Styling

The component uses Tailwind CSS for styling with:

- **Dynamic Classes**: Conditional classes based on state
- **Dark Mode Support**: Compatible with the system theme
- **Responsive Classes**: Different styles for different viewport sizes
- **Animations**: Uses Framer Motion for smooth transitions
- **Glass Morphism**: Background blur effects for a modern look

## Backend Integration

The widget connects to the backend agent server via a simple API:

```typescript
// Example API call
const response = await fetch('http://localhost:3002/api/agent/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ 
    message: userMessage.content,
    role: 'user'
  }),
});
```

## CSS Requirements

The component relies on specific CSS classes defined in the global stylesheet:

- `.markdown-content`: Styles for markdown-rendered content
- `.chat-fullscreen`: Styles for the fullscreen mode
- `.chat-fullscreen-keyhandler`: Focus handling for keyboard shortcuts
- Other utility classes for animations and transitions

## Accessibility Features

- **ARIA Labels**: Proper labels for all interactive elements
- **Focus Management**: Correct focus handling for keyboard users
- **Color Contrast**: Ensures readability across themes
- **Screen Reader Support**: Semantic HTML structure for assistive technologies
- **Keyboard Navigation**: Full support for keyboard-only operation

## Performance Considerations

The component implements several optimizations:

- **Memoization**: Prevents unnecessary re-renders
- **Efficient Animations**: Uses hardware-accelerated properties
- **Throttled Events**: Prevents performance issues with resize events
- **Lazy Loading**: Only renders complex markdown when needed

## Browser Compatibility

The component is compatible with:
- Chrome/Edge (latest versions)
- Firefox (latest versions)
- Safari (latest versions)
- Mobile browsers (iOS/Android)
