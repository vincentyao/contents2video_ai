document.addEventListener('DOMContentLoaded', () => {
    const welcomeMessage = document.getElementById('welcome-message');
    const taskTable = document.getElementById('task-table');
    const taskTableBody = taskTable.querySelector('tbody');
    const newTaskButton = document.getElementById('new-task-button');

    let tasks = []; // Tasks will be fetched from the backend

    async function fetchTasks() {
        try {
            const response = await fetch('/api/tasks');
            if (response.ok) {
                tasks = await response.json();
                renderTasks();
            } else {
                console.error('Failed to fetch tasks:', response.statusText);
                // Fallback to showing welcome message if tasks cannot be fetched
                welcomeMessage.style.display = 'block';
                taskTable.style.display = 'none';
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
            welcomeMessage.style.display = 'block';
            taskTable.style.display = 'none';
        }
    }

    function renderTasks() {
        taskTableBody.innerHTML = ''; // Clear existing rows

        if (tasks.length === 0) {
            welcomeMessage.style.display = 'block';
            taskTable.style.display = 'none';
        } else {
            welcomeMessage.style.display = 'none';
            taskTable.style.display = 'table';
            tasks.forEach(task => {
                const row = taskTableBody.insertRow();
                row.insertCell(0).textContent = task.id;
                row.insertCell(1).textContent = task.text; // Text for Video
                row.insertCell(2).textContent = task.ratio; // 比例
                row.insertCell(3).textContent = task.model; // 模型选择
                row.insertCell(4).textContent = task.quantity; // 数量
                row.insertCell(5).textContent = task.status; // 任务状态

                const actionsCell = row.insertCell(6); // Actions cell is now the 7th column
                if (task.status === '排队中') {
                    const queryButton = document.createElement('button');
                    queryButton.textContent = '查询';
                    queryButton.onclick = () => queryTaskStatus(task.id);
                    actionsCell.appendChild(queryButton);
                } else if (task.status === '已完成') {
                    const downloadButton = document.createElement('button');
                    downloadButton.textContent = '下载';
                    downloadButton.onclick = () => downloadTask(task.id);
                    actionsCell.appendChild(downloadButton);
                } else if (task.status === '失败') {
                    const viewDetailsButton = document.createElement('button');
                    viewDetailsButton.textContent = '查看详情';
                    viewDetailsButton.onclick = () => viewTaskDetails(task.id);
                    actionsCell.appendChild(viewDetailsButton);

                    const retryButton = document.createElement('button');
                    retryButton.textContent = '重试';
                    retryButton.onclick = () => retryTask(task.id);
                    actionsCell.appendChild(retryButton);
                }
            });
        }
    }

    async function queryTaskStatus(taskId) {
        console.log(`查询任务状态: ${taskId}`);
        try {
            const response = await fetch(`/api/tasks/${taskId}/query`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            if (response.ok) {
                const data = await response.json();
                console.log(data.message);
                await fetchTasks(); // Re-fetch and re-render tasks
            } else {
                console.error(`Failed to query task ${taskId}:`, response.statusText);
            }
        } catch (error) {
            console.error(`Error querying task ${taskId}:`, error);
        }
    }

    async function downloadTask(taskId) {
        console.log(`下载任务: ${taskId}`);
        try {
            const response = await fetch(`/api/tasks/${taskId}/download`);
            if (response.ok) {
                const data = await response.json();
                alert(`下载任务 ${taskId}: ${data.downloadUrl}`);
                // In a real application, you would redirect or trigger a file download
            } else {
                console.error(`Failed to download task ${taskId}:`, response.statusText);
                alert(`无法下载任务 ${taskId}。`);
            }
        } catch (error) {
            console.error(`Error downloading task ${taskId}:`, error);
            alert(`下载任务 ${taskId} 失败。`);
        }
    }

    function viewTaskDetails(taskId) {
        console.log(`查看任务详情: ${taskId}`);
        alert(`查看任务 ${taskId} 详情`);
        // In a real application, this would show more details about the failed task
    }

    async function retryTask(taskId) {
        console.log(`重试任务: ${taskId}`);
        try {
            const response = await fetch(`/api/tasks/${taskId}/retry`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            if (response.ok) {
                const data = await response.json();
                console.log(data.message);
                await fetchTasks(); // Re-fetch and re-render tasks
            } else {
                console.error(`Failed to retry task ${taskId}:`, response.statusText);
            }
        } catch (error) {
            console.error(`Error retrying task ${taskId}:`, error);
        }
    }

    newTaskButton.addEventListener('click', () => {
        window.location.href = 'index.html'; // Navigate to video generation page
    });

    // Initial fetch and render
    fetchTasks();
});
