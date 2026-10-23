const form = document.querySelector("form");
const searchBar = document.querySelector("#city");
form.addEventListener("submit", handleSearch);

async function handleSearch(event) {
  event.preventDefault();
  clearWeather();
  document.querySelector(".total-matches").replaceChildren();
  const userInput = searchBar.value.trim();
  if (!validateCity(userInput)) {
    showMessage("Enter a valid input");
    return;
  }
  showMessage("Loading locations...");
  const data = await getLocation(userInput);
  if (data === null) {
    showMessage(
      "Could not load locations. Check your connection and try again.",
    );
  } else {
    renderLocation(data);
  }
}
function clearWeather() {
  document.querySelector(".today-forecast").replaceChildren();
  document.querySelector(".future-result").replaceChildren();
}
function makeParagraph(text) {
  const paragraph = document.createElement("p");
  paragraph.textContent = text;
  return paragraph;
}

function showMessage(text, selector = ".match-result") {
  const container = document.querySelector(selector);
  container.replaceChildren();
  container.append(makeParagraph(text));
}

function validateCity(city) {
  return city !== "" && !/\d/.test(city);
}

function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

async function getLocation(city) {
  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=5&language=en&format=json`,
    );
    if (!response.ok) throw new Error("HTTP " + response.status);
    return (await response.json()).results ?? [];
  } catch (error) {
    console.error(error);
    return null;
  }
}

function renderLocation(locations) {
  const results = document.querySelector(".match-result");
  const totalMatches = document.querySelector(".total-matches");
  results.replaceChildren();
  totalMatches.replaceChildren();
  let textDisplay = makeParagraph(`${locations.length} New Result Found`);
  if (locations.length > 0) {
    locations.forEach((key) => {
      const button = document.createElement("button");
      button.textContent = key.name;
      const country = makeParagraph(key.country);
      const admin1 = makeParagraph(key.admin1);

      button.classList.add("location-display");
      country.classList.add("match-country");
      admin1.classList.add("match-admin1");

      button.addEventListener("click", async () => {
        document
          .querySelectorAll(".location-display")
          .forEach((other) => other.classList.remove("selected"));
        button.classList.add("selected");
        clearWeather();
        showMessage("Loading weather...", ".today-forecast");
        const weatherData = await getWeather(key.latitude, key.longitude);
        if (weatherData === null) {
          showMessage(
            "Something went wrong while fetching the weather data. Try again.",
            ".today-forecast",
          );
        } else {
          renderWeather(processWeather(weatherData), key);
        }
      });
      if (key.admin1) {
        button.append(admin1);
      }
      button.append(country);
      results.appendChild(button);
    });
    totalMatches.append(textDisplay);
  } else {
    textDisplay = makeParagraph(`No result found for this location try again.`);
    totalMatches.append(textDisplay);
  }
}

async function getWeather(latitude, longitude) {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`,
    );
    if (!response.ok) throw new Error("HTTP " + response.status);
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}
function processWeather(weather) {
  return {
    today: {
      date: weather.daily.time[0],
      temperature: weather.current.temperature_2m,
      apparentTemperature: weather.current.apparent_temperature,
      windSpeed: weather.current.wind_speed_10m,
      condition: getWeatherDescription(weather.current.weather_code),
    },
    forecast: [1, 2, 3].map((i) => ({
      date: weather.daily.time[i],
      max: weather.daily.temperature_2m_max[i],
      min: weather.daily.temperature_2m_min[i],
      condition: getWeatherDescription(weather.daily.weather_code[i]),
    })),
  };
}

function renderWeather(processed, key) {
  const futureResult = document.querySelector(".future-result");
  const todayResult = document.querySelector(".today-forecast");
  todayResult.replaceChildren();
  futureResult.replaceChildren();

  const selectedLocation = document.createElement("div");
  selectedLocation.classList.add("place-title");
  const todayTitle = makeParagraph("Today forecast");
  todayTitle.classList.add("section-title");
  const futureTitle = makeParagraph("Three-day forecast"); 
  futureTitle.classList.add("section-title");
  const locationName = makeParagraph(key.name);
  const locationCountry = makeParagraph(key.country);
  selectedLocation.append(locationName, locationCountry);
  todayResult.appendChild(selectedLocation);

  const div = document.createElement("div");
  div.classList.add("today-forecast-result");
  const date = makeParagraph(`Date : ${formatDate(processed.today.date)}`);
  const currentTemperature = makeParagraph(
    `Current Temperature: ${processed.today.temperature} °C`,
  );
  const currentApparentTemperature = makeParagraph(
    `Current Apparent Temperature:${processed.today.apparentTemperature} °C`,
  );
  const windSpeed = makeParagraph(
    `Wind Speed: ${processed.today.windSpeed} km/h`,
  );
  const weatherCondition = makeParagraph(
    `Weather Condition: ${processed.today.condition}`,
  );
  div.append(
    date,
    currentTemperature,
    currentApparentTemperature,
    windSpeed,
    weatherCondition,
  );
  todayResult.appendChild(todayTitle);
  todayResult.appendChild(div);
  futureResult.appendChild(futureTitle);
  for (const day of processed.forecast) {
    const div = document.createElement("div");
    div.classList.add("future-forecast-result");
    div.append(
      makeParagraph(`Date : ${formatDate(day.date)}`),
      makeParagraph(`Highest : ${day.max} °C`),
      makeParagraph(`Lowest : ${day.min} °C`),
      makeParagraph(`Condition : ${day.condition}`),
    );
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
