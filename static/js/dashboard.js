// Dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    // Auto-refresh stats every 30 seconds
    setInterval(refreshStats, 30000);
    
    // Initialize dashboard
    initializeDashboard();
});

function initializeDashboard() {
    // Load real-time stats
    refreshStats();
    
    // Setup event listeners
    setupEventListeners();
}

function refreshStats() {
    fetch('/api/stats')
        .then(response => response.json())
        .then(data => {
            updateStatsDisplay(data);
        })
        .catch(error => {
            console.error('Error refreshing stats:', error);
        });
}

function updateStatsDisplay(stats) {
    // Update stat cards with new data
    const statElements = {
        'total_extractions': document.querySelector('.stat-card.primary h3'),
        'success_rate': document.querySelector('.stat-card.success h3'),
        'companies_found': document.querySelector('.stat-card.info h3'),
        'products_found': document.querySelector('.stat-card.warning h3')
    };
    
    Object.keys(statElements).forEach(key => {
        if (statElements[key] && stats[key] !== undefined) {
            if (key === 'success_rate') {
                statElements[key].textContent = stats[key] + '%';
            } else {
                statElements[key].textContent = stats[key];
            }
        }
    });
}

function setupEventListeners() {
    // Add click handlers for action cards
    document.querySelectorAll('.action-card').forEach(card => {
        card.addEventListener('click', function(e) {
            // Add loading state
            this.style.opacity = '0.7';
            setTimeout(() => {
                this.style.opacity = '1';
            }, 200);
        });
    });
}