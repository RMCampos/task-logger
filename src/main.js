// Load check-ins from localStorage
function loadCheckIns() {
    const stored = localStorage.getItem('checkIns');
    return stored ? JSON.parse(stored) : [];
}

// Save check-ins to localStorage
function saveCheckIns(checkIns) {
    localStorage.setItem('checkIns', JSON.stringify(checkIns));
}

// Load clicked buttons for today
function loadClickedButtons() {
    const stored = localStorage.getItem('clickedButtonsToday');
    if (!stored) {
        return { date: getTodayDateString(), clicked: [] };
    }

    const data = JSON.parse(stored);
    const today = getTodayDateString();

    // If the stored data is from a previous day, reset it
    if (data.date !== today) {
        return { date: today, clicked: [] };
    }

    return data;
}

// Save clicked buttons to localStorage
function saveClickedButtons(clickedData) {
    localStorage.setItem('clickedButtonsToday', JSON.stringify(clickedData));
}

// Get today's date as a string (YYYY-MM-DD)
function getTodayDateString() {
    const now = new Date();
    return now.toISOString().split('T')[0];
}

// Clear clicked buttons tracking (called when "Woke Up" is clicked)
function clearClickedButtons() {
    const emptyData = { date: getTodayDateString(), clicked: [] };
    saveClickedButtons(emptyData);
}

// Mark a button as clicked (grayed out)
function markButtonAsClicked(activity) {
    const buttons = document.querySelectorAll('.activity-btn');
    buttons.forEach(btn => {
        // Check if the button text contains the activity text
        if (btn.textContent === activity) {
            btn.classList.add('clicked');
        }
    });
}

// Restore grayed out states for buttons clicked today
function restoreClickedStates() {
    const clickedData = loadClickedButtons();
    clickedData.clicked.forEach(activity => {
        markButtonAsClicked(activity);
    });
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
    // If it's "Woke Up", clear yesterday's tracking
    if (activity === '🛏️ Woke Up') {
        clearClickedButtons();
        // Update all buttons to remove grayed state
        document.querySelectorAll('.activity-btn').forEach(btn => {
            btn.classList.remove('clicked');
        });
    }

    // Save the check-in
    const checkIns = loadCheckIns();
    checkIns.push({
        activity: activity,
        timestamp: new Date().toISOString()
    });
    saveCheckIns(checkIns);

    // Track that this button was clicked today
    const clickedData = loadClickedButtons();
    if (!clickedData.clicked.includes(activity)) {
        clickedData.clicked.push(activity);
        saveClickedButtons(clickedData);
    }

    // Gray out the button that was clicked
    markButtonAsClicked(activity);

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

// Make functions globally accessible for inline onclick handlers
window.quickCheckIn = quickCheckIn;
window.customCheckIn = customCheckIn;
window.clearHistory = clearHistory;

// Allow Enter key for custom check-in
document.getElementById('customActivity').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        customCheckIn();
    }
});

// Initialize
updateCurrentDate();
renderHistory();
restoreClickedStates();

// PWA Update handling
if ('serviceWorker' in navigator) {
    let updateAvailable = false;

    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js', { scope: '/' }).then(registration => {
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;

                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // New service worker installed, show update notification
                        updateAvailable = true;
                        showUpdateNotification();
                    }
                });
            });
        });
    });

    function showUpdateNotification() {
        const notification = document.getElementById('updateNotification');
        const updateBtn = document.getElementById('updateBtn');
        const dismissBtn = document.getElementById('dismissBtn');

        notification.classList.add('show');

        updateBtn.addEventListener('click', () => {
            window.location.reload();
        });

        dismissBtn.addEventListener('click', () => {
            notification.classList.remove('show');
        });
    }
}