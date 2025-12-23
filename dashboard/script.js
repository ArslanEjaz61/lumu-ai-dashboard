// ========================================
// LUMU AI Marketing Dashboard - JavaScript
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    initCharts();
    initAnimations();
    initInteractions();
});

// ========================================
// Charts Initialization
// ========================================
function initCharts() {
    // Chart.js defaults
    Chart.defaults.color = '#a0a0b8';
    Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';
    Chart.defaults.font.family = 'Inter';

    // Performance Chart
    const perfCtx = document.getElementById('performanceChart');
    if (perfCtx) {
        new Chart(perfCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [
                    {
                        label: 'Sales (₨M)',
                        data: [28, 32, 35, 38, 42, 45, 48, 46, 50, 52, 54, 58],
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointBackgroundColor: '#6366f1',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointHoverRadius: 6
                    },
                    {
                        label: 'Ad Spend (₨M)',
                        data: [8, 9, 10, 10.5, 11, 11.5, 12, 11.8, 12, 12.5, 13, 13.5],
                        borderColor: '#22c55e',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointBackgroundColor: '#22c55e',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointHoverRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: {
                        position: 'top',
                        align: 'end',
                        labels: {
                            usePointStyle: true,
                            pointStyle: 'circle',
                            padding: 20,
                            font: {
                                size: 12,
                                weight: 500
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(30, 30, 50, 0.95)',
                        titleColor: '#fff',
                        bodyColor: '#a0a0b8',
                        borderColor: 'rgba(99, 102, 241, 0.3)',
                        borderWidth: 1,
                        cornerRadius: 8,
                        padding: 12,
                        displayColors: true,
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ₨' + context.parsed.y + 'M';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                size: 11
                            }
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        },
                        ticks: {
                            font: {
                                size: 11
                            },
                            callback: function(value) {
                                return '₨' + value + 'M';
                            }
                        }
                    }
                }
            }
        });
    }

    // Sparkline Charts
    createSparkline('roasSparkline', [3.2, 3.5, 3.8, 3.6, 4.0, 4.2], '#667eea');
    createSparkline('salesSparkline', [38, 42, 45, 48, 50, 52], '#4facfe');
    createSparkline('spendSparkline', [11, 11.5, 12, 11.8, 12.2, 12.5], '#43e97b');
    createSparkline('customersSparkline', [32, 35, 38, 42, 44, 45], '#fa709a');
}

function createSparkline(canvasId, data, color) {
    const ctx = document.getElementById(canvasId);
    if (ctx) {
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map((_, i) => i),
                datasets: [{
                    data: data,
                    borderColor: color,
                    borderWidth: 2,
                    fill: true,
                    backgroundColor: hexToRgba(color, 0.2),
                    tension: 0.4,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                },
                scales: {
                    x: { display: false },
                    y: { display: false }
                }
            }
        });
    }
}

function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ========================================
// Animations
// ========================================
function initAnimations() {
    // Animate numbers
    const statValues = document.querySelectorAll('.stat-value');
    statValues.forEach(el => {
        animateValue(el);
    });

    // Progress bars animation
    const progressBars = document.querySelectorAll('.progress-bar, .bar-fill');
    progressBars.forEach(bar => {
        const width = bar.style.width || bar.style.getPropertyValue('--progress');
        bar.style.width = '0%';
        setTimeout(() => {
            bar.style.width = width;
        }, 500);
    });
}

function animateValue(element) {
    const text = element.textContent;
    const hasPrefix = text.includes('₨');
    const hasSuffix = text.includes('x') || text.includes('M') || text.includes('K');
    
    let value = parseFloat(text.replace(/[^0-9.]/g, ''));
    let suffix = text.match(/[xMK]/)?.[0] || '';
    let prefix = hasPrefix ? '₨' : '';
    
    let current = 0;
    const duration = 1500;
    const steps = 60;
    const increment = value / steps;
    const stepDuration = duration / steps;

    const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
            current = value;
            clearInterval(timer);
        }
        
        let displayValue = current;
        if (value < 10) {
            displayValue = current.toFixed(1);
        } else if (value < 100) {
            displayValue = current.toFixed(1);
        } else {
            displayValue = Math.round(current).toLocaleString();
        }
        
        element.textContent = prefix + displayValue + suffix;
    }, stepDuration);
}

