// Admin Dashboard JavaScript for Seva

let allIssues = [];
let socket;

document.addEventListener('DOMContentLoaded', function() {
    initializeSocket();
    loadIssues();
    loadStats();
});

// Initialize Socket.IO for real-time updates
function initializeSocket() {
    socket = io();
    
    socket.on('newIssue', function(issue) {
        console.log('New issue received:', issue);
        allIssues.unshift(issue); // Add to beginning of array
        displayIssues(allIssues);
        loadStats(); // Refresh stats
        showNotification('New issue reported: ' + issue.issueId);
    });
    
    socket.on('statusUpdate', function(data) {
        console.log('Status update received:', data);
        const issueIndex = allIssues.findIndex(issue => issue.issueId === data.issueId);
        if (issueIndex !== -1) {
            allIssues[issueIndex].status = data.status;
            allIssues[issueIndex].updatedAt = new Date().toISOString();
            displayIssues(allIssues);
            loadStats(); // Refresh stats
        }
    });
}

// Load all issues
async function loadIssues() {
    try {
        document.getElementById('loading-indicator').style.display = 'block';
        document.getElementById('desktop-view').style.display = 'none';
        document.getElementById('mobile-view').style.display = 'none';
        
        const response = await fetch('/api/issues');
        allIssues = await response.json();
        
        displayIssues(allIssues);
    } catch (error) {
        console.error('Error loading issues:', error);
        showNotification('Error loading issues', 'error');
    } finally {
        document.getElementById('loading-indicator').style.display = 'none';
    }
}

