# Tooly

This project is a simple media downloader built with Node.js and Express. It allows users to download audio from various supported websites in MP3 format, with a focus on YouTube.

## Project Structure

- **`server.js`**: Node.js server file that handles requests and interacts with `yt-dlp` to download audio.
- **`public/index.html`**: Frontend HTML page with a form for users to input YouTube URLs and with basic styling.

## Prerequisites

- **Node.js**: Make sure you have Node.js installed. You can download it from [nodejs.org](https://nodejs.org/).
- **yt-dlp**: A command-line tool for downloading videos from YouTube and other sites.

## Installation

### 1. Clone the Repository
```sh
git clone https://github.com/JV1G/tooly.git
```

### 2. Install Node.js Dependencies
Install the necessary Node.js packages by running:
```sh
npm install
```

### 3. Install yt-dlp
Install yt-dlp globally using pip:
```sh
pip install yt-dlp
```

### Configuration
Ensure that yt-dlp is accessible in your system's PATH. The server uses yt-dlp to handle the downloading of MP3 files.

### Running the Server
```sh
node server.js
```
The server will be accessible at http://localhost:3000.

### Usage
- Open http://localhost:3000 in your web browser.
- Enter a URL in the input field and click "Download".
- The server will process the URL and start the download. The status and progress of the download will be displayed on the page.