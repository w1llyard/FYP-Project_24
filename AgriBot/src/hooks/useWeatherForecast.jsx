import { useState, useEffect } from 'react';
import axios from 'axios';

const API_KEY = 'dKoS9GypERove4ST6YezhXGXYd9nQHwk';

// Helper function to fetch location key
function fetchLocationKey(lat, lon) {
    const url = `http://dataservice.accuweather.com/locations/v1/cities/geoposition/search?apikey=${API_KEY}&q=${lat},${lon}`;
    return axios.get(url,{
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    }).then(response => response.data.Key);
}

// Custom hook to manage weather data
function useWeatherForecast() {
    const [forecast, setForecast] = useState(null);
    const [error, setError] = useState(null);

    const loadForecast = async () => {
        try {
            const storedForecast = localStorage.getItem('weatherForecast');
            const forecastExpiry = localStorage.getItem('forecastExpiry');
            const now = new Date();

            if (storedForecast && forecastExpiry && new Date(forecastExpiry) > now) {
                setForecast(JSON.parse(storedForecast));
            } else {
                navigator.geolocation.getCurrentPosition(async position => {
                    const locationKey = await fetchLocationKey(position.coords.latitude, position.coords.longitude);
                    const url = `http://dataservice.accuweather.com/forecasts/v1/daily/5day/${locationKey}?apikey=${API_KEY}&details=true`;
                    const response = await axios.get(url);
                    const newForecast = response.data.DailyForecasts;
                    setForecast(newForecast);
                    localStorage.setItem('weatherForecast', JSON.stringify(newForecast));

                    // Set expiry date to the end of the current day
                    const expiryDate = new Date();
                    expiryDate.setHours(23, 59, 59, 999); // Set to end of the current day
                    localStorage.setItem('forecastExpiry', expiryDate.toISOString());
                }, error => {
                    setError('Failed to fetch geolocation.');
                });
            }
        } catch (err) {
            setError('Failed to load weather data.');
            console.error('Error fetching weather data:', err);
        }
    };

    useEffect(() => {
        loadForecast();
    }, []);

    return { forecast, error, reload: loadForecast };
}

export default useWeatherForecast;