// Load statistics
async function loadStats() {
    try {
        const response = await fetch('/api/stats');
        const stats = await response.json();
        
        document.getElementById('admin-total-issues').textContent = stats.total || 0;
        document.getElementById('admin-pending-issues').textContent = stats.pending || 0;
        document.getElementById('admin-progress-issues').textContent = stats.inProgress || 0;
        document.getElementById('admin-resolved-issues').textContent = stats.resolved || 0;
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Display issues in both desktop and mobile views
function displayIssues(issues) {
    const tableBody = document.getElementById('issues-table-body');
    const mobileView = document.getElementById('mobile-view');
    
    // Clear existing content
    tableBody.innerHTML = '';
    mobileView.innerHTML = '';
    
    if (issues.length === 0) {
        const noDataMessage = '<div style="text-align: center; padding: 2rem; color: #7f8c8d;">No issues found</div>';
        tableBody.innerHTML = `<tr><td colspan="7">${noDataMessage}</td></tr>`;
        mobileView.innerHTML = noDataMessage;
    } else {
        issues.forEach(issue => {
            // Desktop table row
            const row = createTableRow(issue);
            tableBody.appendChild(row);
            
            // Mobile card
            const card = createMobileCard(issue);
            mobileView.appendChild(card);
        });
    }
    
    // Show appropriate view
    document.getElementById('desktop-view').style.display = 'block';
    document.getElementById('mobile-view').style.display = 'block';
}

// Create table row for desktop view
function createTableRow(issue) {
    const row = document.createElement('tr');
    const createdDate = new Date(issue.createdAt).toLocaleDateString('en-IN');
    
    let statusClass = 'status-pending';
    let statusIcon = '⏳';
    if (issue.status === 'In Progress') {
        statusClass = 'status-progress';
        statusIcon = '🔄';
    } else if (issue.status === 'Resolved') {
        statusClass = 'status-resolved';
        statusIcon = '✅';
    }
    
    row.innerHTML = `
        <td><strong>${issue.issueId}</strong></td>
        <td>${issue.name}</td>
        <td>${issue.village}</td>
        <td>${issue.category}</td>
        <td><span class="status-badge ${statusClass}">${statusIcon} ${issue.status}</span></td>
        <td>${createdDate}</td>
        <td>
            <button onclick="viewIssue('${issue.issueId}')" class="btn" style="font-size: 0.8rem; padding: 6px 12px;">View</button>
        </td>
    `;
    
    return row;
}

// Create mobile card
function createMobileCard(issue) {
    const card = document.createElement('div');
    card.className = 'issue-card';
    
    const createdDate = new Date(issue.createdAt).toLocaleDateString('en-IN');
    
    let statusClass = 'status-pending';
    let statusIcon = '⏳';
    if (issue.status === 'In Progress') {
        statusClass = 'status-progress';
        statusIcon = '🔄';
    } else if (issue.status === 'Resolved') {
        statusClass = 'status-resolved';
        statusIcon = '✅';
    }
    
    card.innerHTML = `
        <div class="issue-header">
            <div class="issue-id">${issue.issueId}</div>
            <div class="status-badge ${statusClass}">${statusIcon} ${issue.status}</div>
        </div>
        <div class="issue-meta">
            <strong>${issue.name}</strong> from <strong>${issue.village}</strong><br>
            <span style="color: #7f8c8d;">${issue.category} • ${createdDate}</span>
        </div>
        <div class="issue-description">
            ${issue.description.length > 100 ? issue.description.substring(0, 100) + '...' : issue.description}
        </div>
        <div class="issue-actions">
            <button onclick="viewIssue('${issue.issueId}')" class="btn">View Details</button>
        </div>
    `;
    
    return card;
}

// Filter issues based on selected criteria
function filterIssues() {
    const statusFilter = document.getElementById('statusFilter').value;
    const categoryFilter = document.getElementById('categoryFilter').value;
    const villageFilter = document.getElementById('villageFilter').value.toLowerCase();
    
    let filteredIssues = allIssues.filter(issue => {
        const matchesStatus = !statusFilter || issue.status === statusFilter;
        const matchesCategory = !categoryFilter || issue.category === categoryFilter;
        const matchesVillage = !villageFilter || issue.village.toLowerCase().includes(villageFilter);
        
        return matchesStatus && matchesCategory && matchesVillage;
    });
    
    displayIssues(filteredIssues);
}

// View issue details in modal
async function viewIssue(issueId) {
    try {
        const response = await fetch(`/api/issues/${issueId}`);
        const issue = await response.json();
        
        if (response.ok) {
            showIssueModal(issue);
        } else {
            showNotification('Error loading issue details', 'error');
        }
    } catch (error) {
        showNotification('Network error', 'error');
    }
}

// Show issue modal with details
function showIssueModal(issue) {
    const modal = document.getElementById('issue-modal');
    const modalContent = document.getElementById('modal-content');
    
    const createdDate = new Date(issue.createdAt).toLocaleString('en-IN');
    const updatedDate = new Date(issue.updatedAt).toLocaleString('en-IN');
    
    let statusClass = 'status-pending';
    let statusIcon = '⏳';
    if (issue.status === 'In Progress') {
        statusClass = 'status-progress';
        statusIcon = '🔄';
    } else if (issue.status === 'Resolved') {
        statusClass = 'status-resolved';
        statusIcon = '✅';
    }
    
    const photoHtml = issue.photoUrl ? 
        `<div style="margin: 1rem 0;">
            <strong>Photo:</strong><br>
            <img src="${issue.photoUrl}" alt="Issue photo" style="max-width: 100%; max-height: 300px; border-radius: 10px; margin-top: 0.5rem;">
        </div>` : '';
    
    const locationHtml = issue.location && issue.location.address ? 
        `<p><strong>Location:</strong> ${issue.location.address}</p>` : '';
    
    modalContent.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <h3>${issue.issueId}</h3>
            <span class="status-badge ${statusClass}">${statusIcon} ${issue.status}</span>
        </div>
        
        <div style="margin-bottom: 1.5rem;">
            <p><strong>Reporter:</strong> ${issue.name}</p>
            <p><strong>Village:</strong> ${issue.village}</p>
            <p><strong>Category:</strong> ${issue.category}</p>
            ${locationHtml}
            <p><strong>Reported:</strong> ${createdDate}</p>
            <p><strong>Last Updated:</strong> ${updatedDate}</p>
        </div>
        
        <div style="margin-bottom: 1.5rem;">
            <strong>Description:</strong><br>
            <div style="background: #f8f9fa; padding: 1rem; border-radius: 10px; margin-top: 0.5rem;">
                ${issue.description}
            </div>
        </div>
        
        ${photoHtml}
        
        <div style="margin-top: 2rem;">
            <strong>Update Status:</strong><br>
            <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem; flex-wrap: wrap;">
                <button onclick="updateStatus('${issue.issueId}', 'Pending')" class="btn ${issue.status === 'Pending' ? 'btn-primary' : ''}">⏳ Pending</button>
                <button onclick="updateStatus('${issue.issueId}', 'In Progress')" class="btn ${issue.status === 'In Progress' ? 'btn-warning' : ''}">🔄 In Progress</button>
                <button onclick="updateStatus('${issue.issueId}', 'Resolved')" class="btn ${issue.status === 'Resolved' ? 'btn-success' : ''}">✅ Resolved</button>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

// Close modal
function closeModal() {
    document.getElementById('issue-modal').style.display = 'none';
}

// Update issue status
async function updateStatus(issueId, newStatus) {
    try {
        const response = await fetch(`/api/issues/${issueId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });
        
        if (response.ok) {
            showNotification(`Status updated to ${newStatus}`, 'success');
            closeModal();
            loadIssues(); // Refresh the list
        } else {
            showNotification('Error updating status', 'error');
        }
    } catch (error) {
        showNotification('Network error', 'error');
    }
}

// Refresh data
function refreshData() {
    loadIssues();
    loadStats();
    showNotification('Data refreshed', 'success');
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        max-width: 300px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        transition: all 0.3s ease;
    `;
    
    // Set background color based on type
    if (type === 'success') {
        notification.style.background = 'linear-gradient(45deg, #27ae60, #229954)';
    } else if (type === 'error') {
        notification.style.background = 'linear-gradient(45deg, #e74c3c, #c0392b)';
    } else {
        notification.style.background = 'linear-gradient(45deg, #3498db, #2980b9)';
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    const modal = document.getElementById('issue-modal');
    if (e.target === modal) {
        closeModal();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
    if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
        e.preventDefault();
        refreshData();
    }
});
