import "../style.css";
import { weatherCodes } from "./weatherCodes";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let width = 1;
let background = new Image();

window.onresize = function () {
  console.log("resize");
  watchMedia();
};

function match(px, input) {
  if (input === "min") {
    return window.matchMedia(`(min-width: ${px}px)`).matches;
  } else {
    return window.matchMedia(`(max-width: ${px}px)`).matches;
  }
}

let temp = false;

background.onload = function () {
  clearScreen();
};
window.onload = () => {
  watchMedia();
};
function watchMedia() {
  switch (true) {
    case match(1151, "min"):
      background.src = "/equirectanglular.png";
      ctx.canvas.width = 1080;
      width = 1;
      break;

    case match(1150) && match(751, "min"):
      background.src = "/equirectanglular2.png";
      ctx.canvas.width = 720;
      width = 2;
      break;

    case match(750) && match(561, "min"):
      background.src = "/equirectanglular3.png";
      ctx.canvas.width = 540;
      width = 3;
      break;

    case match(560) && match(381, "min"):
      background.src = "/equirectanglular4.png";
      ctx.canvas.width = 360;
      width = 4;
      break;
    case match(380):
      background.src = "/equirectanglular5.png";
      ctx.canvas.width = 240;
      width = 5;
  }
  ctx.canvas.height = ctx.canvas.width / 2;
  clearScreen();
}

const label = {
  lat: document.querySelector("#lat"),
  long: document.querySelector("#long"),
  temp: document.querySelector("#temp"),
  speed: document.querySelector("#speed"),
  weat: document.querySelector("#weat"),
  city: document.querySelector("#city"),
};

// Make sure the image is loaded first otherwise nothing will draw.

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
    console.log("test");
  }
};

const getCity = async ({ longitude, latitude }) => {
  try {
    let response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,precipitation,weathercode,windspeed_10m&current_weather=true`
    );
    let data = await response.json();
    return data;
  } catch (error) {
    console.log("test");
  }
};

async function display(canvas, event) {
  clearScreen();
  let cursorPos = getCursorPosition(canvas, event);
  let converted = convetCords(cursorPos);
  let data = await getWeather(converted);
  let code = decipher(data);
  write(data, code, converted);
  marker(cursorPos);
}

function getCursorPosition(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  const x = Math.round(event.clientX - rect.left - 16);
  const y = Math.round(event.clientY - rect.top - 16);
  return { x, y };
}

function convetCords({ x, y }) {
  let latitude = 0;
  let longitude = 0;
  switch (width) {
    case 1:
      longitude = Math.round(10 * (x / 3 - 180)) / 10;
      latitude = (Math.round(10 * (y / 3 - 90)) / 10) * -1;
      break;
    case 2:
      longitude = Math.round(10 * (x / 2 - 180)) / 10;
      latitude = (Math.round(10 * (y / 2 - 90)) / 10) * -1;
      break;
    case 3:
      longitude = Math.round(10 * ((2 * x) / 3 - 180)) / 10;
      latitude = (Math.round(10 * ((2 * y) / 3 - 90)) / 10) * -1;
      break;
    case 4:
      longitude = Math.round(10 * (x - 180)) / 10;
      latitude = (Math.round(10 * (y - 90)) / 10) * -1;
      break;
    case 5:
      longitude = Math.round(10 * ((3 * x) / 2 - 180)) / 10;
      latitude = (Math.round(10 * ((3 * y) / 2 - 90)) / 10) * -1;
  }

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

function write(data, code, { longitude, latitude }) {
  label.lat.innerHTML = `Latitude: ${latitude}°`;
  label.long.innerHTML = `Longitude: ${longitude}°`;
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
