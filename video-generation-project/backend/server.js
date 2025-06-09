const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = 3000;

// In-memory task storage (for demonstration purposes)
const tasks = [];
let taskIdCounter = 1;

app.use(express.json()); // Default limit is fine now

app.use(express.static(path.join(__dirname, '../frontend')));


// IMPORTANT: For production, sensitive information like API keys and endpoints
// should be loaded from environment variables (e.g., process.env.MINIMAXI_API_KEY)
// and not hardcoded or committed to version control.
// const MINIMAXI_API_KEY = process.env.MINIMAXI_API_KEY;
// const MINIMAXI_VIDEO_GEN_URL = process.env.MINIMAXI_VIDEO_GEN_URL;


// Route to initiate video generation
app.post('/api/generate-video', async (req, res) => {
    try {
        const { text, ratio, duration, model, quantity, token } = req.body;
        if (!text || !ratio || !duration || !model || !quantity || !token) {
            return res.status(400).json({ error: 'All fields (text, ratio, duration, model, quantity, token) are required for video generation.' });
        }

        // Create a new task and add it to the in-memory storage
        const newTask = {
            id: `task_${taskIdCounter++}`,
            text,
            ratio,
            duration,
            model,
            quantity,
            token,
            status: '排队中', // New tasks are initially queued
            createdAt: new Date().toISOString()
        };
        tasks.push(newTask);
        console.log('New task created:', newTask);

        // Mocking the MiniMaxi API call to always succeed
        // In a real application, you would use MINIMAXI_API_KEY and MINIMAXI_VIDEO_GEN_URL here.
        // Also, ensure proper input sanitization for 'text' and other user inputs
        // before sending them to external APIs to prevent injection attacks.
        console.log('Mocking MiniMaxi API call for video generation...');
        const mockData = {
            mock_response: 'This is a mocked successful response from MiniMaxi API.',
            generated_video_url: `http://mock-video-url.com/${newTask.id}.mp4`
        };

        res.json({ message: 'Video generation request sent successfully (mocked)', data: mockData, taskId: newTask.id });

    } catch (error) {
        console.error('Error generating video (mocked path):', error);
        res.status(500).json({ error: 'Internal server error during mocked video generation' });
    }
});

// Route to get all tasks
app.get('/api/tasks', (req, res) => {
    res.json(tasks);
});

// Route to query task status (simulate external API call)
app.post('/api/tasks/:id/query', (req, res) => {
    const taskId = req.params.id;
    const task = tasks.find(t => t.id === taskId);

    if (!task) {
        return res.status(404).json({ error: 'Task not found.' });
    }

    // Simulate status update logic based on task ID
    if (taskId === 'task_1') {
        // For task_1, cycle between '排队中' and '失败'
        if (task.status === '排队中') {
            task.status = '失败';
        } else if (task.status === '失败') {
            task.status = '排队中'; // Allow retry to go back to queued
        }
    } else if (taskId === 'task_2') {
        // For task_2, always go to '已完成' on first query from '排队中'
        if (task.status === '排队中' || task.status === '处理中') {
            task.status = '已完成';
        }
    } else {
        // Default random behavior for other tasks
        if (task.status === '排队中') {
            task.status = Math.random() > 0.7 ? '处理中' : '失败';
        } else if (task.status === '处理中') {
            task.status = Math.random() > 0.5 ? '已完成' : '失败';
        }
    }

    res.json({ message: `Task ${taskId} status updated to ${task.status}`, task });
});

// Route to retry a failed task
app.post('/api/tasks/:id/retry', (req, res) => {
    const taskId = req.params.id;
    const task = tasks.find(t => t.id === taskId);

    if (!task) {
        return res.status(404).json({ error: 'Task not found.' });
    }

    if (task.status === '失败') {
        task.status = '排队中'; // Reset to queued
        res.json({ message: `Task ${taskId} has been reset to 排队中`, task });
    } else {
        res.status(400).json({ error: 'Only failed tasks can be retried.' });
    }
});

// Route to simulate task download
app.get('/api/tasks/:id/download', (req, res) => {
    const taskId = req.params.id;
    const task = tasks.find(t => t.id === taskId);

    if (!task) {
        return res.status(404).json({ error: 'Task not found.' });
    }

    if (task.status === '已完成') {
        // In a real application, this would serve the actual video file
        res.json({ message: `Simulating download for task ${taskId}`, downloadUrl: `/downloads/${taskId}.mp4` });
    } else {
        res.status(400).json({ error: 'Task is not completed yet, cannot download.' });
    }
});

// Route for user login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    // Mock authentication: admin/admin
    if (username === 'admin' && password === 'admin') {
        res.json({ success: true, message: 'Login successful' });
    } else {
        res.status(401).json({ success: false, error: 'Invalid username or password' });
    }
});

app.listen(PORT, () => {
    console.log(`Backend server listening at http://localhost:${PORT}`);
});
