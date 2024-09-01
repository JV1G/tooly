const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');
const util = require('util');

const execPromise = util.promisify(exec);

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/download', async (req, res) => {
    const url = req.body.url; // Extract the URL from the request body
    console.log(`Requested URL: ${url}`);

    if (!url) {
        return res.status(400).json({ error: 'No URL provided' });
    }

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