// ========================================
// Interactions
// ========================================
function initInteractions() {
    // Sidebar toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }

    // Tab buttons
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            this.parentElement.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // AI Recommendation Actions
    const aiActions = document.querySelectorAll('.ai-actions .btn-small.primary');
    aiActions.forEach(btn => {
        btn.addEventListener('click', function() {
            const item = this.closest('.ai-item');
            item.style.opacity = '0.5';
            item.style.transform = 'translateX(10px)';
            
            setTimeout(() => {
                showNotification('AI suggestion applied successfully!', 'success');
                item.style.display = 'none';
            }, 300);
        });
    });

    // Refresh AI recommendations
    const refreshBtn = document.querySelector('.ai-card .btn-icon');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            const icon = this.querySelector('i');
            icon.style.animation = 'spin 1s linear infinite';
            
            setTimeout(() => {
                icon.style.animation = '';
                showNotification('AI recommendations refreshed!', 'info');
            }, 1000);
        });
    }

    // Theme toggle
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            document.body.classList.toggle('light-theme');
            const icon = this.querySelector('i');
            if (document.body.classList.contains('light-theme')) {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            } else {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
        });
    }

    // Campaign actions
    const campaignItems = document.querySelectorAll('.campaign-item');
    campaignItems.forEach(item => {
        item.addEventListener('click', function() {
            const campaignName = this.querySelector('h4').textContent;
            showNotification(`Opening campaign: ${campaignName}`, 'info');
        });
    });

    // Agent cards
    const agentCards = document.querySelectorAll('.agent-card');
    agentCards.forEach(card => {
        card.addEventListener('click', function() {
            const agentName = this.querySelector('h4').textContent;
            showNotification(`Viewing ${agentName} details...`, 'info');
        });
    });

    // Real-time updates simulation
    setInterval(updateRealTimeData, 5000);
}

// ========================================
// Real-time Data Updates (Simulation)
// ========================================
function updateRealTimeData() {
    // Update agent activity timestamps
    const activityTexts = [
        'Last action: just now',
        'Last action: 30 secs ago',
        'Last action: 1 min ago',
        'Last action: 2 mins ago'
    ];

    const activities = document.querySelectorAll('.agent-activity');
    activities.forEach((activity, index) => {
        if (Math.random() > 0.5) {
            const newText = activityTexts[Math.floor(Math.random() * activityTexts.length)];
            activity.childNodes[activity.childNodes.length - 1].textContent = newText;
        }
    });

    // Pulse effect on random stats
    const statValues = document.querySelectorAll('.stat-value');
    const randomStat = statValues[Math.floor(Math.random() * statValues.length)];
    randomStat.style.animation = 'pulse 0.5s ease';
    setTimeout(() => {
        randomStat.style.animation = '';
    }, 500);
}

// ========================================
// Notifications
// ========================================
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        padding: 16px 24px;
        background: ${type === 'success' ? 'rgba(34, 197, 94, 0.9)' : type === 'error' ? 'rgba(239, 68, 68, 0.9)' : 'rgba(99, 102, 241, 0.9)'};
        color: white;
        border-radius: 12px;
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add keyframe animations
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// ========================================
// Utility Functions
// ========================================
function formatCurrency(amount) {
    return '₨' + amount.toLocaleString('en-PK');
}

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// Console welcome message
console.log(`
%c🚀 LUMU AI Marketing Dashboard
%cPowered by Advanced AI Agents

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 6 AI Agents Active
🎯 12 Campaigns Running
💰 ₨52.4M Sales This Month
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`, 
'font-size: 20px; font-weight: bold; color: #6366f1;',
'font-size: 12px; color: #a0a0b8;'
);
