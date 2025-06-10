// Define showMessage globally or at a higher scope
function showMessage(msg, type = 'info') {
    const messageDiv = document.getElementById('message');
    if (messageDiv) {
        messageDiv.textContent = msg;
        messageDiv.className = `message show ${type}`;
        setTimeout(() => {
            messageDiv.classList.remove('show');
        }, 5000); // Keep consistent with script.js message duration
    } else {
        console.warn('Message div not found in task-management.html');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const welcomeMessage = document.getElementById('welcome-message');
    const taskTable = document.getElementById('task-table');
    const taskTableBody = taskTable.querySelector('tbody');
    const newTaskButton = document.getElementById('new-task-button');

    let tasks = []; // Tasks will be fetched from the backend

    async function fetchTasks() {
        const userId = localStorage.getItem('user_id'); // Retrieve user_id from localStorage
        if (!userId) {
            console.error('User ID not found in localStorage. Redirecting to login.');
            showMessage('用户ID未找到，请先登录。', 'error'); // Use showMessage here
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
            return;
        }

        try {
            const response = await fetch(`http://8.219.81.159:8090/api/v1/tasks?user_id=${userId}`); // Include user_id as query parameter
            if (response.ok) {
                const responseData = await response.json();
                if (responseData.status === 200 && Array.isArray(responseData.data)) {
                    tasks = responseData.data; // Assign the array from data.data
                    renderTasks();
                } else {
                    console.error('Failed to fetch tasks: Invalid data format or status not 200', responseData);
                    showMessage('获取任务失败：数据格式无效或状态不为200。', 'error'); // Use showMessage here
                    welcomeMessage.style.display = 'block';
                    taskTable.style.display = 'none';
                }
            } else {
                console.error('Failed to fetch tasks:', response.statusText);
                showMessage(`获取任务失败：${response.statusText}。`, 'error'); // Use showMessage here
                welcomeMessage.style.display = 'block';
                taskTable.style.display = 'none';
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
            showMessage('网络错误，获取任务失败。', 'error'); // Use showMessage here
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
                row.insertCell(0).textContent = task.job_id; // 任务ID
                row.insertCell(1).textContent = task.prompt || 'N/A'; // 提示词
                row.insertCell(2).textContent = task.model || 'N/A'; // 模型
                row.insertCell(3).textContent = task.ratio || 'N/A'; // 视频比例
                row.insertCell(4).textContent = task.video_nums || 'N/A'; // 数量
                
                // Map job_status to display text
                let displayStatus = task.job_status;
                switch (task.job_status) {
                    case 'queued':
                        displayStatus = '排队中';
                        break;
                    case 'finished':
                        displayStatus = '已完成';
                        break;
                    case 'failed':
                        displayStatus = '失败';
                        break;
                    // Add other cases if more statuses are introduced
                }
                row.insertCell(5).textContent = displayStatus; // 任务状态

                const actionsCell = row.insertCell(6); // Actions cell is the 7th column

                if (task.job_status === 'finished') {
                    const downloadButton = document.createElement('button');
                    downloadButton.textContent = '下载';
                    downloadButton.onclick = () => downloadTask(task.job_id);
                    actionsCell.appendChild(downloadButton);
                } else if (task.job_status === 'failed') {
                    const viewDetailsButton = document.createElement('button');
                    viewDetailsButton.textContent = '查看详情'; // Keep "查看详情" as it's useful
                    viewDetailsButton.onclick = () => viewTaskDetails(task.job_id);
                    actionsCell.appendChild(viewDetailsButton);

                    const retryButton = document.createElement('button');
                    retryButton.textContent = '重试';
                    retryButton.onclick = () => retryTask(task.job_id);
                    actionsCell.appendChild(retryButton);
                } else { // For any other status (e.g., 'queued', 'processing', etc.)
                    const queryButton = document.createElement('button');
                    queryButton.textContent = '查询';
                    queryButton.onclick = () => queryTaskStatus(task.job_id);
                    actionsCell.appendChild(queryButton);
                }

                // Add delete button for all tasks
                const deleteButton = document.createElement('button');
                deleteButton.textContent = '删除';
                deleteButton.style.marginLeft = '5px'; // Add some spacing
                deleteButton.onclick = () => deleteTask(task.job_id);
                actionsCell.appendChild(deleteButton);
            });
        }
    }

    async function queryTaskStatus(taskId) {
        console.log(`查询任务状态: ${taskId}`);
        const userId = localStorage.getItem('user_id');
        if (!userId) {
            console.error('User ID not found in localStorage. Cannot query task status.');
            showMessage('用户ID未找到，无法查询任务状态。', 'error');
            return;
        }

        try {
            // Assuming query API is GET with user_id, similar to retry API
            const response = await fetch(`http://8.219.81.159:8090/api/v1/tasks/${taskId}/query?user_id=${userId}`, {
                method: 'GET', // Assuming GET method
                headers: {
                    'accept': 'application/json'
                }
            });
            const data = await response.json();

            if (response.ok && data.status === 200) {
                showMessage(`任务 ${taskId} 状态更新: ${data.message}`, 'success');
                await fetchTasks(); // Re-fetch and re-render all tasks
            } else {
                showMessage(`查询任务 ${taskId} 失败: ${data.message || data.error || response.statusText}`, 'error');
                console.error(`Failed to query task ${taskId}:`, data.message || data.error || response.statusText);
            }
        } catch (error) {
            console.error(`Error querying task ${taskId}:`, error);
            showMessage('网络错误，查询任务状态失败。', 'error');
        }
    }

    async function downloadTask(taskId) {
        console.log(`下载任务: ${taskId}`);
        const userId = localStorage.getItem('user_id');
        if (!userId) {
            console.error('User ID not found in localStorage. Cannot download task.');
            showMessage('用户ID未找到，无法下载任务。', 'error');
            return;
        }

        try {
            const response = await fetch(`http://8.219.81.159:8090/api/v1/tasks/${taskId}/download?user_id=${userId}`, {
                method: 'GET',
                headers: {
                    'accept': 'application/json'
                }
            });
            if (response.ok) {
                const data = await response.json();
                if (data.status === 200 && data.data && data.data.download_url) {
                    alert(`下载任务 ${taskId}: ${data.data.download_url}`);
                    window.open(data.data.download_url, '_blank');
                } else {
                    alert(`无法下载任务 ${taskId}：${data.message || data.error || '无效的下载链接。'}`);
                    console.error(`Failed to download task ${taskId}:`, data.message || data.error || 'Invalid download URL.');
                }
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
        const userId = localStorage.getItem('user_id');
        if (!userId) {
            console.error('User ID not found in localStorage. Cannot retry task.');
            showMessage('用户ID未找到，无法重试任务。', 'error');
            return;
        }

        // Find the task row and update its status to a progress bar
        const rows = taskTableBody.querySelectorAll('tr');
        let taskRow = null;
        for (const row of rows) {
            if (row.cells[0].textContent === taskId) { // Assuming job_id is in the first cell
                taskRow = row;
                break;
            }
        }

        if (taskRow) {
            const statusCell = taskRow.cells[5]; // 任务状态 is the 6th cell (index 5)
            statusCell.innerHTML = `
                <div style="width: 100%; background-color: #f3f3f3; border-radius: 5px;">
                    <div style="width: 100%; height: 20px; background-color: #4CAF50; text-align: center; color: white; line-height: 20px; border-radius: 5px;">处理中...</div>
                </div>
            `;
            // Optionally disable the retry button to prevent multiple clicks
            const retryButton = statusCell.nextElementSibling.querySelector('button:last-child'); // Assuming retry button is the last one in actions cell
            if (retryButton && retryButton.textContent === '重试') {
                retryButton.disabled = true;
            }
        }

        try {
            const response = await fetch(`http://8.219.81.159:8090/api/v1/tasks/${taskId}/retry?user_id=${userId}`, {
                method: 'GET',
                headers: {
                    'accept': 'application/json'
                }
            });
            const data = await response.json();

            if (response.ok && data.status === 200) {
                showMessage(`任务 ${taskId} 已重试: ${data.message}`, 'success');
            } else {
                showMessage(`重试任务 ${taskId} 失败: ${data.message || data.error || response.statusText}`, 'error');
                console.error(`Failed to retry task ${taskId}:`, data.message || data.error || response.statusText);
            }
        } catch (error) {
            console.error(`Error retrying task ${taskId}:`, error);
            showMessage('网络错误，重试任务失败。', 'error');
        } finally {
            // Always refresh the page after 3 seconds, regardless of API call success/failure
            setTimeout(() => {
                location.reload();
            }, 3000);
        }
    }

    async function deleteTask(taskId) {
        console.log(`删除任务: ${taskId}`);
        if (!confirm(`确定要删除任务 ${taskId} 吗？`)) {
            return; // User cancelled the deletion
        }

        const userId = localStorage.getItem('user_id');
        if (!userId) {
            console.error('User ID not found in localStorage. Cannot delete task.');
            showMessage('用户ID未找到，无法删除任务。', 'error');
            return;
        }

        try {
            const response = await fetch(`http://8.219.81.159:8090/api/v1/tasks/${taskId}?user_id=${userId}`, {
                method: 'DELETE',
                headers: {
                    'accept': 'application/json'
                }
            });
            const data = await response.json();

            if (response.ok && data.status === 200) {
                showMessage(`任务 ${taskId} 已删除: ${data.message}`, 'success');
            } else {
                showMessage(`删除任务 ${taskId} 失败: ${data.message || data.error || response.statusText}`, 'error');
                console.error(`Failed to delete task ${taskId}:`, data.message || data.error || response.statusText);
            }
        } catch (error) {
            console.error(`Error deleting task ${taskId}:`, error);
            showMessage('网络错误，删除任务失败。', 'error');
        } finally {
            // Always refresh the page after deletion attempt
            location.reload();
        }
    }

    newTaskButton.addEventListener('click', () => {
        window.location.href = 'index.html'; // Navigate to video generation page
    });

    // Initial fetch and render
    fetchTasks();
});
