// Train Status App
class TrainStatusApp {
    constructor() {
        this.updateTime = document.getElementById('updateTime');
        this.lastUpdated = document.getElementById('lastUpdated');
        this.map = null;
        this.statusMarker = null;
        this.statusDotMarker = null;
        this.statusDotOverlay = null;
        
        this.init();
    }
    
    init() {
        this.initMap();
        this.checkTrainStatus();
        // Check status every 30 seconds
        setInterval(() => this.checkTrainStatus(), 30000);
        
        // Add some interactivity
        this.addEventListeners();
    }
    
    initMap() {
        // Initialize the map centered on NW 9th & Naito intersection
        // Coordinates: 45.5275, -122.6731 (NW 9th Ave & NW Naito Pkwy, Portland, OR)
        this.map = L.map('map').setView([45.5275, -122.6731], 16);
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);
        
        // Add a marker for the intersection
        this.statusMarker = L.marker([45.5275, -122.6731], {
            icon: L.divIcon({
                className: 'intersection-marker',
                html: '<div style="background: #FFB81C; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.3);"></div>',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            })
        }).addTo(this.map);
        
        // Add intersection label
        L.marker([45.5275, -122.6731], {
            icon: L.divIcon({
                className: 'intersection-label',
                html: '<div style="background: rgba(255,255,255,0.9); padding: 5px 10px; border-radius: 10px; font-size: 12px; font-weight: 600; color: #1f2937; border: 1px solid #e5e7eb;">NW 9th & Naito</div>',
                iconSize: [100, 30],
                iconAnchor: [50, 30]
            })
        }).addTo(this.map);
        
        // Create status dot overlay that stays centered on the intersection
        this.statusDotOverlay = L.divIcon({
            className: 'status-dot-overlay',
            html: `
                <div class="status-dot" id="statusDot"></div>
                <div class="status-label" id="statusLabel">Checking...</div>
            `,
            iconSize: [120, 80],
            iconAnchor: [60, 40]
        });
        
        // Add the status dot as a map overlay
        this.statusDotMarker = L.marker([45.5275, -122.6731], {
            icon: this.statusDotOverlay,
            interactive: false
        }).addTo(this.map);
        
        // Add click handler to refresh status
        this.map.on('click', () => this.checkTrainStatus());
    }
    
    addEventListeners() {
        // Add click to refresh functionality
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
                this.setStatus('blocked', 'TRAIN BLOCKING');
            } else {
                this.setStatus('clear', 'CLEAR');
            }
            
            this.updateTimestamp();
            
        } catch (error) {
            console.error('Error checking train status:', error);
            this.setStatus('error', 'ERROR');
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
        // Get the status dot and label elements from the map overlay
        const statusDot = document.querySelector('.status-dot-overlay .status-dot');
        const statusLabel = document.querySelector('.status-dot-overlay .status-label');
        
        if (statusDot && statusLabel) {
            // Remove all status classes
            statusDot.classList.remove('blocked', 'clear', 'checking', 'error');
            
            // Add new status class
            statusDot.classList.add(status);
            
            // Update label text
            statusLabel.textContent = text;
        }
        
        // Update marker color based on status
        if (this.statusMarker) {
            let markerColor = '#FFB81C'; // default yellow
            if (status === 'blocked') markerColor = '#dc2626'; // red
            else if (status === 'clear') markerColor = '#046A38'; // green
            else if (status === 'error') markerColor = '#6b7280'; // gray
            
            this.statusMarker.setIcon(L.divIcon({
                className: 'intersection-marker',
                html: `<div style="background: ${markerColor}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.3);"></div>`,
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            }));
        }
        
        // Add visual feedback by updating the overlay icon
        if (this.statusDotMarker) {
            let dotColor = '#FFB81C'; // default yellow
            if (status === 'blocked') dotColor = '#dc2626'; // red
            else if (status === 'clear') dotColor = '#046A38'; // green
            else if (status === 'error') dotColor = '#6b7280'; // gray
            
            // Update the status dot overlay with new color and text
            this.statusDotMarker.setIcon(L.divIcon({
                className: 'status-dot-overlay',
                html: `
                    <div class="status-dot ${status}" style="background: ${dotColor}; transform: scale(1.1);"></div>
                    <div class="status-label">${text}</div>
                `,
                iconSize: [120, 80],
                iconAnchor: [60, 40]
            }));
            
            // Reset the scale after animation
            setTimeout(() => {
                if (this.statusDotMarker) {
                    this.statusDotMarker.setIcon(L.divIcon({
                        className: 'status-dot-overlay',
                        html: `
                            <div class="status-dot ${status}" style="background: ${dotColor}; transform: scale(1);"></div>
                            <div class="status-label">${text}</div>
                        `,
                        iconSize: [120, 80],
                        iconAnchor: [60, 40]
                    }));
                }
            }, 200);
        }
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