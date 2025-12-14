// Load check-ins from localStorage
function loadCheckIns() {
    const stored = localStorage.getItem('checkIns');
    return stored ? JSON.parse(stored) : [];
}

// Save check-ins to localStorage
function saveCheckIns(checkIns) {
    localStorage.setItem('checkIns', JSON.stringify(checkIns));
}

// Show toast notification
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

// Quick check-in with preset activity
function quickCheckIn(activity) {
    const checkIns = loadCheckIns();
    checkIns.push({
        activity: activity,
        timestamp: new Date().toISOString()
    });
    saveCheckIns(checkIns);
    renderHistory();
    showToast('Checked in!');
}

// Custom check-in
function customCheckIn() {
    const input = document.getElementById('customActivity');
    const activity = input.value.trim();
    
    if (!activity) {
        return;
    }

    const checkIns = loadCheckIns();
    checkIns.push({
        activity: activity,
        timestamp: new Date().toISOString()
    });
    saveCheckIns(checkIns);
    input.value = '';
    renderHistory();
    showToast('Checked in!');
}

// Clear all history
function clearHistory() {
    if (confirm('Delete all check-ins?')) {
        localStorage.removeItem('checkIns');
        renderHistory();
        showToast('History cleared');
    }
}

// Format date
function formatDate(date) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const dateStr = date.toDateString();
    
    if (dateStr === today.toDateString()) {
        return 'Today';
    } else if (dateStr === yesterday.toDateString()) {
        return 'Yesterday';
    } else {
        return date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'short', 
            day: 'numeric' 
        });
    }
}

// Format time
function formatTime(date) {
    return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
    });
}

// Render history
function renderHistory() {
    const checkIns = loadCheckIns();
    const historyList = document.getElementById('historyList');
    
    // Filter last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentCheckIns = checkIns.filter(checkIn => {
        return new Date(checkIn.timestamp) >= sevenDaysAgo;
    });

    if (recentCheckIns.length === 0) {
        historyList.innerHTML = '<div class="empty-state">No check-ins yet. Tap a button above to get started!</div>';
        return;
    }

    // Group by day
    const byDay = {};
    recentCheckIns.forEach(checkIn => {
        const date = new Date(checkIn.timestamp);
        const dayKey = date.toDateString();
        
        if (!byDay[dayKey]) {
            byDay[dayKey] = [];
        }
        byDay[dayKey].push(checkIn);
    });

    // Sort days (most recent first)
    const sortedDays = Object.keys(byDay).sort((a, b) => {
        return new Date(b) - new Date(a);
    });

    // Render
    let html = '';
    sortedDays.forEach(dayKey => {
        const date = new Date(dayKey);
        const dayCheckIns = byDay[dayKey];
        
        // Sort check-ins within day (most recent first)
        dayCheckIns.sort((a, b) => {
            return new Date(b.timestamp) - new Date(a.timestamp);
        });

        html += `<div class="day-section">`;
        html += `<div class="day-header">${formatDate(date)}</div>`;
        
        dayCheckIns.forEach(checkIn => {
            const checkInDate = new Date(checkIn.timestamp);
            html += `
                <div class="checkin-item">
                    <div class="checkin-time">${formatTime(checkInDate)}</div>
                    <div class="checkin-activity">${checkIn.activity}</div>
                </div>
            `;
        });
        
        html += `</div>`;
    });

    historyList.innerHTML = html;
}

// Update current date
function updateCurrentDate() {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
    });
    document.getElementById('currentDate').textContent = dateStr;
}

// Allow Enter key for custom check-in
document.getElementById('customActivity').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        customCheckIn();
    }
});

// Initialize
updateCurrentDate();
renderHistory();