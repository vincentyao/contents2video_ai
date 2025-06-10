document.addEventListener('DOMContentLoaded', () => {
    const textInput = document.getElementById('textInput');
    const ratioSelect = document.getElementById('ratioSelect');
    const durationSelect = document.getElementById('durationSelect');
    const modelSelect = document.getElementById('modelSelect');
    const quantitySelect = document.getElementById('quantitySelect');
    const tokenInput = document.getElementById('tokenInput');
    const generateVideoBtn = document.getElementById('generateVideoBtn');
    const messageDiv = document.getElementById('message');
    const tooltip = document.getElementById('tooltip'); // Get the tooltip element

    function showMessage(msg, type = 'info') {
        messageDiv.textContent = msg;
        messageDiv.className = `message show ${type}`;
        setTimeout(() => {
            messageDiv.classList.remove('show');
        }, 5000);
    }

    function validateInputs() {
        const isTextFilled = textInput.value.trim() !== '';
        const isRatioSelected = ratioSelect.value !== '';
        const isDurationSelected = durationSelect.value !== '';
        const isModelSelected = modelSelect.value !== '';
        const isQuantitySelected = quantitySelect.value !== '';
        const isTokenFilled = tokenInput.value.trim() !== '';

        const allFieldsFilled = isTextFilled && isRatioSelected && isDurationSelected && isModelSelected && isQuantitySelected && isTokenFilled;

        generateVideoBtn.disabled = !allFieldsFilled;
        // No longer setting the title attribute here
    }

    // Initial validation on page load
    validateInputs();

    // Add event listeners for validation
    textInput.addEventListener('input', validateInputs);
    ratioSelect.addEventListener('change', validateInputs);
    durationSelect.addEventListener('change', validateInputs);
    modelSelect.addEventListener('change', validateInputs);
    quantitySelect.addEventListener('change', validateInputs);
    tokenInput.addEventListener('input', validateInputs);

    // Custom tooltip logic
    generateVideoBtn.addEventListener('mouseenter', () => {
        if (generateVideoBtn.disabled) {
            tooltip.style.display = 'block';
            // Position the tooltip (optional, can be done with CSS positioning relative to button)
            // For simplicity, let's assume CSS handles positioning relative to the button or its parent.
            // If not, you'd calculate position here:
            // const rect = generateVideoBtn.getBoundingClientRect();
            // tooltip.style.left = `${rect.left + rect.width / 2}px`;
            // tooltip.style.top = `${rect.top - tooltip.offsetHeight - 5}px`; // Above the button
        }
    });

    generateVideoBtn.addEventListener('mouseleave', () => {
        tooltip.style.display = 'none';
    });


    generateVideoBtn.addEventListener('click', async () => {
        const prompt = textInput.value.trim(); // Renamed to prompt
        const ratio = ratioSelect.value;
        const seconds = parseInt(durationSelect.value); // Parse duration to seconds
        const model = modelSelect.value;
        const numbers = parseInt(quantitySelect.value); // Parse quantity to numbers
        const token = tokenInput.value.trim();

        // Get user_id from localStorage
        const userId = localStorage.getItem('user_id');
        if (!userId) {
            showMessage('用户ID未找到，请先登录。', 'error');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
            return;
        }

        if (!prompt || !ratio || isNaN(seconds) || !model || isNaN(numbers) || !token) {
            showMessage('请检查所有的必填项是否填写完整。', 'error');
            return;
        }

        showMessage('Initiating video generation...', 'info');
        generateVideoBtn.disabled = true; // Disable button during generation
        tooltip.style.display = 'none'; // Hide tooltip if it was visible

        try {
            const requestBody = {
                prompt: prompt,
                image_url: "", // As per user's example
                ratio: ratio,
                numbers: numbers,
                model: model,
                seconds: seconds
            };

            const response = await fetch(`http://8.219.81.159:8090/api/v1/generate-video?user_id=${userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Add Authorization header
                },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();

            if (response.ok && data.status === 200) { // Assuming similar success structure as login API
                showMessage(`任务提交成功！任务ID: ${data.data.job_id || '未知'}`, 'success'); // Use data.data.job_id
                // Redirect to task management page after successful submission
                setTimeout(() => {
                    window.location.href = 'task-management.html';
                }, 1000); // Redirect after 1 second
            } else {
                showMessage(`错误: ${data.message || data.error || '视频生成失败。'}`, 'error'); // Use data.message or data.error
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage('网络错误或视频生成失败。', 'error');
        } finally {
            validateInputs(); // Re-validate to enable/disable button based on current inputs
        }
    });
});
