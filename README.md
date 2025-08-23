# Is There a Train Blocking NW 9th & Naito?

A simple web application that displays whether a train is currently blocking the intersection of NW 9th Ave and NW Naito Pkwy in Portland, OR.

## Features

- **Real-time Status**: Shows "YES" if a train is blocking, "NO" if not
- **Auto-refresh**: Updates every 30 seconds
- **Responsive Design**: Works on desktop and mobile devices
- **Interactive**: Click the status or press 'R' to refresh manually
- **Modern UI**: Clean, professional design with smooth animations

## Current Implementation

This is a **demo/prototype** version that simulates train detection. In a production environment, you would integrate with:

- Portland traffic APIs
- Railroad company APIs
- Traffic camera feeds
- User reports
- Traffic signal data
- Real-time sensors

## Files

- `index.html` - Main HTML structure
- `styles.css` - Styling and responsive design
- `script.js` - JavaScript functionality and train status logic
- `netlify.toml` - Netlify deployment configuration

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

**Note**: This application currently simulates train detection for demonstration purposes. To make it production-ready, integrate with real-time data sources specific to Portland's railroad infrastructure. 