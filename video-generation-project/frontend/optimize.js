document.addEventListener('DOMContentLoaded', () => {
    const geminiApiKeyInput = document.getElementById('geminiApiKey');
    const modelSelect = document.getElementById('modelSelect');
    const videoSelectInput = document.getElementById('videoSelect');
    const promptContentInput = document.getElementById('promptContent');
    const submitOptimizationBtn = document.getElementById('submitOptimizationBtn');
    const optimizedPromptOutput = document.getElementById('optimizedPromptOutput');
    const messageDiv = document.getElementById('message');

    function showMessage(msg, type = 'info') {
        messageDiv.textContent = msg;
        messageDiv.className = `message show ${type}`;
        setTimeout(() => {
            messageDiv.classList.remove('show');
        }, 5000);
    }

    const encodeFileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.toString().split(',')[1] || '');
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
        });
    };

    submitOptimizationBtn.addEventListener('click', async () => {
        const apiKey = geminiApiKeyInput.value.trim();
        const model = modelSelect.value;
        const promptText = promptContentInput.value.trim();
        const videoFile = videoSelectInput.files[0]; // This will be undefined if no file is selected

        if (!apiKey) {
            showMessage('Please enter your API Key.', 'error');
            return;
        }
        if (!model) {
            showMessage('Please select a model.', 'error');
            return;
        }
        if (!promptText) {
            showMessage('Please enter content for prompt optimization.', 'error');
            return;
        }
        // Removed: if (!videoFile) validation

        showMessage('Optimizing prompt...', 'info');
        submitOptimizationBtn.disabled = true;
        optimizedPromptOutput.value = ''; // Clear previous output

        try {
            const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

            const parts = [{ text: promptText }];

            if (videoFile) {
                const base64Video = await encodeFileToBase64(videoFile);
                const videoMimeType = videoFile.type;
                parts.push({
                    inlineData: {
                        mimeType: videoMimeType,
                        data: base64Video
                    }
                });
            }

            const payload = {
                contents: [
                    {
                        role: 'user',
                        parts: parts
                    }
                ]
            };

            const response = await fetch(GEMINI_API_URL, { // Direct call to Gemini API
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            const data = await response.json();

            if (response.ok && data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) {
                const optimizedContent = data.candidates[0].content.parts[0].text;
                optimizedPromptOutput.value = optimizedContent;
                showMessage('Prompt optimized successfully!', 'success');
            } else {
                showMessage(`Error: ${data.error?.message || 'Unknown error during optimization.'}`, 'error');
                console.error('Optimization Error:', data);
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage('Failed to optimize prompt. Check console for details.', 'error');
        } finally {
            submitOptimizationBtn.disabled = false;
        }
    });
});
