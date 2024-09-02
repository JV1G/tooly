const express = require('express');
const bodyParser = require('body-parser');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Directory to store cached files
const cacheDir = path.join(__dirname, 'cache');

// Ensure the cache directory exists
if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir);
}

// Function to generate a unique cache key based on the URL
function generateCacheKey(url) {
    return crypto.createHash('md5').update(url).digest('hex');
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/download', (req, res) => {
    const url = req.body.url;

    if (!url) {
        return res.status(400).json({ error: 'No URL provided' });
    }

    const cacheKey = generateCacheKey(url);
    const cachedFile = path.join(cacheDir, `${cacheKey}.mp3`);

    // Check if the file is already in the cache
    if (fs.existsSync(cachedFile)) {
        console.log('Serving from cache:', cachedFile);
        return res.download(cachedFile);
    }

    console.log(`Downloading and converting: ${url}`);

    // Spawn the yt-dlp process
    const ytDlp = spawn('yt-dlp', [
        '-f', 'bestaudio',
        '--extract-audio',
        '--audio-format', 'mp3',
        '--audio-quality', '0',
        '-o', cachedFile,
        url
    ]);

    ytDlp.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    ytDlp.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    ytDlp.on('close', (code) => {
        if (code === 0) {
            console.log('Download and conversion complete, serving file.');
            res.download(cachedFile, (err) => {
                if (err) {
                    console.error('Error during file download:', err);
                    res.status(500).json({ error: 'Error during file download' });
                }
            });
        } else {
            console.error(`yt-dlp process exited with code ${code}`);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
