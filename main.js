const map = L.map('map').setView([51.505, -0.09], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let markers = [];

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
}

map.on('click', function(e) {
    const { lat, lng } = e.latlng;
    fetchWeatherData(lat, lng);
});

document.getElementById('remove-markers').addEventListener('click', removeMarkers);


const searchControl = new L.Control.Search({
    position: 'topright', 
    layer: map, 
    initial: false, 
    zoom: 14, 
    textPlaceholder: 'Search...', 
    marker: false 
});
searchControl.addTo(map); 
