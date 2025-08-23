// Train Status App
class TrainStatusApp {
    constructor() {
        this.statusText = document.getElementById('statusText');
        this.statusIndicator = document.getElementById('statusIndicator');
        this.updateTime = document.getElementById('updateTime');
        this.lastUpdated = document.getElementById('lastUpdated');
        
        this.init();
    }
    
    init() {
        this.checkTrainStatus();
        // Check status every 30 seconds
        setInterval(() => this.checkTrainStatus(), 30000);
        
        // Add some interactivity
        this.addEventListeners();
    }
    
    addEventListeners() {
        // Add click to refresh functionality
        this.statusIndicator.addEventListener('click', () => this.checkTrainStatus());
        
        // Add keyboard shortcut (R key) to refresh
        document.addEventListener('keydown', (e) => {
            if (e.key === 'r' || e.key === 'R') {
                this.checkTrainStatus();
            }
        });
    }
    
    async checkTrainStatus() {
        try {
            // Show checking state
            this.setStatus('checking', 'Checking...');
            
            // Simulate API call delay
            await this.delay(1500);
            
            // For demo purposes, we'll simulate different train statuses
            // In a real app, this would call an actual API or service
            const trainStatus = this.simulateTrainDetection();
            
            if (trainStatus.isBlocking) {
                this.setStatus('yes', 'YES');
            } else {
                this.setStatus('no', 'NO');
            }
            
            this.updateTimestamp();
            
        } catch (error) {
            console.error('Error checking train status:', error);
            this.setStatus('error', 'Error');
        }
    }
    
    simulateTrainDetection() {
        // This is a simulation - in reality, you'd integrate with:
        // - Portland traffic APIs
        // - Railroad company APIs
        // - Traffic camera feeds
        // - User reports
        // - Traffic signal data
        
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        
        // Simulate train patterns based on typical Portland freight train schedules
        // Trains often run during off-peak hours and can block intersections for 5-15 minutes
        
        // Simulate a train blocking the intersection
        // In reality, this would be determined by actual sensors, cameras, or traffic data
        
        // For demo: simulate train blocking during certain time windows
        const isRushHour = (hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 18);
        const isTrainTime = (hour === 10 || hour === 14 || hour === 20) && minute < 30;
        
        // Random factor to make it more realistic
        const randomFactor = Math.random();
        
        if (isTrainTime && randomFactor > 0.3) {
            return { isBlocking: true, reason: 'Scheduled freight train' };
        } else if (!isRushHour && randomFactor > 0.7) {
            return { isBlocking: true, reason: 'Unexpected train delay' };
        } else {
            return { isBlocking: false, reason: 'No train currently blocking' };
        }
    }
    
    setStatus(status, text) {
        // Remove all status classes
        this.statusText.classList.remove('yes', 'no', 'checking', 'error');
        
        // Add new status class
        this.statusText.classList.add(status);
        
        // Update text
        this.statusText.textContent = text;
        
        // Add visual feedback
        this.statusIndicator.style.cursor = 'pointer';
        
        // Add subtle animation for status changes
        this.statusIndicator.style.transform = 'scale(1.05)';
        setTimeout(() => {
            this.statusIndicator.style.transform = 'scale(1)';
        }, 200);
    }
    
    updateTimestamp() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
        
        this.updateTime.textContent = timeString;
        
        // Add visual feedback for updates
        this.lastUpdated.style.opacity = '0.5';
        setTimeout(() => {
            this.lastUpdated.style.opacity = '1';
        }, 500);
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Global function for manual refresh
function refreshStatus() {
    if (window.trainApp) {
        window.trainApp.checkTrainStatus();
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.trainApp = new TrainStatusApp();
    
    // Add loading animation
    document.body.classList.add('loaded');
});

// Add some additional interactivity
document.addEventListener('DOMContentLoaded', () => {
    // Add smooth scrolling for better UX
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    
    // Add some fun easter eggs
    let clickCount = 0;
    const title = document.querySelector('h1');
    title.addEventListener('click', () => {
        clickCount++;
        if (clickCount >= 5) {
            title.textContent = '🚂 Choo Choo! 🚂';
            setTimeout(() => {
                title.textContent = '🚂 Train Status';
            }, 2000);
            clickCount = 0;
        }
    });
}); 