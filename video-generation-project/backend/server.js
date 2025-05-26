const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' })); // Increase limit for image uploads
app.use(express.static(path.join(__dirname, '../frontend')));

// MiniMaxi API Key - IMPORTANT: Replace with your actual API key
const MINIMAXI_API_KEY = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJHcm91cE5hbWUiOiJ5dWtpIiwiVXNlck5hbWUiOiJ5dWtpIiwiQWNjb3VudCI6IiIsIlN1YmplY3RJRCI6IjE5MjcwMDgyOTcwMDE0MjY5NDYiLCJQaG9uZSI6IjE1Mjk3OTk3MTQ1IiwiR3JvdXBJRCI6IjE5MjcwMDgyOTY5OTcyMzI2NDIiLCJQYWdlTmFtZSI6IiIsIk1haWwiOiIzMjkzNjA5ODdAcXEuY29tIiwiQ3JlYXRlVGltZSI6IjIwMjUtMDUtMjYgMjI6NTU6NTYiLCJUb2tlblR5cGUiOjEsImlzcyI6Im1pbmltYXgifQ.KI_XAP5CpforNkGSnpUOzEokPcXQ4r_Z1q0DO08TwiDDjGvfTDhpnYZmaa7Cu1rOJFIjymYb_R_Nz8jvkMr0QBFDOlBno_0-UYKdy8Rn-L8wQy1ZqKlb4gOQYVRcD1dbjAkec0WXcrAUPHe0uQlBLpmdxYRlvwQpQ46TJokKQL8VpBamynZdBmZ1bPqq4VywKniX4wHX8-G6LtP2uU6Ghc8fEQHVCmeYE9Q8DIF-QeddNk8hzflXgFjolE3odzPR5Jy0M026X8lZpJdQ90-nwYiNeJA9-aTqzPYFHy6UuDtkX4UsjIi4Xxcjm5lhTWTwUCX9_iwYFFpa0warBSENVQ';

// MiniMaxi API Endpoints from documentation
const MINIMAXI_VIDEO_GEN_URL = 'https://api.minimax.chat/v1/video_generation';
const MINIMAXI_VIDEO_STATUS_URL = 'https://api.minimax.chat/v1/query/video_generation';
const MINIMAXI_FILE_RETRIEVE_URL = 'https://api.minimax.chat/v1/files/retrieve';

// Route to initiate video generation
app.post('/api/generate-video', async (req, res) => {
    try {
        const { text, voiceId } = req.body; // 'voiceId' is not in docs, using 'prompt' and 'model'
        if (!text) {
            return res.status(400).json({ error: 'Text (prompt) is required for video generation.' });
        }

        const payload = {
            model: "T2V-01-Director", // Default model as per example, can be made configurable
            prompt: text
            // Add other parameters like first_frame_image, subject_reference, prompt_optimizer if needed
        };

        const response = await fetch(MINIMAXI_VIDEO_GEN_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${MINIMAXI_API_KEY}`
            },
            body: JSON.stringify(payload)
        });
        const data = await response.json();

        if (response.ok && data.task_id) {
            res.json({ task_id: data.task_id, status: 'submitted' });
        } else {
            console.error('MiniMaxi API Error (Generate):', data);
            res.status(response.status).json({ error: data.base_resp?.status_msg || 'Failed to generate video from MiniMaxi API', details: data });
        }
    } catch (error) {
        console.error('Error generating video:', error);
        res.status(500).json({ error: 'Failed to connect to MiniMaxi API or generate video' });
    }
});

// Route to initiate image-to-video generation
app.post('/api/generate-video-from-image', async (req, res) => {
    try {
        const { prompt, first_frame_image } = req.body;
        if (!prompt || !first_frame_image) {
            return res.status(400).json({ error: 'Prompt and Base64 image are required for image-to-video generation.' });
        }

        const payload = {
            model: "I2V-01-Director", // Model as per user's Python example
            prompt: prompt,
            first_frame_image: first_frame_image
        };

        const response = await fetch(MINIMAXI_VIDEO_GEN_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${MINIMAXI_API_KEY}`
            },
            body: JSON.stringify(payload)
        });
        const data = await response.json();

        if (response.ok && data.task_id) {
            res.json({ task_id: data.task_id, status: 'submitted' });
        } else {
            console.error('MiniMaxi API Error (Generate Image-to-Video):', data);
            res.status(response.status).json({ error: data.base_resp?.status_msg || 'Failed to generate video from image via MiniMaxi API', details: data });
        }
    } catch (error) {
        console.error('Error generating video from image:', error);
        res.status(500).json({ error: 'Failed to connect to MiniMaxi API or generate video from image' });
    }
});

// Route to check video generation status
app.get('/api/get-video-status/:taskId', async (req, res) => {
    try {
        const { taskId } = req.params;
        const response = await fetch(`${MINIMAXI_VIDEO_STATUS_URL}?task_id=${taskId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${MINIMAXI_API_KEY}`
            }
        });
        const data = await response.json();

        if (response.ok && data.task_id) {
            // Map MiniMaxi status to a more consistent format if needed, or use directly
            res.json({
                task_id: data.task_id,
                status: data.status, // e.g., "Success", "Processing", "Fail"
                file_id: data.file_id || null, // file_id is only present on "Success"
                message: data.base_resp?.status_msg || ''
            });
        } else {
            console.error('MiniMaxi API Error (Status):', data);
            res.status(response.status).json({ error: data.base_resp?.status_msg || 'Failed to get video status from MiniMaxi API', details: data });
        }
    } catch (error) {
        console.error('Error getting video status:', error);
        res.status(500).json({ error: 'Failed to connect to MiniMaxi API or get status' });
    }
});

// Route to download generated video
app.get('/api/download-video/:fileId', async (req, res) => {
    try {
        const { fileId } = req.params;

        // Step 1: Retrieve the download URL from MiniMaxi File API
        const retrieveResponse = await fetch(`${MINIMAXI_FILE_RETRIEVE_URL}?file_id=${fileId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${MINIMAXI_API_KEY}`
            }
        });
        const retrieveData = await retrieveResponse.json();

        if (!retrieveResponse.ok || !retrieveData.file?.download_url) {
            console.error('MiniMaxi API Error (Retrieve File):', retrieveData);
            return res.status(retrieveResponse.status).json({ error: retrieveData.base_resp?.status_msg || 'Failed to retrieve file download URL', details: retrieveData });
        }

        const downloadUrl = retrieveData.file.download_url;

        // Step 2: Stream the video content from the download URL
        const videoResponse = await fetch(downloadUrl);

        if (!videoResponse.ok) {
            throw new Error(`HTTP error! status: ${videoResponse.status} from video download URL`);
        }

        // Instead of streaming, send the download URL back to the frontend
        res.json({ download_url: downloadUrl });
    } catch (error) {
        console.error('Error retrieving video download URL:', error);
        res.status(500).json({ error: 'Failed to retrieve video download URL' });
    }
});

app.listen(PORT, () => {
    console.log(`Backend server listening at http://localhost:${PORT}`);
});
