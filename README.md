**ACTIVE DEVELOPMENT**


Import WordPress news into Payload CMS lexical format. Fetches news from a WordPress API, converts HTML content to [Lexical](https://lexical.dev/) rich text, downloads images, optionally uploads them to Payload, and exports each item into a output folder.

## What it does

1. **Fetches** news from a WordPress REST API
2. **Converts** HTML content to Lexical format (headings, paragraphs, lists, links, mentions, etc.)
3. **Downloads** all images to `output/images/`
4. **Uploads** images to Payload CMS media collection (optional)
5. **Imports** each news item into Payload CMS
6. **Exports** each news item as a `.txt` that contains that news item lexical JSON

## Prerequisites

- Node.js 18+
- A WordPress Rest API
- Payload CMS instance

## Installation

```bash
npm install
```

## Usage

```bash
# Build and run with debug logs
npm start

# Run without build (development)
npm run dev

# Build only
npm run build
```

## Output

- **`output/`** – News items as `news-{id}-{slug}.txt` (JSON)
- **`output/images/`** – Downloaded images

## Covered components

**Block-level**

| HTML | Lexical / Payload |
|------|-------------------|
| `<p>` | Paragraph |
| `<h1>`–`<h6>` | Heading |
| `<hr>` | Horizontal rule |
| `<ol>` | Ordered list |
| `<ul>` | Bullet list |
| `<details>` + `<summary>` | Accordion (blockType: accordion) |
| `<figure><video>` | Video block (blockType: video) |
| `<figure><img>` | Image URLs collected (for download/upload) |
| WordPress spacer divs | Line breaks |
| Inter-block whitespace | Line breaks |

**Inline**

| HTML | Lexical |
|------|---------|
| `<br>` | Line break |
| `<strong>`, `<b>` | Bold |
| `<em>`, `<i>` | Italic |
| `<u>` | Underline |
| `<s>`, `<del>`, `<strike>` | Strikethrough |
| `<code>` | Code |
| `<a href="...">` | Link |
| `<a>` (mention pattern) | Mention |
| `@mention` in text | Mention |

You need to provide your own .env variables, payload uses a key system for authentication, but you need to activate it first on your own PayloadCMS instance.
