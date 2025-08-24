// Train Status App
class TrainStatusApp {
    constructor() {
        this.updateTime = document.getElementById('updateTime');
        this.lastUpdated = document.getElementById('lastUpdated');
        this.map = null;
        this.statusMarker = null;
        this.statusDotMarker = null;
        this.statusDotOverlay = null;
        this.maxTrains = new Map(); // Store MAX train markers
        this.trainUpdateInterval = null;
        this.maxTrainsNotAvailableMarker = null; // Marker for "MAX trains not shown" message
        this.tensorFlowModel = null; // TensorFlow.js model for train detection
        
        this.init();
    }
    
    init() {
        this.initMap();
        
        // Preload TensorFlow.js model in background
        this.preloadTensorFlowModel();
        
        // Initial train status check with CCTV analysis
        setTimeout(() => this.checkTrainStatus(), 2000); // Wait for map to load first
        // Check status every 30 seconds
        setInterval(() => this.checkTrainStatus(), 30000);
        
        // Add some interactivity
        this.addEventListeners();
    }
    
    async preloadTensorFlowModel() {
        try {
            console.log('🚀 Preloading TensorFlow.js model...');
            await this.loadTensorFlowModel();
            console.log('✅ TensorFlow.js model preloaded successfully');
        } catch (error) {
            console.warn('⚠️ Could not preload TensorFlow model:', error);
        }
    }
    
    initMap() {
        // Initialize the map centered on the SE 12th & Clinton intersection
        // SE 12th & Clinton: 45.503373, -122.653787
        this.map = L.map('map').setView([45.503373, -122.653787], 14);
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);
        

        
        // Add a marker for the SE 12th & Clinton intersection
        this.se12thClintonMarker = L.marker([45.503373, -122.653787], {
            icon: L.divIcon({
                className: 'intersection-marker',
                html: '<div style="background: #046A38; width: 45px; height: 45px; border-radius: 0%; border: 3px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.3);"></div>',
                iconSize: [45, 45],
                iconAnchor: [22.5, 22.5]
            })
        }).addTo(this.map);
        
        // Make the SE 12th & Clinton intersection marker clickable to show modal
        this.se12thClintonMarker.on('click', () => {
            console.log('🎯 SE 12th & Clinton intersection marker clicked directly');
            this.showIntersectionModal();
        });
        

        
        // Remove the general map click handler since we have direct marker click handling
        // this.map.on('click', (e) => this.showIntersectionInfo(e));
        
        // Force map to resize after initialization to ensure proper height
        setTimeout(() => {
            this.map.invalidateSize();
            console.log('🗺️ Map resized, current dimensions:', {
                containerHeight: document.querySelector('.map-container').offsetHeight,
                mapHeight: document.querySelector('#map').offsetHeight,
                mapElement: document.querySelector('#map').style.height
            });
            
            // If the map still doesn't have the right height, force it
            if (document.querySelector('#map').offsetHeight < 600) {
                console.log('🔄 Forcing map height to 600px...');
                this.forceMapHeight();
            }
        }, 100);
        
