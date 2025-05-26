document.addEventListener('DOMContentLoaded', () => {
    const textInput = document.getElementById('textInput');
    const voiceIdInput = document.getElementById('voiceIdInput');
    const generateVideoBtn = document.getElementById('generateVideoBtn');
    const taskIdDisplay = document.getElementById('taskIdDisplay');
    const statusDisplay = document.getElementById('statusDisplay');
    const checkStatusBtn = document.getElementById('checkStatusBtn');
    const autoGenFileIdDisplay = document.getElementById('autoGenFileIdDisplay'); // New const for the renamed element
    const downloadVideoBtn = document.getElementById('downloadVideoBtn');
    const videoPlayer = document.getElementById('videoPlayer');
    const messageDiv = document.getElementById('message');

    // Elements for image-to-video generation
    const imageUpload = document.getElementById('imageUpload');
    const imagePromptInput = document.getElementById('imagePromptInput');
    const generateVideoFromImageBtn = document.getElementById('generateVideoFromImageBtn');

    // Elements for manual task ID check
    const manualTaskIdInput = document.getElementById('manualTaskIdInput');
    const manualCheckStatusBtn = document.getElementById('manualCheckStatusBtn');
    const manualStatusDisplay = document.getElementById('manualStatusDisplay');
    const manualDownloadVideoBtn = document.getElementById('manualDownloadVideoBtn');


    // Initialize display elements
    taskIdDisplay.textContent = 'N/A';
    statusDisplay.textContent = 'N/A';
    autoGenFileIdDisplay.textContent = 'N/A'; // Use the new const
    autoGenFileIdDisplay.style.color = '#555'; // Initialize color
    manualStatusDisplay.textContent = 'N/A';
    document.getElementById('manualFileIdDisplay').textContent = 'N/A'; // Get fresh reference


    let currentTaskId = null;

    function showMessage(msg, type = 'info') {
        messageDiv.textContent = msg;
        messageDiv.className = `message show ${type}`;
        setTimeout(() => {
            messageDiv.classList.remove('show');
        }, 5000);
    }

    function enableControls(generate = true, check = false, download = false) {
        generateVideoBtn.disabled = !generate;
        checkStatusBtn.disabled = !check;
        downloadVideoBtn.disabled = !download;
    }

    // Helper function to convert file to Base64
    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    }

    enableControls(true, false, false); // Initial state

    generateVideoBtn.addEventListener('click', async () => {
        const text = textInput.value.trim();
        const voiceId = voiceIdInput.value.trim();

        if (!text) {
            showMessage('Please enter text for video generation.', 'error');
            return;
        }

        // Reset displays for new generation
        taskIdDisplay.textContent = 'N/A';
        statusDisplay.textContent = 'N/A';
        autoGenFileIdDisplay.textContent = 'N/A'; // Use the new const
        autoGenFileIdDisplay.style.color = '#555'; // Use the new const
        downloadVideoBtn.disabled = true;


        showMessage('Initiating video generation...', 'info');
        enableControls(false, false, false); // Disable all controls during generation

        try {
            const response = await fetch('/api/generate-video', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text, voiceId })
            });
            const data = await response.json();

            if (response.ok && data.task_id) {
                currentTaskId = data.task_id;
                taskIdDisplay.textContent = currentTaskId;
                statusDisplay.textContent = 'Submitted';
                showMessage(`Video generation task submitted. Task ID: ${currentTaskId}. Please click 'Check Status (Current Task)' to update.`, 'success');
                enableControls(true, true, false); // Enable check status button, no auto-polling
            } else {
                showMessage(`Error: ${data.error || 'Unknown error during generation.'}`, 'error');
                enableControls(true, false, false);
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage('Failed to connect to backend or generate video.', 'error');
            enableControls(true, false, false);
        }
    });

    generateVideoFromImageBtn.addEventListener('click', async () => {
        const prompt = imagePromptInput.value.trim();
        const imageFile = imageUpload.files[0];

        if (!imageFile) {
            showMessage('Please upload an image for video generation.', 'error');
            return;
        }

        if (!prompt) {
            showMessage('Please enter a prompt for image-to-video generation.', 'error');
            return;
        }

        // Reset displays for new generation
        taskIdDisplay.textContent = 'N/A';
        statusDisplay.textContent = 'N/A';
        autoGenFileIdDisplay.textContent = 'N/A';
        autoGenFileIdDisplay.style.color = '#555';
        downloadVideoBtn.disabled = true;

        showMessage('Initiating image-to-video generation...', 'info');
        enableControls(false, false, false); // Disable all controls during generation

        try {
            const base64Image = await fileToBase64(imageFile);
            // The Minimax API expects 'data:image/jpeg;base64,' prefix, which FileReader.readAsDataURL provides.
            // Ensure it's a JPEG or adjust the prefix if other formats are allowed.
            // For simplicity, assuming JPEG for now based on the Python example.

            const response = await fetch('/api/generate-video-from-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ prompt, first_frame_image: base64Image })
            });
            const data = await response.json();

            if (response.ok && data.task_id) {
                currentTaskId = data.task_id;
                taskIdDisplay.textContent = currentTaskId;
                statusDisplay.textContent = 'Submitted';
                showMessage(`Image-to-video generation task submitted. Task ID: ${currentTaskId}. Please click 'Check Status (Current Task)' to update.`, 'success');
                enableControls(true, true, false); // Enable check status button, no auto-polling
            } else {
                showMessage(`Error: ${data.error || 'Unknown error during image-to-video generation.'}`, 'error');
                enableControls(true, false, false);
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage('Failed to connect to backend or generate video from image.', 'error');
            enableControls(true, false, false);
        }
    });

    checkStatusBtn.addEventListener('click', () => {
        console.log(`DEBUG: 'Check Status (Current Task)' clicked. currentTaskId: ${currentTaskId}`);
        if (currentTaskId) {
            checkVideoStatus(currentTaskId, taskIdDisplay, statusDisplay, 'autoGenFileIdDisplay', downloadVideoBtn); // Pass new ID string
        } else {
            showMessage('No task ID available to check status.', 'error');
        }
    });

    async function checkVideoStatus(taskId, taskIdElem, statusElem, fileIdSpanId, downloadBtnElem) { // Accept ID string
        const fileIdElem = document.getElementById(fileIdSpanId); // Get element inside function
        console.log(`DEBUG: checkVideoStatus called for taskId: ${taskId}, targeting fileIdElem.id: ${fileIdElem.id}`);
        showMessage('Checking video status...', 'info');
        try {
            const response = await fetch(`/api/get-video-status/${taskId}`);
            const data = await response.json();

            if (data.status) {
                taskIdElem.textContent = taskId;
                statusElem.textContent = data.status;
                showMessage(`Task Status for ${taskId}: ${data.status}`, 'info');

                if (data.status === 'Success' && data.file_id) {
                    fileIdElem.textContent = data.file_id;
                    fileIdElem.style.color = '#007bff';
                    showMessage('Video generation completed successfully!', 'success');
                    if (downloadBtnElem) downloadBtnElem.disabled = false;
                } else if (data.status === 'Fail') {
                    fileIdElem.textContent = 'N/A';
                    fileIdElem.style.color = '#555';
                    showMessage(`Video generation failed: ${data.message || 'Unknown reason.'}`, 'error');
                    if (downloadBtnElem) downloadBtnElem.disabled = true;
                } else {
                    fileIdElem.textContent = 'N/A';
                    fileIdElem.style.color = '#555';
                    showMessage(`Task ${taskId} is ${data.status}. Please check again later.`, 'info');
                    if (downloadBtnElem) downloadBtnElem.disabled = true;
                }
            } else {
                showMessage(`Error: ${data.error || 'Unknown error checking status.'}`, 'error');
                fileIdElem.textContent = 'N/A';
                fileIdElem.style.color = '#555';
                if (downloadBtnElem) downloadBtnElem.disabled = true;
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage('Failed to connect to backend or check status.', 'error');
            fileIdElem.textContent = 'N/A';
            fileIdElem.style.color = '#555';
            if (downloadBtnElem) downloadBtnElem.disabled = true;
        }
    }

    downloadVideoBtn.addEventListener('click', async () => {
        const fileId = autoGenFileIdDisplay.textContent; // Use the new const
        if (fileId && fileId !== 'N/A') {
            showMessage('Fetching video download link...', 'info');
            try {
                const response = await fetch(`/api/download-video/${fileId}`);
                const data = await response.json();

                if (response.ok && data.download_url) {
                    const a = document.createElement('a');
                    a.href = data.download_url;
                    a.download = `${fileId}.mp4`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);

                    showMessage('Video download initiated.', 'success');
                    videoPlayer.innerHTML = '';
                } else {
                    showMessage(`Error fetching video: ${data.error || 'Unknown error.'}`, 'error');
                    console.error('Error fetching video download URL:', data);
                }
            } catch (error) {
                console.error('Error:', error);
                showMessage('Failed to connect to backend or initiate video download.', 'error');
            }
        } else {
            showMessage('No file ID available to download.', 'error');
        }
    });

    // New functionality for manual task ID check
    manualCheckStatusBtn.addEventListener('click', () => {
        const manualTaskId = manualTaskIdInput.value.trim();
        if (manualTaskId) {
            checkVideoStatus(manualTaskId, manualTaskIdInput, manualStatusDisplay, 'manualFileIdDisplay', manualDownloadVideoBtn); // Pass ID string
        } else {
            showMessage('Please enter a Task ID to check status.', 'error');
        }
    });

    manualDownloadVideoBtn.addEventListener('click', async () => {
        const manualFileId = document.getElementById('manualFileIdDisplay').textContent; // Get fresh reference
        if (manualFileId && manualFileId !== 'N/A') {
            showMessage('Fetching manual video download link...', 'info');
            try {
                const response = await fetch(`/api/download-video/${manualFileId}`);
                const data = await response.json();

                if (response.ok && data.download_url) {
                    const a = document.createElement('a');
                    a.href = data.download_url;
                    a.download = `${manualFileId}.mp4`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);

                    showMessage('Manual video download initiated.', 'success');
                    videoPlayer.innerHTML = '';
                } else {
                    showMessage(`Error fetching manual video: ${data.error || 'Unknown error.'}`, 'error');
                    console.error('Error fetching manual video download URL:', data);
                }
            } catch (error) {
                console.error('Error:', error);
                showMessage('Failed to connect to backend or initiate manual video download.', 'error');
            }
        } else {
            showMessage('No file ID available for manual download.', 'error');
        }
    });
});
