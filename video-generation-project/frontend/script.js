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
        const text = textInput.value.trim();
        const ratio = ratioSelect.value;
        const duration = durationSelect.value;
        const model = modelSelect.value;
        const quantity = quantitySelect.value;
        const token = tokenInput.value.trim();

        if (!text || !ratio || !duration || !model || !quantity || !token) {
            showMessage('请检查所有的必填项是否填写完整。', 'error');
            return;
        }

        showMessage('Initiating video generation...', 'info');
        generateVideoBtn.disabled = true; // Disable button during generation
        tooltip.style.display = 'none'; // Hide tooltip if it was visible

        try {
            const response = await fetch('/api/generate-video', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text, ratio, duration, model, quantity, token })
            });
            const data = await response.json();

            if (response.ok) {
                showMessage(`任务提交成功！任务ID: ${data.taskId}`, 'success');
                // Redirect to task management page after successful submission
                setTimeout(() => {
                    window.location.href = 'task-management.html';
                }, 1000); // Redirect after 1 second
            } else {
                showMessage(`错误: ${data.error || '视频生成失败。'}`, 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage('Failed to connect to backend or generate video.', 'error');
        } finally {
            validateInputs(); // Re-validate to enable/disable button based on current inputs
        }
    });
});