        // Initialize MAX train overlay
        this.initMaxTrains();
    }
    
    forceMapHeight() {
        const mapElement = document.querySelector('#map');
        const container = document.querySelector('.map-container');
        
        // Force the heights
        mapElement.style.height = '600px';
        container.style.height = '600px';
        
        // Invalidate the map size again
        this.map.invalidateSize();
        
        console.log('✅ Map height forced to 600px');
    }
    
    initMaxTrains() {
        // Start updating MAX train positions
        this.updateMaxTrains();
        this.trainUpdateInterval = setInterval(() => this.updateMaxTrains(), 30000); // Update every 30 seconds
        
        // Add MAX train legend
        this.addMaxTrainLegend();
        
        // Note: MAX line routes are used for train positioning but not displayed visually
        
        // Test TriMet API connection
        this.testTriMetAPI();
    }
    
    async testTriMetAPI() {
        console.log('🧪 Testing TriMet API connection...');
        console.log('🔑 App ID:', config.trimet.appId);
        console.log('🌐 Base URL:', config.trimet.baseUrl);
        
        try {
            // Test the working v2 vehicles endpoint
            const testUrl = `${config.trimet.baseUrl}/vehicles?appID=${config.trimet.appId}`;
            console.log('📡 Testing URL:', testUrl);
            
            const testResponse = await fetch(testUrl);
            console.log('📡 Test API response status:', testResponse.status);
            
            if (testResponse.ok) {
                const testData = await testResponse.json();
                console.log('✅ API connection successful with v2 endpoint!');
                console.log('📋 Response structure:', Object.keys(testData));
                
                // Check if we can access the data
                if (testData.resultSet) {
                    console.log('📊 ResultSet keys:', Object.keys(testData.resultSet));
                    if (testData.resultSet.vehicle) {
                        console.log('🚇 Vehicle count:', testData.resultSet.vehicle.length);
                    }
                }
            } else {
                console.warn('⚠️ API connection test failed:', testResponse.status);
                const errorText = await testResponse.text();
                console.warn('📋 Error response:', errorText);
            }
        } catch (error) {
            console.error('❌ API connection test error:', error);
            
            // Check if it's a CORS issue
            if (error.message.includes('CORS') || error.message.includes('cross-origin')) {
                console.error('🚫 CORS issue detected - this might be the problem!');
                console.error('💡 TriMet API might not support browser requests directly');
            }
        }
    }
    
    async updateMaxTrains() {
        try {
            // Fetch TriMet GTFS real-time data for MAX trains
            const trainData = await this.fetchMaxTrainData();
            
            // Clear existing train markers
            this.maxTrains.forEach(marker => this.map.removeLayer(marker));
            this.maxTrains.clear();
            
            if (trainData.length === 0) {
                // Show "MAX trains not shown" message
                this.showMaxTrainsNotAvailable();
                return;
            }
            
            // Add new train markers
            trainData.forEach(train => {
                const trainMarker = this.createMaxTrainMarker(train);
                this.maxTrains.set(train.id, trainMarker);
                trainMarker.addTo(this.map);
            });
            
            console.log(`Updated ${trainData.length} MAX train positions`);
            
        } catch (error) {
            console.error('Error updating MAX trains:', error);
            this.showMaxTrainsNotAvailable();
        }
    }
    
    showMaxTrainsNotAvailable() {
        // Remove any existing "not available" message
        if (this.maxTrainsNotAvailableMarker) {
            this.map.removeLayer(this.maxTrainsNotAvailableMarker);
        }
        
        // Create a message marker in the center of the map
        this.maxTrainsNotAvailableMarker = L.marker(config.map.center, {
            icon: L.divIcon({
                className: 'max-trains-not-available',
                html: `
                    <div class="no-trains-message">
                        <div class="no-trains-icon">🚇</div>
                        <div class="no-trains-text">MAX Trains Not Shown</div>
                        <div class="no-trains-subtext">Real-time data unavailable</div>
                    </div>
                `,
                iconSize: [200, 80],
                iconAnchor: [100, 40]
            }),
            interactive: false
        }).addTo(this.map);
        
        console.log('MAX trains not available - showing message');
    }
    
    async fetchMaxTrainData() {
        try {
            console.log('🔍 Fetching TriMet MAX train data...');
            
            // Try multiple endpoints to find MAX train data
            const endpoints = [
                `${config.trimet.baseUrl}/vehicles`,
                `${config.trimet.baseUrl}/arrivals`,
                `${config.trimet.baseUrl}/routes`,
                `${config.trimet.baseUrl}/stops`
            ];
            
            let data = null;
            let workingEndpoint = null;
            
            // Try each endpoint until we find one that works
            for (const endpoint of endpoints) {
                try {
                    console.log('📡 Trying endpoint:', endpoint);
                    
                    // Try different parameter combinations
                    const testUrls = [
                        `${endpoint}?appID=${config.trimet.appId}`,
                        `${endpoint}?appID=${config.trimet.appId}&format=json`,
                        `${endpoint}?appID=${config.trimet.appId}&json=true`,
                        `${endpoint}?appID=${config.trimet.appId}&type=json`,
                        `${endpoint}?appID=${config.trimet.appId}&output=json`
                    ];
                    
                    let response = null;
                    let workingUrl = null;
                    
                    for (const url of testUrls) {
                        try {
                            console.log('🔗 Testing URL:', url);
                            response = await fetch(url);
                            
                            if (response.ok) {
                                workingUrl = url;
                                break;
                            }
                        } catch (urlError) {
                            console.log('⚠️ URL failed:', url, urlError.message);
                        }
                    }
                    
                    if (!response || !response.ok) {
                        console.warn('⚠️ All URL variations failed for endpoint:', endpoint);
                        continue;
                    }
                    
                    console.log('✅ Working URL found:', workingUrl);
                    console.log('📊 Response status:', response.status);
                    
                    const responseData = await response.json();
                    console.log('📦 Response from', endpoint, ':', responseData);
                    
                    // Check if this endpoint has vehicle data
                    if (responseData.resultSet && responseData.resultSet.vehicle) {
                        data = responseData;
                        workingEndpoint = endpoint;
                        console.log('✅ Found vehicle data at:', endpoint);
                        break;
                    } else if (responseData.resultSet && responseData.resultSet.arrival) {
                        console.log('📋 Found arrival data, checking for MAX trains...');
                        // This might have MAX train arrival info
                        data = responseData;
                        workingEndpoint = endpoint;
                        break;
                    } else {
                        console.log('📋 No vehicle/arrival data at:', endpoint);
                    }
                } catch (endpointError) {
                    console.warn('⚠️ Error with endpoint:', endpoint, endpointError);
                }
            }
            
            if (!data) {
                throw new Error('No working endpoints found for MAX train data');
            }
            
            console.log('🎯 Using endpoint:', workingEndpoint);
            
            // Check if we have valid data
            if (!data.resultSet || (!data.resultSet.vehicle && !data.resultSet.arrival)) {
                console.warn('⚠️ No vehicle/arrival data structure found in API response');
                console.warn('📋 Expected structure: data.resultSet.vehicle or data.resultSet.arrival');
                console.warn('📋 Actual structure:', Object.keys(data));
                throw new Error('No vehicle/arrival data from TriMet API');
            }
            
            // Handle different data types
            let maxTrains = [];
            
            if (data.resultSet.vehicle) {
                console.log('🚇 Total vehicles in response:', data.resultSet.vehicle.length);
                
                // Filter for MAX trains only and transform data
                maxTrains = data.resultSet.vehicle
                    .filter(vehicle => {
                        const isMax = vehicle.routeNumber && this.isMaxRoute(vehicle.routeNumber);
                        if (isMax) {
                            console.log('✅ Found MAX train:', vehicle);
                        }
                        return isMax;
                    })
                    .map(vehicle => this.transformTriMetData(vehicle));
                    
            } else if (data.resultSet.arrival) {
                console.log('🚇 Total arrivals in response:', data.resultSet.arrival.length);
                
                // Try to extract MAX train info from arrivals
                maxTrains = data.resultSet.arrival
                    .filter(arrival => {
                        const isMax = arrival.route && this.isMaxRoute(arrival.route);
                        if (isMax) {
                            console.log('✅ Found MAX arrival:', arrival);
                        }
                        return isMax;
                    })
                    .map(arrival => this.transformArrivalData(arrival));
            }
            
            console.log(`🎯 Found ${maxTrains.length} MAX trains after filtering`);
            return maxTrains;
            
        } catch (error) {
            console.error('❌ Error fetching TriMet data:', error);
            console.error('🔍 Full error details:', error.message);
            // Return empty array to show "MAX trains not shown" message
            return [];
        }
    }
    
    isMaxRoute(routeNumber) {
        // TriMet MAX route numbers
        const maxRoutes = ['100', '200', '190', '195', '290'];
        return maxRoutes.includes(routeNumber.toString());
    }
    
    transformTriMetData(vehicle) {
        return {
            id: vehicle.vehicleID || `train-${Math.random().toString(36).substr(2, 9)}`,
            route: `MAX ${vehicle.routeNumber}`,
            line: this.getLineName(vehicle.routeNumber),
            color: this.getLineColor(vehicle.routeNumber),
            lat: parseFloat(vehicle.latitude) || 0,
            lng: parseFloat(vehicle.longitude) || 0,
            direction: this.getDirectionName(vehicle.direction) || 'Unknown',
            speed: vehicle.speed ? Math.round(vehicle.speed * 2.237) : 0, // Convert m/s to mph
            nextStop: vehicle.nextStop || 'Unknown',
            passengers: vehicle.passengerCount || 'Unknown'
        };
    }

    transformArrivalData(arrival) {
        return {
            id: `arrival-${arrival.vehicleID || Math.random().toString(36).substr(2, 9)}`,
            route: `MAX ${arrival.route}`,
            line: this.getLineName(arrival.route),
            color: this.getLineColor(arrival.route),
            lat: parseFloat(arrival.latitude) || 0,
            lng: parseFloat(arrival.longitude) || 0,
            direction: this.getDirectionName(arrival.direction) || 'Unknown',
            speed: arrival.speed ? Math.round(arrival.speed * 2.237) : 0, // Convert m/s to mph
            nextStop: arrival.nextStop || 'Unknown',
            passengers: arrival.passengerCount || 'Unknown'
        };
    }
    
    getLineName(routeNumber) {
        const lineMap = {
            '100': 'Red Line',
            '200': 'Blue Line', 
            '190': 'Green Line',
            '195': 'Yellow Line',
            '290': 'Orange Line'
        };
        return lineMap[routeNumber] || 'Unknown Line';
    }
    
    getLineColor(routeNumber) {
        const colorMap = {
            '100': '#dc2626', // Red
            '200': '#2563eb', // Blue
            '190': '#16a34a', // Green
            '195': '#ca8a04', // Yellow
            '290': '#ea580c'  // Orange
        };
        return colorMap[routeNumber] || '#6b7280';
    }
    
    getDirectionName(directionCode) {
        // Convert TriMet direction codes to readable names
        const directionMap = {
            '0': 'Eastbound',
            '1': 'Westbound',
            '2': 'Northbound',
            '3': 'Southbound',
            '4': 'Clockwise',
            '5': 'Counter-clockwise',
            '6': 'Inbound',
            '7': 'Outbound',
            '8': 'Northbound',
            '9': 'Southbound',
            '10': 'Eastbound',
            '11': 'Westbound'
        };
        
        // If it's already a readable string, return it
        if (typeof directionCode === 'string' && !directionMap[directionCode]) {
            return directionCode;
        }
        
        // Convert numeric codes to readable names
        return directionMap[directionCode] || 'Unknown Direction';
    }
    
    createMaxTrainMarker(train) {
        // Determine arrow direction based on train direction
        let arrowDirection = '→'; // Default right arrow
        let arrowClass = 'eastbound';
        
        if (train.direction.toLowerCase().includes('west') || 
            train.direction.toLowerCase().includes('westbound') ||
            train.direction === '1' || train.direction === '3' || 
            train.direction === '5' || train.direction === '7' ||
            train.direction === '9' || train.direction === '11') {
            arrowDirection = '←'; // Left arrow for westbound
            arrowClass = 'westbound';
        }
        
        const trainIcon = L.divIcon({
            className: 'max-train-marker',
            html: `
                <div class="train-marker ${arrowClass}" style="background: ${train.color}; border-color: ${train.color};">
                    <div class="train-arrow">${arrowDirection}</div>
                </div>
            `,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });
        
        const marker = L.marker([train.lat, train.lng], { icon: trainIcon });
        
        // Add popup with train information
        marker.bindPopup(`
            <div class="train-popup">
                <h3>${train.route}</h3>
                <p><strong>Direction:</strong> ${train.direction}</p>
                <p><strong>Speed:</strong> ${train.speed} mph</p>
                <p><strong>Next Stop:</strong> ${train.nextStop}</p>
                <p><strong>Passengers:</strong> ~${train.passengers}</p>
                <p><strong>Last Updated:</strong> ${new Date().toLocaleTimeString()}</p>
            </div>
        `);
        
        return marker;
    }
    

    
    showIntersectionModal(intersectionType = 'nw9th-naito') {
        const modal = document.getElementById('intersectionModal');
        if (modal) {
            // Update modal content based on intersection type
            this.updateModalContent(intersectionType);
            modal.style.display = 'block';
            console.log(`📱 Opening ${intersectionType} intersection information modal`);
        }
    }
    
    updateModalContent(intersectionType) {
        const modalHeader = document.querySelector('#intersectionModal .modal-header h2');
        const modalBody = document.querySelector('#intersectionModal .modal-body');
        
        // Only show SE 12th & Clinton intersection information
        modalHeader.innerHTML = '🚂 SE 12th & Clinton Intersection';
        modalBody.innerHTML = `
            <div class="modal-section">
                <h3>📍 Location</h3>
                <p>SE 12th Avenue & SE Clinton Street<br>
                Portland, Oregon 97202</p>
                <p><strong>Coordinates:</strong> 45.503373, -122.653787</p>
            </div>
            <div class="modal-section">
                <h3>📹 Live Camera Feed</h3>
                <div id="cctv-container">
                    <div class="cctv-loading">Loading camera feed...</div>
                </div>
                <button onclick="refreshCamera()" class="refresh-btn">Refresh Camera</button>
            </div>
            <div class="modal-section">
                <h3>🚇 MAX Transit</h3>
                <p>Nearby MAX stations:<br>
                • SE Clinton/SE 12th (Green Line)<br>
                • SE Division/SE 12th (Green Line)</p>
            </div>
            <div class="modal-section">
                <h3>🔄 Current Status</h3>
                <p id="modal-status">UNKNOWN</p>
                <button onclick="refreshStatus()" class="refresh-btn">Refresh Status</button>
            </div>
        `;
        
        // Load the CCTV camera feed and check for trains
        this.loadCCTVFeed();
        // Also check train status when modal opens
        setTimeout(() => this.checkTrainStatus(), 1000);
    }
    

    
    async loadCCTVFeed() {
        try {
            console.log('📹 Loading CCTV camera feed for Portland - 12th at Clinton...');
            
            // TripCheck API endpoint for camera "Portland - 12th at Clinton"
            const tripCheckUrl = 'https://tripcheck.com/RoadCams/cams/12th%20at%20Clinton_pid3177.JPG';
            
            const cctvContainer = document.getElementById('cctv-container');
            if (cctvContainer) {
                cctvContainer.innerHTML = `
                    <div class="cctv-image-container">
                        <img src="${tripCheckUrl}?t=${Date.now()}" 
                             alt="Portland - 12th at Clinton CCTV Camera" 
                             class="cctv-image"
                             onerror="this.parentElement.innerHTML='<div class=\'cctv-error\'>Camera feed unavailable</div>'"
                             onload="this.parentElement.querySelector('.cctv-loading')?.remove(); window.trainApp.checkTrainStatus();">
                        <div class="cctv-loading">Loading camera feed...</div>
                        <div class="cctv-info">
                            <p><strong>Camera:</strong> Portland - 12th at Clinton</p>
                            <p><em>Live traffic camera feed from TripCheck</em></p>
                        </div>
                    </div>
                `;
            }
            
        } catch (error) {
            console.error('❌ Error loading CCTV feed:', error);
            const cctvContainer = document.getElementById('cctv-container');
            if (cctvContainer) {
                cctvContainer.innerHTML = '<div class="cctv-error">Error loading camera feed</div>';
            }
        }
    }
    
    addMaxTrainLegend() {
        const legend = L.control({ position: 'bottomright' });
        
        legend.onAdd = function() {
            const div = L.DomUtil.create('div', 'max-train-legend');
            div.innerHTML = `
                <div class="legend-header">MAX Train Lines</div>
                <div class="legend-item">
                    <span class="legend-color" style="background: #dc2626;"></span>
                    <span>Red Line</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color" style="background: #2563eb;"></span>
                    <span>Blue Line</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color" style="background: #16a34a;"></span>
                    <span>Green Line</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color" style="background: #ca8a04;"></span>
                    <span>Yellow Line</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color" style="background: #ea580c;"></span>
                    <span>Orange Line</span>
                </div>
            `;
            return div;
        };
        
        legend.addTo(this.map);
    }
    
    addMaxLineRoutes() {
        // This function is no longer needed - routes are used internally for positioning only
        // MAX line routes are defined in simulateMaxTrainData() for realistic train placement
    }
    
    addEventListeners() {
        // Add click to refresh functionality
        document.addEventListener('keydown', (e) => {
            if (e.key === 'r' || e.key === 'R') {
                this.checkTrainStatus();
            }
        });
        
        // Add modal event handlers
        this.setupModalHandlers();
    }
    
    setupModalHandlers() {
        const modal = document.getElementById('intersectionModal');
        const closeBtn = document.querySelector('.close-modal');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
                console.log('❌ Closing intersection modal');
            });
        }
        
        // Close modal when clicking outside of it
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                    console.log('❌ Closing intersection modal (clicked outside)');
                }
            });
        }
        
        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display === 'block') {
                modal.style.display = 'none';
                console.log('❌ Closing intersection modal (Escape key)');
            }
        });
    }
    
    async checkTrainStatus() {
        try {
            // Show checking state
            this.setStatus('checking', 'Checking...');
            
            // Analyze the CCTV camera feed to detect trains
            const hasTrain = await this.analyzeCCTVForTrains();
            
            if (hasTrain) {
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
    
    async analyzeCCTVForTrains() {
        try {
            console.log('🔍 Analyzing CCTV feed for train detection using TensorFlow.js...');
            
            // Ensure TensorFlow model is loaded
            if (!this.tensorFlowModel) {
                console.log('📚 Loading TensorFlow.js model...');
                await this.loadTensorFlowModel();
            }
            
            if (!this.tensorFlowModel) {
                console.warn('⚠️ TensorFlow model not available, falling back to basic detection');
                return this.fallbackTrainDetection();
            }
            
            // Load the camera image
            const tripCheckUrl = 'https://tripcheck.com/RoadCams/cams/12th%20at%20Clinton_pid3177.JPG';
            
            return new Promise((resolve) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                
                img.onload = async () => {
                    try {
                        // Use TensorFlow.js for object detection
                        const predictions = await this.tensorFlowModel.detect(img);
                        
                        // Look for train-related objects
                        const trainObjects = predictions.filter(pred => 
                            pred.class === 'train' || 
                            pred.class === 'locomotive' ||
                            pred.class === 'car' || // Trains often detected as cars
                            pred.class === 'truck' || // Freight cars might be detected as trucks
                            pred.class === 'bus' // Some train cars might be detected as buses
                        );
                        
                        const hasTrain = trainObjects.length > 0;
                        
                        if (hasTrain) {
                            console.log('🚂 TensorFlow.js detected train objects:', trainObjects.map(obj => `${obj.class} (${Math.round(obj.score * 100)}% confidence)`));
                        } else {
                            console.log('✅ TensorFlow.js: No train objects detected');
                            console.log('📋 Detected objects:', predictions.map(obj => `${obj.class} (${Math.round(obj.score * 100)}% confidence)`));
                        }
                        
                        resolve(hasTrain);
                        
                    } catch (error) {
                        console.error('❌ TensorFlow.js detection error:', error);
                        console.log('🔄 Falling back to basic detection...');
                        resolve(this.fallbackTrainDetection());
                    }
                };
                
                img.onerror = () => {
                    console.warn('⚠️ Could not load camera image for TensorFlow analysis');
                    resolve(false);
                };
                
                // Add timestamp to prevent caching
                img.src = `${tripCheckUrl}?t=${Date.now()}`;
            });
            
        } catch (error) {
            console.error('❌ Error in TensorFlow CCTV analysis:', error);
            return this.fallbackTrainDetection();
        }
    }
    
    async loadTensorFlowModel() {
        try {
            // Check if TensorFlow.js and COCO-SSD are available
            if (typeof cocoSsd === 'undefined') {
                console.error('❌ COCO-SSD model not loaded');
                return false;
            }
            
            console.log('📚 Loading COCO-SSD model...');
            this.tensorFlowModel = await cocoSsd.load();
            console.log('✅ TensorFlow.js COCO-SSD model loaded successfully');
            return true;
            
        } catch (error) {
            console.error('❌ Error loading TensorFlow model:', error);
            this.tensorFlowModel = null;
            return false;
            }
    }
    
    fallbackTrainDetection() {
        try {
            console.log('🔄 Using fallback train detection...');
            
            // Create a canvas to analyze the camera image
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            // Set up canvas dimensions
            canvas.width = 640;
            canvas.height = 480;
            
            // Load the camera image
            const tripCheckUrl = 'https://tripcheck.com/RoadCams/cams/12th%20at%20Clinton_pid3177.JPG';
            
            return new Promise((resolve) => {
                img.crossOrigin = 'anonymous';
                img.onload = () => {
                    try {
                        // Draw the image to canvas
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                        
                        // Get image data for analysis
                        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                        
                        // Use the old pixel analysis as fallback
                        const trainDetected = this.detectTrainInImage(imageData, canvas.width, canvas.height);
                        
                        console.log('🔄 Fallback detection result:', trainDetected ? 'TRAIN FOUND' : 'NO TRAIN');
                        resolve(trainDetected);
                        
                    } catch (error) {
                        console.error('❌ Fallback detection error:', error);
                        resolve(false);
                    }
                };
                
                img.onerror = () => {
                    console.warn('⚠️ Could not load camera image for fallback analysis');
                    resolve(false);
                };
                
                img.src = `${tripCheckUrl}?t=${Date.now()}`;
            });
            
        } catch (error) {
            console.error('❌ Fallback detection failed:', error);
            return false;
        }
    }
    
    detectTrainInImage(imageData, width, height) {
        try {
            // This is a simplified train detection algorithm as fallback
            let darkPixelCount = 0;
            let totalPixels = width * height;
            
            // Count dark pixels (potential train objects)
            for (let i = 0; i < imageData.length; i += 4) {
                const r = imageData[i];
                const g = imageData[i + 1];
                const b = imageData[i + 2];
                
                // Check if pixel is dark (potential train)
                if (r < 100 && g < 100 && b < 100) {
                    darkPixelCount++;
                }
            }
            
            // Calculate percentage of dark pixels
            const darkPixelPercentage = (darkPixelCount / totalPixels) * 100;
            
            // If more than 15% of pixels are dark, it might indicate a train
            const trainThreshold = 15;
            
            console.log(`📊 Fallback analysis: ${darkPixelPercentage.toFixed(2)}% dark pixels (threshold: ${trainThreshold}%)`);
            
            return darkPixelPercentage > trainThreshold;
            
        } catch (error) {
            console.error('❌ Fallback algorithm error:', error);
            return false;
        }
    }
    
    setStatus(status, text) {
        // Get the status dot element from the map overlay
        const statusDot = document.querySelector('.status-dot-overlay .status-dot');
        
        if (statusDot) {
            // Remove all status classes
            statusDot.classList.remove('blocked', 'clear', 'checking', 'error');
            
            // Add new status class
            statusDot.classList.add(status);
        }
        
        // Update marker color based on status for the SE 12th & Clinton intersection
        if (this.se12thClintonMarker) {
            let markerColor = '#6b7280'; // default gray for unknown
            
            if (status === 'blocked') {
                markerColor = '#dc2626'; // red
            } else if (status === 'clear') {
                markerColor = '#046A38'; // green
            } else if (status === 'checking') {
                markerColor = '#FFB81C'; // yellow
            } else if (status === 'error') {
                markerColor = '#dc2626'; // red for errors
            }
            
            this.se12thClintonMarker.setIcon(L.divIcon({
                className: 'intersection-marker',
                html: `<div style="background: ${markerColor}; width: 45px; height: 45px; border-radius: 0%; border: 3px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.3);"></div>`,
                iconSize: [45, 45],
                iconAnchor: [22.5, 22.5]
            }));
        }
        
        // Update modal status if it's open with specific messages
        const modalStatus = document.getElementById('modal-status');
        if (modalStatus) {
            let statusMessage = 'Unknown';
            
            if (status === 'blocked') {
                statusMessage = 'Train Detected';
            } else if (status === 'clear') {
                statusMessage = 'No Train Detected';
            } else if (status === 'checking') {
                statusMessage = 'Checking...';
            } else if (status === 'error') {
                statusMessage = 'Error';
            }
            
            modalStatus.textContent = statusMessage;
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

// Global function for refreshing camera feed
function refreshCamera() {
    if (window.trainApp) {
        window.trainApp.loadCCTVFeed();
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