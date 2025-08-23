// Configuration template file
// Copy this file to config.js and fill in your actual values
// DO NOT commit config.js to version control

const config = {
    // TriMet API Configuration
    trimet: {
        appId: 'YOUR_TRIMET_APP_ID_HERE', // Get this from https://developer.trimet.org/
        baseUrl: 'https://developer.trimet.org/ws/V1',
        endpoints: {
            vehicles: '/vehicles/appID/',
            arrivals: '/arrivals/locIDs/',
            routes: '/routes/appID/',
            stops: '/stops/appID/'
        }
    },
    
    // Map Configuration
    map: {
        center: [45.532533, -122.680120], // NW 9th & Naito intersection
        zoom: 16,
        updateInterval: 30000 // 30 seconds
    },
    
    // Train Status Configuration
    trainStatus: {
        updateInterval: 30000 // 30 seconds
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = config;
} else {
    window.config = config;
} 