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

        if (username === 'admin' && password === 'admin') {
            showMessage('登录成功！', 'success');
            // Simulate a slight delay before redirecting
            setTimeout(() => {
                window.location.href = 'task-management.html';
            }, 1000);
        } else {
            showMessage('用户名或密码错误。', 'error');
        }
    });
});
