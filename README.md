# Ephemeral

I want to write more, but hate the idea of people reading what I write (for now). So I built ephemeral.

A beautiful, minimalist writing pad where your words disappear when you leave. Write freely, leave no trace.

## Features

- **Ephemeral**: Nothing is saved - your writing vanishes when you leave the page
- **Markdown Support**: Real-time markdown rendering as you type (headers, bold, italic, lists, quotes, code)
- **Beautiful Typography**: Smart quotes and em-dashes
- **Theme Switching**: Matte black-on-white and white-on-black themes
- **Word & Character Counter**: Track your writing progress
- **Smooth Experience**: Carefully crafted animations and transitions

## How to Use

1. Open `index.html` in your browser
2. Start writing
3. Use markdown syntax:
   - `# Header 1`
   - `## Header 2`
   - `**bold text**`
   - `*italic text*`
   - `` `code` ``
   - `> blockquote`
   - `- list item`

## Local Development

```bash
# Simple HTTP server
python3 -m http.server 8000
# or
npx http-server
```

Then visit http://localhost:8000

## Markdown Syntax Supported

- Headers: `#`, `##`, `###`, `####`
- Bold: `**text**`
- Italic: `*text*`
- Code: `` `code` ``
- Blockquotes: `> quote`
- Lists: `- item` or `* item`

## Privacy

- No data is stored anywhere
- No cookies, no localStorage for content
- Only theme preference is saved locally
- Content clears on page refresh or tab close