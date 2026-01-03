// Open-Meteo API - Free and no API key required
const BASE_URL = 'https://api.open-meteo.com/v1/forecast';

let lat = 41.0082; // Default: Istanbul latitude
let lon = 28.9784; // Default: Istanbul longitude

// Weather code mappings for Open-Meteo
const weatherCodes = {
    0: { description: 'Clear sky', icon: '01d', main: 'Clear' },
    1: { description: 'Mainly clear', icon: '02d', main: 'Clear' },
    2: { description: 'Partly cloudy', icon: '03d', main: 'Clouds' },
    3: { description: 'Overcast', icon: '04d', main: 'Clouds' },
    45: { description: 'Fog', icon: '50d', main: 'Clouds' },
    48: { description: 'Depositing rime fog', icon: '50d', main: 'Clouds' },
    51: { description: 'Light drizzle', icon: '09d', main: 'Rain' },
    53: { description: 'Moderate drizzle', icon: '09d', main: 'Rain' },
    55: { description: 'Dense drizzle', icon: '09d', main: 'Rain' },
    56: { description: 'Light freezing drizzle', icon: '09d', main: 'Rain' },
    57: { description: 'Dense freezing drizzle', icon: '09d', main: 'Rain' },
    61: { description: 'Slight rain', icon: '10d', main: 'Rain' },
    63: { description: 'Moderate rain', icon: '10d', main: 'Rain' },
    65: { description: 'Heavy rain', icon: '10d', main: 'Rain' },
    66: { description: 'Light freezing rain', icon: '10d', main: 'Rain' },
    67: { description: 'Heavy freezing rain', icon: '10d', main: 'Rain' },
    71: { description: 'Slight snow fall', icon: '13d', main: 'Snow' },
    73: { description: 'Moderate snow fall', icon: '13d', main: 'Snow' },
    75: { description: 'Heavy snow fall', icon: '13d', main: 'Snow' },
    77: { description: 'Snow grains', icon: '13d', main: 'Snow' },
    80: { description: 'Slight rain showers', icon: '09d', main: 'Rain' },
    81: { description: 'Moderate rain showers', icon: '09d', main: 'Rain' },
    82: { description: 'Violent rain showers', icon: '09d', main: 'Rain' },
    85: { description: 'Slight snow showers', icon: '13d', main: 'Snow' },
    86: { description: 'Heavy snow showers', icon: '13d', main: 'Snow' },
    95: { description: 'Thunderstorm', icon: '11d', main: 'Rain' },
    96: { description: 'Thunderstorm with slight hail', icon: '11d', main: 'Rain' },
    99: { description: 'Thunderstorm with heavy hail', icon: '11d', main: 'Rain' }
};

// Function to get current weather
async function getCurrentWeather() {
    try {
        const url = `${BASE_URL}?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relative_humidity_2m,wind_speed_10m&timezone=auto`;
        const response = await fetch(url);
        const data = await response.json();
        displayCurrentWeather(data);
        setBackground(weatherCodes[data.current_weather.weathercode].main);
    } catch (error) {
        console.error('Error fetching current weather:', error);
        document.getElementById('city').textContent = 'Error loading weather';
    }
}

// Function to get forecast
async function getForecast() {
    try {
        const url = `${BASE_URL}?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`;
        const response = await fetch(url);
        const data = await response.json();
        displayForecast(data);
    } catch (error) {
        console.error('Error fetching forecast:', error);
    }
}

// Function to display current weather
function displayCurrentWeather(data) {
    const weather = weatherCodes[data.current_weather.weathercode];
    const icon = weather.icon;
    document.getElementById('icon').src = `http://openweathermap.org/img/wn/${icon}.png`; // Using OpenWeatherMap icons for simplicity
    document.getElementById('city').textContent = `Lat: ${lat}, Lon: ${lon}`; // Since no city name, show coords
    document.getElementById('temperature').textContent = `${Math.round(data.current_weather.temperature)}°C`;
    document.getElementById('description').textContent = weather.description;
    // Get humidity from hourly data (current hour)
    const currentHour = new Date().getHours();
    document.getElementById('humidity').textContent = `Humidity: ${data.hourly.relative_humidity_2m[currentHour]}%`;
    document.getElementById('wind').textContent = `Wind: ${data.current_weather.windspeed} km/h`;
}

// Function to set background based on weather
function setBackground(weatherMain) {
    const body = document.body;
    body.className = ''; // Reset classes
    switch (weatherMain) {
        case 'Clear':
            body.classList.add('sunny');
            break;
        case 'Rain':
            body.classList.add('rainy');
            break;
        case 'Snow':
            body.classList.add('snowy');
            break;
        case 'Clouds':
            body.classList.add('cloudy');
            break;
        default:
            body.classList.add('default');
    }
}

// Function to display forecast
function displayForecast(data) {
    const forecastContainer = document.getElementById('forecast-container');
    forecastContainer.innerHTML = '';

    // Next 4 days (skip today)
    for (let i = 1; i <= 4; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        const weather = weatherCodes[data.daily.weather_code[i]];
        const card = document.createElement('div');
        card.className = 'forecast-card';
        card.innerHTML = `
            <p class="date">${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
            <img src="http://openweathermap.org/img/wn/${weather.icon}.png" alt="${weather.description}">
            <p class="temp">${Math.round(data.daily.temperature_2m_max[i])}°C / ${Math.round(data.daily.temperature_2m_min[i])}°C</p>
            <p>${weather.description}</p>
        `;
        forecastContainer.appendChild(card);
    }
}

// Function to get user's location
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            lat = position.coords.latitude;
            lon = position.coords.longitude;
            getCurrentWeather();
            getForecast();
        }, () => {
            // Fallback to default city
            getCurrentWeather();
            getForecast();
        });
    } else {
        getCurrentWeather();
        getForecast();
    }
}

// Initialize
getLocation();