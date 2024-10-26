
# Real-Time Location Tracker

A real-time geolocation tracking application that allows multiple users to share and visualize their locations on a live map. This project uses Express, Socket.IO, Leaflet.js, and the HTML5 Geolocation API to track, broadcast, and display user locations dynamically.



## Features

- Real-Time Location Sharing: Track users’ locations in real time.
- Interactive Map: Display user locations using markers on a Leaflet map.
- Dynamic Marker Management: Add markers for connected users, update them based on real-time data, and remove them when users disconnect.
- User Privacy: Location is only shared after user permission.
- Responsive Map Centering: The map centers on the user’s location upon first load.



## Technologies Used
- Backend: Node.js, Express
- Real-Time Communication: Socket.IO
- Frontend: HTML5, CSS, JavaScript
- Map Visualization: Leaflet.js, OpenStreetMap tiles
- Geolocation API: HTML5 Geolocation API
## Installation

- **1**.Clone the repository:

```bash
  https://github.com/Aditya-Gupta171/Real-Time-Tracker.git
  cd real-time-tracker
```
- **2**.Install dependencies:
    
```bash
npm install
```
```bash
npm start
```
- **4**. Open your browser and go to http://localhost:1111 to access the application.