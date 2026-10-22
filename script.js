
const searchButton = document.querySelector(".submit-button");
const searchBar = document.querySelector("#city");
async function handleSearch() {
    const userInput = searchBar.value.trim();
    if (validateCity(userInput)) {
    renderLocation(await getLocation());
  } else {
    showMessage("Enter a valid input");
  }

}
searchBar.addEventListener("keydown",(event) => {
 if(event.key ==="Enter"){
    handleSearch();
 }
});
searchButton.addEventListener("click",handleSearch);

function showMessage(text) {  
  const container = document.querySelector(".match-result");
  container.replaceChildren();

  const message = document.createElement("p");
  message.textContent = text;
  container.append(message);
}

function validateCity(city) {
  return city && !/\d/.test(city);
}

async function getLocation() {
  const userInput = searchBar.value.trim();
  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(userInput)}&count=5&language=en&format=json`,
    );
    if (!response.ok) throw new error("HTTP " + response.status);
    const data = await response.json();
    return data.results ?? [];
  } catch (error) {
    console.error("Location");
    return [];
  }
}

function renderLocation(locations) {
  const results = document.querySelector(".match-result");
  const totalMatches = document.querySelector(".total-matches");
  results.replaceChildren();
  totalMatches.replaceChildren();
  if (locations.length > 0) {
    locations.forEach((key) => {
      const location = document.createElement("button");
      const p1 = document.createElement("p");
      const p2 = document.createElement("p");
      location.classList.add("location-display");
      p1.classList.add("match-country");
      p2.classList.add("match-admin1");
      location.textContent = key.name;
      p1.textContent = key.country;
      p2.textContent = key.admin1;
      location.addEventListener("click", async (event) => {
        const weatherData = await getWeather(key.latitude, key.longitude);
        renderWeather(weatherData);
      });
      location.append(p1, p2);
      results.appendChild(location);
    });
    const textDisplay = document.createElement("h3");
    textDisplay.textContent =`${locations.length} New Result Found`;
    totalMatches.append(textDisplay);
  }

  async function getWeather(latitude, longitude) {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`,
      );
      if (!response.ok) throw new error("HTTP" + response.status);
      const weatherData = await response.json();
      return weatherData ?? [];
    } catch (error) {
      console.error();
      return [];
    }
  }

  function renderWeather(weather) {
    const weatherResult = document.querySelector(".weather-result")
    const futureResult = document.querySelector(".future-result");
    const todayResult =document.querySelector(".today-forecast");
    todayResult.replaceChildren();
    futureResult.replaceChildren();
    const div =document.createElement("div");
    div.classList.add("today-forecast-result");
    const date = document.createElement("p");
    const currentTemprature = document.createElement("p");
    const currentApparentTemprature = document.createElement("p");
    const windSpeed = document.createElement("p");
    const weatherCondition = document.createElement("p");

    date.textContent = `Date : ${weather.daily.time[0]}`;
    currentTemprature.textContent = `Current Temprature: ${weather.current.temperature_2m}`;
    currentApparentTemprature.textContent = `Current Apparent Temprature:${weather.current.apparent_temperature}`;
    windSpeed.textContent= `Wind Speed: ${weather.current.wind_speed_10m}`;
    weatherCondition.textContent = `Weather Code: ${getWeatherDescription(weather.current.weather_code)};`
    div.append(date,currentTemprature,currentApparentTemprature,windSpeed,weatherCondition);
    todayResult.appendChild(div);

    for(i=1;i<=3;i++){
      const div = document.createElement("div");
      div.classList.add("future-forecast-result");
      const date = document.createElement("p");
      const minTemp = document.createElement("p");
      const maxTemp = document.createElement("p");
      const weatherCondition = document.createElement("p");
      date.textContent = `Date : ${weather.daily.time[i]};`;
      maxTemp.textContent = `Maximum Temprature :${weather.daily.temperature_2m_max[i]}`;
      minTemp.textContent = `Minimum Temprature : ${weather.daily.temperature_2m_min[i]}`;
      weatherCondition.textContent =`Weather Condition :${weather.daily.weather_code[i]}`;
      div.append(date,maxTemp,minTemp,weatherCondition);
      futureResult.appendChild(div);
    }


    
  }
  function getWeatherDescription(code) {
  if (code === 0) return "Clear sky";
  if ([1, 2, 3].includes(code)) return "Partly cloudy";
  if ([45, 48].includes(code)) return "Fog";
  if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle";
  if ([61, 63, 65, 66, 67].includes(code)) return "Rain";
  if ([71, 73, 75, 77].includes(code)) return "Snow";
  if ([80, 81, 82].includes(code)) return "Rain showers";
  if ([85, 86].includes(code)) return "Snow showers";
  if ([95, 96, 99].includes(code)) return "Thunderstorm";

  return "Unknown conditions";

}
}
