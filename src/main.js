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
        // Check if the button text matches the activity text
        // For feelings with reasons, we check if the button text is the base feeling
        if (activity.startsWith(btn.textContent)) {
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

let selectedFeeling = null;

// Feeling check-in (opens modal)
function feelingCheckIn(feeling) {
    selectedFeeling = feeling;
    const modal = document.getElementById('modalOverlay');
    const title = document.getElementById('modalTitle');
    const input = document.getElementById('feelingReason');
    
    title.textContent = `Como você está se sentindo? (${feeling})`;
    input.value = '';
    modal.classList.add('show');
    
    // Focus input after small delay for mobile
    setTimeout(() => input.focus(), 100);
}

// Close feeling modal
function closeModal() {
    const modal = document.getElementById('modalOverlay');
    modal.classList.remove('show');
    selectedFeeling = null;
}

// Submit feeling from modal
function submitFeeling() {
    const input = document.getElementById('feelingReason');
    const reason = input.value.trim();
    let activity = selectedFeeling;
    
    if (reason) {
        activity = `${selectedFeeling} - ${reason}`;
    }
    
    quickCheckIn(activity);
    closeModal();
}

// Quick check-in with preset activity
function quickCheckIn(activity) {
    // If it's "Woke Up", clear yesterday's tracking
    if (activity.startsWith('🛏️ Acordei')) {
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
    showToast('Registrado!');
}

function clearHistory() {
    if (confirm('Apagar tudo?')) {
        localStorage.removeItem('checkIns');
        renderHistory();
        showToast('Histórico limpo');
    }
}

// Format date
function formatDate(date) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const dateStr = date.toDateString();
    
    if (dateStr === today.toDateString()) {
        return 'Hoje';
    } else if (dateStr === yesterday.toDateString()) {
        return 'Ontem';
    } else {
        return date.toLocaleDateString('pt-BR', { 
            weekday: 'long', 
            month: 'short', 
            day: 'numeric' 
        });
    }
}

// Format time
function formatTime(date) {
    return date.toLocaleTimeString('pt-BR', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: false 
    });
}

// Render history
function renderHistory() {
    const checkIns = loadCheckIns();
    const historyList = document.getElementById('historyList');
    
    // Filter last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentCheckIns = checkIns.filter(checkIn => {
        return new Date(checkIn.timestamp) >= thirtyDaysAgo;
    });

    if (recentCheckIns.length === 0) {
        historyList.innerHTML = '<div class="empty-state">Nada ainda. Toque num botão acima pra começar!</div>';
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
        
        dayCheckIns.forEach((checkIn, index) => {
            const checkInDate = new Date(checkIn.timestamp);
            const checkInId = `${checkIn.timestamp}-${index}`;
            html += `
                <div class="checkin-item-wrapper" data-timestamp="${checkIn.timestamp}" data-index="${index}">
                    <div class="checkin-item">
                        <div class="checkin-time">${formatTime(checkInDate)}</div>
                        <div class="checkin-activity">${checkIn.activity}</div>
                    </div>
                    <button class="delete-btn" onclick="deleteCheckIn('${checkIn.timestamp}', ${index})">
                        <span>🗑️</span>
                    </button>
                </div>
            `;
        });
        
        html += `</div>`;
    });

    historyList.innerHTML = html;
    
    // Initialize swipe for all check-in items
    initSwipeGestures();
}

// Update current date
function updateCurrentDate() {
    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-BR', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
    });
    document.getElementById('currentDate').textContent = dateStr;
}

// Delete check-in state
let pendingDelete = null;

// Delete check-in
function deleteCheckIn(timestamp, index) {
    pendingDelete = { timestamp, index };
    const modal = document.getElementById('deleteModalOverlay');
    modal.classList.add('show');
}

// Close delete modal
function closeDeleteModal() {
    const modal = document.getElementById('deleteModalOverlay');
    modal.classList.remove('show');
    pendingDelete = null;
}

// Confirm delete
function confirmDelete() {
    if (!pendingDelete) return;
    
    const checkIns = loadCheckIns();
    const filteredCheckIns = checkIns.filter((checkIn, idx) => {
        return !(checkIn.timestamp === pendingDelete.timestamp && idx === pendingDelete.index);
    });
    
    saveCheckIns(filteredCheckIns);
    closeDeleteModal();
    renderHistory();
    showToast('Check-in apagado');
}

// Initialize swipe gestures for all check-in items
function initSwipeGestures() {
    const wrappers = document.querySelectorAll('.checkin-item-wrapper');
    
    wrappers.forEach(wrapper => {
        let startX = 0;
        let currentX = 0;
        let isSwiping = false;
        const item = wrapper.querySelector('.checkin-item');
        const deleteBtn = wrapper.querySelector('.delete-btn');
        
        wrapper.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            currentX = startX;
            isSwiping = true;
        }, { passive: true });
        
        wrapper.addEventListener('touchmove', (e) => {
            if (!isSwiping) return;
            
            currentX = e.touches[0].clientX;
            const diffX = currentX - startX;
            
            // Only allow left swipe (negative diff)
            if (diffX < 0) {
                const translateX = Math.max(diffX, -80);
                item.style.transform = `translateX(${translateX}px)`;
                item.style.transition = 'none';
            }
        }, { passive: true });
        
        wrapper.addEventListener('touchend', (e) => {
            if (!isSwiping) return;
            isSwiping = false;
            
            const diffX = currentX - startX;
            
            // If swiped more than 40px left, show delete button
            if (diffX < -40) {
                item.style.transform = 'translateX(-80px)';
                item.style.transition = 'transform 0.3s ease';
                deleteBtn.style.opacity = '1';
                deleteBtn.style.visibility = 'visible';
            } else {
                // Swipe back to normal
                item.style.transform = 'translateX(0)';
                item.style.transition = 'transform 0.3s ease';
                deleteBtn.style.opacity = '0';
                deleteBtn.style.visibility = 'hidden';
            }
        });
        
        // Click outside to close
        document.addEventListener('click', (e) => {
            if (!wrapper.contains(e.target)) {
                item.style.transform = 'translateX(0)';
                item.style.transition = 'transform 0.3s ease';
                deleteBtn.style.opacity = '0';
                deleteBtn.style.visibility = 'hidden';
            }
        });
    });
}

// Make functions globally accessible for inline onclick handlers
window.quickCheckIn = quickCheckIn;
window.customCheckIn = customCheckIn;
window.clearHistory = clearHistory;
window.feelingCheckIn = feelingCheckIn;
window.closeModal = closeModal;
window.submitFeeling = submitFeeling;
window.deleteCheckIn = deleteCheckIn;
window.closeDeleteModal = closeDeleteModal;
window.confirmDelete = confirmDelete;

// Allow Enter key for custom check-in
document.getElementById('customActivity').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        customCheckIn();
    }
});

// Allow Enter key for feeling reason
document.getElementById('feelingReason').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        submitFeeling();
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