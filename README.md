# Is There a Train Blocking NW 9th & Naito?

A simple web application that displays whether a train is currently blocking the intersection of NW 9th Ave and NW Naito Pkwy in Portland, OR.

## Features

- **Real-time Status**: Shows "YES" if a train is blocking, "NO" if not
- **Auto-refresh**: Updates every 30 seconds
- **Interactive**: Click the status or press 'R' to refresh manually
- **Responsive Design**: Works on desktop and mobile devices
- **Portland-themed Design**: Uses official Portland city flag colors (forest green, sky blue, goldenrod yellow)
- **Modern UI**: Clean, professional design with smooth animations
- **Documentation**: Detailed "How Does This Work?" page explaining the system

## Design

The website features a beautiful Portland-themed color scheme using the official colors from the City of Portland flag:
- **Forest Green** (#046A38) - Symbolizing Portland's forests and green spaces
- **Sky Blue** (#418FDE) - Representing the rivers that flow through the city
- **Goldenrod Yellow** (#FFB81C) - Symbolizing agriculture and commerce

This creates a distinctly Portland aesthetic that connects the app to the city it serves.

## Current Implementation

This is a **demo/prototype** version that simulates train detection. In a production environment, you would integrate with:

- Portland traffic APIs
- Railroad company APIs
- Traffic camera feeds
- User reports
- Traffic signal data
- Real-time sensors

## Files

- `index.html` - Main HTML structure with train status display
- `how-it-works.html` - Detailed explanation page of how the system works
- `styles.css` - Styling with Portland-themed colors and responsive design
- `script.js` - JavaScript functionality and train status logic
- `netlify.toml` - Netlify deployment configuration
- `deploy.sh` - Deployment script for local testing
- `package.json` - Project metadata and scripts
- `README.md` - This documentation file

## Pages

### Main Page (`index.html`)
- Displays current train blocking status (YES/NO)
- Auto-refreshes every 30 seconds
- Shows last update timestamp
- Information about the intersection location
- Navigation to "How Does This Work?" page

### How Does This Work? (`how-it-works.html`)
- Explains the current simulation approach
- Details the time-based logic and pattern recognition
- Outlines future real-time integration possibilities
- Shows technical architecture and reliability measures
- Provides comprehensive understanding of the system

## Deployment to Netlify

### Option 1: Drag & Drop (Easiest)

1. Go to [netlify.com](https://netlify.com) and sign up/login
2. Drag and drop the entire project folder to the Netlify dashboard
3. Your site will be deployed automatically!

### Option 2: Git Integration

1. Push your code to a Git repository (GitHub, GitLab, etc.)
2. Connect your repository to Netlify
3. Netlify will automatically deploy on every push

### Option 3: Netlify CLI

1. Install Netlify CLI: `npm install -g netlify-cli`
2. Run `netlify deploy` in your project directory
3. Follow the prompts

## Customization

### Changing the Intersection

To monitor a different intersection, update the location in:
- `index.html` - Update the title and subtitle
- `script.js` - Modify the `simulateTrainDetection()` function

### Integrating Real Data

Replace the `simulateTrainDetection()` function in `script.js` with actual API calls:

```javascript
async checkTrainStatus() {
    try {
        this.setStatus('checking', 'Checking...');
        
        // Replace this with your actual API call
        const response = await fetch('your-api-endpoint');
        const data = await response.json();
        
        if (data.trainBlocking) {
            this.setStatus('yes', 'YES');
        } else {
            this.setStatus('no', 'NO');
        }
        
        this.updateTimestamp();
    } catch (error) {
        console.error('Error:', error);
        this.setStatus('error', 'Error');
    }
}
```

## Local Development

1. Clone or download the project
2. Open `index.html` in a web browser
3. Or use a local server: `python -m http.server 8000`
4. Use the navigation to explore both pages

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is open source and available under the MIT License.

## Contributing

Feel free to submit issues, feature requests, or pull requests to improve the application!

---

**Note**: This application currently simulates train detection for demonstration purposes. To make it production-ready, integrate with real-time data sources specific to Portland's railroad infrastructure. The "How Does This Work?" page provides detailed information about the current simulation and future integration possibilities. 