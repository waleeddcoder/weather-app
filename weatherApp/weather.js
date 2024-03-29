const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const loading = document.querySelector(".loading");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");
const API_KEY = "b3404a891a03654926f96bf1de76b2ae";

const createWeatherCard = (cityName, weatherItem, index) => {
    const weatherDate = new Date(weatherItem.dt_txt + " UTC");
    const options = {
        weekday: "long",
        year: "numeric",
        month: "short",
        day: "numeric",
    };
    const formattedDate = weatherDate.toLocaleDateString("en-US", options);

    if (index === 0) {
        return `
        <div class="details">
            <h2>${cityName}—${formattedDate}</h2>
            <h6>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(
                2
            )}°C</h6>
            <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
            <h6>Humidity: ${weatherItem.main.humidity}%</h6>
        </div>
        <div class="icon">
            <img src="https://openweathermap.org/img/wn/${
                weatherItem.weather[0].icon
            }@4x.png" alt="weather-icon">
            <h6>${weatherItem.weather[0].description}</h6>
        </div>`;
    } else {
        return `
                <li class="card">
                    <h3>${formattedDate}</h3>
                    <img src="https://openweathermap.org/img/wn/${
                        weatherItem.weather[0].icon
                    }@4x.png" alt="weather-icon">

                    <h6>Temp: ${(weatherItem.main.temp - 273.15).toFixed(
                        2
                    )}°C</h6>
                    <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
                    <h6>Humidity: ${weatherItem.main.humidity}%</h6>
                </li>`;
    }
};

const getWeatherDetails = (cityName, lat, lon) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}
    `;

    fetch(WEATHER_API_URL)
        .then((res) => res.json())
        .then((data) => {
            const uniqueForecastDays = [];
            const fiveDaysForecast = data.list.filter((forecast) => {
                const forecastDate = new Date(forecast.dt_txt).getDate();
                if (!uniqueForecastDays.includes(forecastDate)) {
                    return uniqueForecastDays.push(forecastDate);
                }
            });
            cityInput.value = "";
            currentWeatherDiv.innerHTML = "";
            weatherCardsDiv.innerHTML = "";
            fiveDaysForecast.forEach((weatherItem, index) => {
                if (index === 0) {
                    currentWeatherDiv.insertAdjacentHTML(
                        "beforeend",
                        createWeatherCard(cityName, weatherItem, index)
                    );
                } else {
                    weatherCardsDiv.insertAdjacentHTML(
                        "beforeend",
                        createWeatherCard(cityName, weatherItem, index)
                    );
                }
            });
        })
        .catch(() => {
            alert("An error occurred while fetching the weather forecast!");
        });
};

const getCityCoordinates = () => {
    loading.style.display = "flex";

    const cityName = cityInput.value.trim();
    if (cityName === "") {
        loading.style.display = "none"; // Hide the loading spinner
        alert("Please enter a city name"); // Show an alert for an empty field
        return;
    }
    const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}
    `;
    fetch(GEOCODING_API_URL)
        .then((res) => res.json())
        .then((data) => {
            loading.style.display = "none";

            if (!data.length)
                return alert(`No coordinates found for ${cityName}`);
            const { name, lat, lon } = data[0];
            getWeatherDetails(name, lat, lon);
        })
        .catch(() => {
            loading.style.display = "none";

            alert("An error occurred while fetching the coordinates!");
        });
};
const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            const REVERSE_GEOCODING_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}
            `;
            fetch(REVERSE_GEOCODING_URL)
                .then((res) => res.json())
                .then((data) => {
                    const { name } = data[0];
                    getWeatherDetails(name, latitude, longitude);
                })
                .catch(() => {
                    alert("An error occurred while fetching the city name!");
                });
        },
        (error) => {
            if (error.code === error.PERMISSION_DENIED) {
                alert(
                    " Geolocation request denied, Please reset location permission to grant access again."
                );
            }
        }
    );
};

locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener(
    "keyup",
    (e) => e.key === "Enter" && getCityCoordinates()
);
