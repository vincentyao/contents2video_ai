document.addEventListener('DOMContentLoaded', () => {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('loginBtn');
    const messageDiv = document.getElementById('message');

    function showMessage(msg, type = 'info') {
        messageDiv.textContent = msg;
        messageDiv.className = `message show ${type}`;
        setTimeout(() => {
            messageDiv.classList.remove('show');
        }, 3000);
    }

    loginBtn.addEventListener('click', async () => {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        try {
            const response = await fetch('http://8.219.81.159:8090/api/v1/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok && data.status === 200) {
                const userId = data.data.user_id; // Extract user_id
                localStorage.setItem('user_id', userId); // Save user_id to localStorage
                showMessage('登录成功！', 'success');
                setTimeout(() => {
                    window.location.href = 'task-management.html';
                }, 1000);
            } else {
                showMessage(data.error || '用户名或密码错误。', 'error');
            }
        } catch (error) {
            console.error('登录请求失败:', error);
            showMessage('网络错误，请稍后再试。', 'error');
        }
    });
});
