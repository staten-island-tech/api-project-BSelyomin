import "../style.css";
import { weatherCodes } from "./weatherCodes";

const label = {
  lat: document.querySelector("#lat"),
  long: document.querySelector("#long"),
  temp: document.querySelector("#temp"),
  speed: document.querySelector("#speed"),
  weat: document.querySelector("#weat"),
};

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let background = new Image();
background.src = "../equirectanglular.png";

// Make sure the image is loaded first otherwise nothing will draw.
background.onload = function () {
  clearScreen();
};

function clearScreen() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.clientWidth, canvas.height);
  ctx.drawImage(background, 0, 0);
}

canvas.addEventListener("mousedown", function (e) {
  display(canvas, e);
});

const getWeather = async ({ longitude, latitude }) => {
  try {
    let response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,precipitation,weathercode,windspeed_10m&current_weather=true`
    );
    let data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};

async function display(canvas, event) {
  clearScreen();
  let cursorPos = getCursorPosition(canvas, event);
  let converted = convetCords(cursorPos);
  let data = await getWeather(converted);
  let code = decipher(data);
  write(data, code);
  marker(cursorPos);
}

function getCursorPosition(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  const x = Math.round(event.clientX - rect.left - 16);
  const y = Math.round(event.clientY - rect.top - 16);
  return { x, y };
}

function convetCords({ x, y }) {
  let longitude = Math.round(10 * (x / 3 - 180)) / 10;
  let latitude = Math.round(10 * (y / 3 - 90)) / 10;
  if (longitude > 180) {
    longitude = 180;
  } else if (longitude < -180) {
    longitude = -180;
  }
  if (latitude > 90) {
    latitude = 90;
  } else if (latitude < -90) {
    latitude = -90;
  }
  return { longitude, latitude };
}

function decipher(data) {
  let code = data.current_weather.weathercode;
  return weatherCodes[code].code;
}
console.log(0.7 + 0.1);

function write(data, code) {
  label.lat.innerHTML = `Latitude: ${data.latitude}°`;
  label.long.innerHTML = `Longitude: ${data.longitude}°`;
  label.temp.innerHTML = `Temperature ${data.current_weather.temperature} °C`;
  label.speed.innerHTML = `Wind Speed: ${data.current_weather.windspeed} k/hr`;
  label.weat.innerHTML = `Weather: ${code}`;
}

function marker({ x, y }) {
  ctx.beginPath(); // starts circle
  ctx.arc(x, y, 5, 0, Math.PI * 2); // x,y , radius, start angle, end angle.
  ctx.fillStyle = "red";
  ctx.fill();
}
