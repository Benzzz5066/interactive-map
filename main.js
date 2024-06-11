document.addEventListener('DOMContentLoaded', () => {
    const map = L.map('map').setView([51.505, -0.09], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    let markers = [];
    let points = [];

    async function fetchWeatherData(lat, lon) {
        const apiKey = '884faec5e589e544f4b0181a363d554c'; // Replace with your OpenWeatherMap API key
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;
        
        try {
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.cod === 200) {
                const weather = data.weather[0].description;
                const temp = (data.main.temp - 273.15).toFixed(2); // Convert Kelvin to Celsius
                
                const marker = L.marker([lat, lon]).addTo(map)
                    .bindPopup(`Weather: ${weather}<br>Temperature: ${temp}°C`)
                    .openPopup();
                
                markers.push(marker);
            } else {
                console.error('Error fetching weather data:', data.message);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    function removeMarkers() {
        markers.forEach(marker => map.removeLayer(marker));
        markers = [];
        points = [];
    }

    map.on('click', function(e) {
        const { lat, lng } = e.latlng;
        fetchWeatherData(lat, lng);

        const marker = L.marker(e.latlng).addTo(map);
        markers.push(marker);
        points.push(e.latlng);

        if (points.length === 2) {
            const point1 = points[0];
            const point2 = points[1];
            const distance = calculateDistance(point1.lat, point1.lng, point2.lat, point2.lng);
            alert('Distance between the two points: ' + distance.toFixed(2) + ' km');
            points = [];
        }
    });

    document.getElementById('remove-markers').addEventListener('click', removeMarkers);

    // Add geocoder control for search
    var geocoder = L.Control.geocoder({
        defaultMarkGeocode: false,
        position: 'topright'
    }).addTo(map);

    geocoder.on('markgeocode', function(e) {
        var bbox = e.geocode.bbox;
        var poly = L.polygon([
            bbox.getSouthEast(),
            bbox.getNorthEast(),
            bbox.getNorthWest(),
            bbox.getSouthWest()
        ]).addTo(map);
        map.fitBounds(poly.getBounds());
    });

    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        return distance;
    }
});
