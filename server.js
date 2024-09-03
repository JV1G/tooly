const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const util = require('util');

const execPromise = util.promisify(exec);

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

app.post('/download', async (req, res) => {
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

    try {
        // Fetch metadata to get the video title
        const { stdout } = await execPromise(`yt-dlp --get-title "${url}"`);
        const title = stdout.trim().replace(/[^a-zA-Z0-9_\-]/g, '_');
        const tempFile = path.join(os.tmpdir(), `${title}.mp3`);
        
        // Download the audio file
        const command = `yt-dlp -x --audio-format mp3 --audio-quality 0 -o "${tempFile}" "${url}"`;
        await execPromise(command);

        // Stream the file to the client
        res.download(tempFile, (err) => {
            if (err) {
                console.error('Error during file download:', err);
                res.status(500).json({ error: 'Error during file download' });
            } else {
                fs.unlink(tempFile, (err) => {
                    if (err) console.error('Error deleting file:', err);
                });
            }
        });
    } catch (error) {
        console.error('Error during download:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
