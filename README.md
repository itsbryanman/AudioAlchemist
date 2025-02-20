# Audio Alchemist

Welcome to **Audio Alchemist** – the quirky, kickass webapp that transforms your messy audiobook files into a beautifully organized library. This README is detailed as **** – every nook and cranny of this project is explained so you (or any other developer) can jump right in and get to work.

---

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Project Architecture](#project-architecture)
- [Installation](#installation)
  - [Prerequisites](#prerequisites)
  - [Git & GitHub CLI Setup](#git--github-cli-setup)
- [Usage](#usage)
- [Configuration & Variables](#configuration--variables)
- [Development Guidelines](#development-guidelines)
- [Advanced Features](#advanced-features)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## Introduction

**Audio Alchemist** is designed to take your audiobooks—be they in MP3, M4B, or AAC formats—and rename them with style and precision. Whether you’ve got a single file or an entire directory of files (with book series needing a specific order, hell yes), this webapp will handle it. It extracts existing metadata, enriches it with API data (like OpenLibrary and Google Books), and even generates logs and .nfo files. It's like having your own digital librarian with a sense of humor.

---

## Features

- **File Handling:**
  - Supports **mp3, m4b, aac**
  - Single file selection and directory renaming
  - Automatic directory creation for lone files
  - Batch processing capabilities

- **Renaming Patterns:**
  - Standard: `{title} {author}`
  - Series: `{series}/{series}{number}/{title}`
  - Customizable patterns and regex support (potential future feature)

- **Metadata Management:**
  - Extract existing metadata and enrich via API (OpenLibrary, Google Books)
  - Write new metadata to files
  - Generate accompanying `.nfo` files with important fields (cover, author, title, description, ISBN)

- **User Interface:**
  - Web app with a slick two-column layout (preview pane and configuration options)
  - Multi-select functionality
  - Custom pastel red accent for a cool, flowing aesthetic

- **Advanced Features:**
  - Duplicate detection using filename + filesize, with optional hash verification
  - Manual override for fine-tuning renaming options
  - Detailed logging: TXT file for all renamed files and .trash folder for files you want to review later

---

## Project Architecture

### Frontend Structure

- **index.html:** Main entry point
- **/css/**
  - `styles.css` – General styling
  - `components.css` – UI component styles
- **/js/**
  - **/components/** – React components:
    - `App.js` – Main container
    - `FileSelector.js` – File/directory selection
    - `FileList.js` – Displays selected files
    - `RenamingOptions.js` – Format configuration
    - `MetadataManager.js` – Metadata handling
    - `PreviewPane.js` – Shows before/after renaming preview
    - `DuplicateChecker.js` – Duplicate detection
    - `ProgressTracker.js` – Batch processing progress
  - **/services/** – API and file handling services:
    - `fileService.js` – File operations
    - `openLibraryService.js` – OpenLibrary API integration
    - `googleBooksService.js` – Google Books API integration
    - `metadataService.js` – Extract/write metadata
    - `namingService.js` – Generate filenames based on patterns
  - **/utils/** – Helper functions

### Backend API (Optional)

- **server/server.js:** Express server for handling file operations and API routing

---

## Installation

### Prerequisites

Make sure you have the following installed on your server:
- **Node.js** (preferably LTS)
- **npm** (Node Package Manager)
- **Git**
- **GitHub CLI (gh)**

### Git & GitHub CLI Setup

1. **Installing Git (Ubuntu/Debian):**
   ```bash
   sudo apt update
   sudo apt install git
   ```
   Configure Git:
   ```bash
   git config --global user.name "Your Name"
   git config --global user.email "youremail@example.com"
   ```

2. **Installing GitHub CLI (Ubuntu/Debian):**
   ```bash
   curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
   sudo chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg
   echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
   sudo apt update
   sudo apt install gh
   ```

3. **Creating and Cloning the Repository:**
   - Create a new repository using the GitHub CLI:
     ```bash
     gh repo create audio-alchemist --public --confirm
     ```
   - Clone your repository:
     ```bash
     git clone https://github.com/yourusername/audio-alchemist.git
     cd audio-alchemist
     ```

---

## Usage

1. **Starting the Web App:**
   - If you have a backend (Express server), run:
     ```bash
     node server/server.js
     ```
   - Open `index.html` in your preferred web browser (or set up a local server with something like `http-server`).

2. **File Selection and Processing:**
   - Use the **FileSelector** component to pick files or directories.
   - Configure renaming options via **RenamingOptions**.
   - Review changes in the **PreviewPane**.
   - Confirm the changes to start the batch processing, during which duplicate checks and logging occur.

3. **Logs and Recovery:**
   - A detailed log of renamed files is generated in a TXT file.
   - Files moved to the `.trash` folder can be reviewed to ensure nothing important was lost.

---

## Configuration & Variables

Key configurations and variables are defined in the code. Here’s a snippet:

```javascript
// Configuration
const SUPPORTED_FORMATS = ['mp3', 'm4b', 'aac'];
const API_KEYS = {
  googleBooks: 'YOUR_GOOGLE_BOOKS_API_KEY'
};
const DEFAULT_NAMING_PATTERNS = {
  standard: '{title} {author}',
  series: '{series}/{series}{number}/{title}'
};

// State management
let selectedFiles = [];
let metadataCache = {};
let renamePreviewMap = {};
let duplicatesFound = [];
```

These variables drive how files are processed, renamed, and how metadata is managed. Modify them as needed for your specific requirements.

---

## Development Guidelines

- **Coding Standards:** Write clean, readable code. Follow best practices for JavaScript, React, and Express.
- **Commit Often:** Use descriptive commit messages. Follow a commit style that makes it easy to track changes.
- **Testing:** Always test new features on a subset of your audiobook files before running full batch processing.
- **Documentation:** Comment your code generously. This README is your starting point—update it as features evolve.
- **Error Handling:** Robust error handling is critical, especially with file operations. Ensure you log and handle exceptions gracefully.

---

## Advanced Features

- **Duplicate Detection:**  
  The system primarily uses filename and filesize to detect duplicates. An optional content hash method is available for enhanced verification.
- **Manual Overrides:**  
  Developers can implement manual override options, allowing users to fine-tune renaming rules.
- **Logging and Trash Management:**  
  A TXT log file records all operations, and a `.trash` folder holds any files that were replaced or removed, giving users a fallback if something goes wrong.
- **Metadata Enrichment:**  
  Integrate OpenLibrary and Google Books APIs to enrich metadata before renaming.

---

## Contributing

Contributions are welcome, whether it’s bug fixes, feature enhancements, or improvements to documentation. Here’s how to contribute:

1. **Fork the Repository**
2. **Create a New Branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make Your Changes**
4. **Commit Your Changes:**
   ```bash
   git commit -m "Description of changes"
   ```
5. **Push to Your Branch:**
   ```bash
   git push origin feature/your-feature-name
   ```
6. **Create a Pull Request on GitHub**

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Contact

For any questions, suggestions, or if you just wanna chat about how awesome audiobooks are, hit us up at [bryan@thecorneroftheweb.com](mailto:bryan@thecorneroftheweb.com).

---

Now that you have a super-detailed roadmap, it’s time to transform your audiobook chaos into organized bliss. Happy coding, and may the Audio Alchemy magic be with you!
