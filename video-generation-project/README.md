# Video Generation and Prompt Optimization Project

This project provides a web interface for generating videos and optimizing prompts using external AI APIs.

## Project Structure

```
.
├── backend/
│   ├── package.json
│   ├── server.js
├── frontend/
│   ├── index.html
│   ├── script.js
│   ├── style.css
│   ├── optimize.html
│   └── optimize.js
└── README.md
```

## Setup and Installation

1.  **Navigate to the project root directory:**
    ```bash
    cd /Users/onionyao/Documents/hailuo/video-generation-project
    ```
2.  **Install Backend Dependencies:**
    Navigate into the `backend` directory and install Node.js dependencies.
    ```bash
    cd backend
    npm install
    cd ..
    ```
    *(Note: `node-fetch` is used, which might be outdated. Consider updating to a newer version or `axios` for better performance and features if issues arise.)*

## How to Use the Project

### 1. Start the Backend Server

From the project root directory, run the backend server:

```bash
node backend/server.js
```
You should see a message in your terminal: `Backend server listening at http://localhost:3000`. Keep this terminal running.

### 2. Access the Frontend Application

Open your web browser and navigate to:

```
http://localhost:3000
```

You will see the main "Video Generation" page.

### 3. Using the Video Generation Feature

On the main page (`http://localhost:3000`):

*   **Text for Video:** Enter the text content you want to use for video generation.
*   **比例 (Ratio):** Select the desired video aspect ratio (e.g., `9:16`, `16:9`).
*   **时长 (Duration):** Select the desired video duration (e.g., `5s`, `10s`).
*   **Token:** Enter your specific token value required by the MiniMaxi API.
*   **Generate Video Button:** This button will be disabled until all required fields (marked with `*`) are filled. If disabled, hovering over it will show a tooltip: "请检查所有的必填项是否填写完整" (Please check if all required fields are filled).
*   Click "Generate Video" to send your request to the MiniMaxi API. A message will appear at the bottom indicating the request status.

**Important:** The `backend/server.js` uses a placeholder `MINIMAXI_API_KEY`. You must replace `'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.....'` with your actual MiniMaxi API key for the video generation feature to work.

### 4. Using the Prompt Optimization Feature

From the main page (`http://localhost:3000`), click the "提示词优化" (Prompt Optimization) button. This will take you to a new page: `http://localhost:3000/optimize.html`.

On the Prompt Optimization page:

*   **API Key:** Enter your **Gemini API Key**.
*   **模型选择 (Model Selection):** Choose the Gemini model you want to use (e.g., `gemini-2.0-flash`, `gemini-2.5-flash-preview-05-20`).
*   **视频选择 (Video Selection):** Click "选择文件" to upload a video file.
*   **输入相关内容 (Enter relevant content):** Provide a text prompt for Gemini to process along with the video.
*   **提交 (Submit) Button:** Click this button to send the video (Base64 encoded) and text prompt directly to the Gemini API.
*   **优化后的提示词 (Optimized Prompt):** The response from Gemini will be displayed in this text area.

**Important Notes for Prompt Optimization:**

*   **Direct API Call:** This feature makes a direct API call from your browser to the Gemini API. Ensure your browser and network allow direct connections to `https://generativelanguage.googleapis.com`.
*   **API Key Security:** Be aware that entering your API key directly in the frontend exposes it in your browser's network requests. For production applications, it's generally recommended to proxy API calls through a secure backend to protect your API keys.
*   **Video Size:** Sending large video files as Base64 can be slow and consume significant memory. Gemini API's `inlineData` for video might have size limitations. For very large videos, Google's recommended approach is to first upload the video to Google Cloud Storage and then provide Gemini with the GCS URI. If you encounter `ETIMEDOUT` or other errors, consider the video file size.
*   **Network Issues:** If you encounter `ETIMEDOUT` errors, it indicates a network connectivity issue between your machine and the Gemini API, or an invalid API key. Please verify your internet connection, firewall settings, and the correctness of your Gemini API key.
