# 🛠️ Dev Tools

A collection of essential developer utilities that run entirely in your browser. All processing happens locally - your data never leaves your device.

## ✨ Features

### 🔗 URL Encoder/Decoder
- Encode text to URL-safe format
- Decode URL-encoded strings
- Perfect for working with query parameters and URLs

### 📋 JSON Formatter
- Format/prettify JSON with customizable indentation
- Minify JSON to reduce size
- Validate JSON syntax with detailed error messages
- Adjustable indent size (1-8 spaces)

### 📄 XML Formatter
- Format/prettify XML with proper indentation
- Minify XML to save space
- Validate XML syntax
- Customizable indent size

### 🔐 JWT Decoder
- Decode JWT tokens to view header and payload
- Automatically converts timestamps to human-readable dates
- View signature (cannot be verified without secret key)
- Helpful for debugging authentication issues

### 🔤 Base64 Encoder/Decoder
- Encode text to Base64
- Decode Base64 strings back to text
- Supports UTF-8 encoding

### #️⃣ Hash Generator
- Generate MD5, SHA-1, SHA-256, and SHA-512 hashes
- Copy individual hashes with one click
- Useful for checksum verification and security

### 🆔 UUID Generator
- Generate single or multiple UUIDs (v4)
- Create 10 UUIDs at once
- Perfect for database IDs and unique identifiers

### ⏰ Timestamp Converter
- View current time in Unix and ISO formats
- Convert Unix timestamps to human-readable dates
- Convert dates to Unix timestamps
- Auto-detects seconds vs milliseconds

### 🎨 Color Converter
- Convert between HEX, RGB, and HSL color formats
- Visual color picker
- Enter colors in any format and convert to all formats
- Live color preview

## 🚀 Getting Started

### View Locally

1. Clone this repository:
```bash
git clone https://github.com/one-dev-tools/one-dev-tools.github.io.git
cd dev-tools
```

2. Open `index.html` in your web browser:
```bash
open index.html  # macOS
# or
start index.html  # Windows
# or
xdg-open index.html  # Linux
```

That's it! No build process, no dependencies to install.

### Deploy to GitHub Pages

1. **Push your code to GitHub:**
```bash
git add .
git commit -m "Initial commit: Dev Tools website"
git branch -M main
git remote add origin https://github.com/one-dev-tools/one-dev-tools.github.io.git
git push -u origin main
```

2. **Enable GitHub Pages:**
   - Go to your repository on GitHub
   - Click on **Settings**
   - Scroll down to **Pages** in the left sidebar
   - Under **Source**, select **main** branch and **/ (root)** folder
   - Click **Save**

3. **Access your site:**
   - Your site will be available at your GitHub Pages URL
   - It may take a few minutes for the site to become available

## 📁 Project Structure

```
dev-tools/
├── index.html      # Main HTML file with all tools
├── styles.css      # Styling and responsive design
├── app.js          # JavaScript functionality for all tools
└── README.md       # This file
```

## 🛡️ Privacy & Security

- **100% Client-Side:** All processing happens in your browser
- **No Server Communication:** Your data never leaves your device
- **No Tracking:** No analytics or tracking scripts
- **Open Source:** Review the code yourself

## 🌟 Technologies Used

- **HTML5** - Structure and semantics
- **CSS3** - Modern styling with CSS Grid and Flexbox
- **Vanilla JavaScript** - No frameworks, just pure JS
- **CryptoJS** - For hash generation (loaded from CDN)

## 🔧 Browser Compatibility

Works in all modern browsers:
- Chrome/Edge (v90+)
- Firefox (v88+)
- Safari (v14+)
- Opera (v76+)

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new tools
- Submit pull requests

## 💡 Future Tool Ideas

Potential tools to add:
- Regex Tester
- Markdown Preview
- HTML/CSS/JS Minifier
- Image to Base64 Converter
- Text Diff Tool
- Lorem Ipsum Generator
- GUID/UUID Validator
- QR Code Generator

## 👤 Author

One Dev Tools - [GitHub Profile](https://github.com/one-dev-tools/one-dev-tools.github.io)

## 🙏 Acknowledgments

- CryptoJS library for hash generation
- Design inspired by modern developer tools

---

**⭐ Star this repository if you find it useful!**
