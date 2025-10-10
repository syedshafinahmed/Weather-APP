const cityInput = document.querySelector('.city-input');
const searchBtn = document.querySelector('.search-btn');
const apiKey = 'b47a9784cfb6db31c0e370e9e524e9fd';

const notFoundSection = document.querySelector('.not-found');
const searchCitySection = document.querySelector('.search-city');
const weatherInfoSection = document.querySelector('.weather-info');

const countryTxt = document.querySelector('.country-txt');
const tempTxt = document.querySelector('.temp-txt');
const conditionTxt = document.querySelector('.condition-txt');
const humidityValueTxt = document.querySelector('.humidity-value-txt');
const windValueTxt = document.querySelector('.wind-value-txt');
const weatherSummaryImg = document.querySelector('.weather-summary-img');
const currentDateTxt = document.querySelector('.current-date-txt');

const forecastItemsContainer = document.querySelector('.forecast-items-container');
const hourlyForecastItemsContainer = document.querySelector('.hourly-forecast-items');

searchBtn.addEventListener('click', () => {
    if (cityInput.value.trim() !== '') {
        updateWeatherInfo(cityInput.value);
        cityInput.value = '';
        cityInput.blur();
    }
});

cityInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && cityInput.value.trim() !== '') {
        updateWeatherInfo(cityInput.value);
        cityInput.value = '';
        cityInput.blur();
    }
});

function getCurrentDate() {
    const currentDate = new Date();
    return currentDate.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' });
}

async function getFetchData(endpoint, city) {
    const url = `https://api.openweathermap.org/data/2.5/${endpoint}?q=${city}&appid=${apiKey}&units=metric`;
    const res = await fetch(url);
    return res.json();
}

function getWeatherIcon(id) {
    if (id <= 232) return 'thunderstorm.svg';
    if (id <= 321) return 'drizzle.svg';
    if (id <= 531) return 'rain.svg';
    if (id <= 622) return 'snow.svg';
    if (id <= 781) return 'atmosphere.svg';
    if (id === 800) return 'clear.svg';
    return 'clouds.svg';
}

async function updateWeatherInfo(city) {
    const weatherData = await getFetchData('weather', city);
    if (weatherData.cod != 200) {
        showDisplaySection(notFoundSection);
        return;
    }

    const { name: country, main: { temp, humidity }, weather: [{ id, main }], wind: { speed } } = weatherData;

    countryTxt.textContent = country;
    tempTxt.textContent = temp.toFixed(1) + ' °C';
    conditionTxt.textContent = main;
    humidityValueTxt.textContent = humidity + '%';
    windValueTxt.textContent = speed + ' M/s';
    currentDateTxt.textContent = getCurrentDate();
    weatherSummaryImg.src = `assets/weather/${getWeatherIcon(id)}`;

    await updateForecastInfo(city);
    showDisplaySection(weatherInfoSection);
}

async function updateForecastInfo(city) {
    const data = await getFetchData('forecast', city);

    forecastItemsContainer.innerHTML = '';
    hourlyForecastItemsContainer.innerHTML = '';

    const today = new Date().toISOString().split('T')[0];

    const next7Hours = data.list.slice(0, 7);
    next7Hours.forEach(f => {
        const time = new Date(f.dt_txt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const temp = f.main.temp.toFixed(1);
        const id = f.weather[0].id;

        hourlyForecastItemsContainer.insertAdjacentHTML('beforeend', `
            <div class="forecast-item">
                <h5 class="forecast-item-date regular-txt">${time}</h5>
                <img src="assets/weather/${getWeatherIcon(id)}" class="forecast-item-img">
                <h5 class="forecast-item-temp">${temp} °C</h5>
            </div>
        `);
    });

    let count = 0;
    data.list.forEach(f => {
        if (count >= 7) return;
        if (f.dt_txt.includes('12:00:00') && !f.dt_txt.startsWith(today)) {
            const date = new Date(f.dt_txt).toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
            const temp = f.main.temp.toFixed(1);
            const id = f.weather[0].id;

            forecastItemsContainer.insertAdjacentHTML('beforeend', `
                <div class="forecast-item">
                    <h5 class="forecast-item-date regular-txt">${date}</h5>
                    <img src="assets/weather/${getWeatherIcon(id)}" class="forecast-item-img">
                    <h5 class="forecast-item-temp">${temp} °C</h5>
                </div>
            `);
            count++;
        }
    });
}

function showDisplaySection(section) {
    [weatherInfoSection, searchCitySection, notFoundSection].forEach(s => s.style.display = 'none');
    section.style.display = 'flex';
}




