import "../css/style.css";
import { weatherCodes } from "./weatherCodes";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let width = 1;
let background = new Image();
let type = "C";

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
    case match(560):
      alert("Please rotate your phone for optimal experience.");
  }
  ctx.canvas.height = ctx.canvas.width / 2;
  label.border.style.cssText = `width: ${canvas.width + 32}px; height: ${
    canvas.height + 32
  }px;`;
  clearScreen();
}

const label = {
  lat: document.querySelector("#lat"),
  long: document.querySelector("#long"),
  temp: document.querySelector("#temp"),
  speed: document.querySelector("#speed"),
  weat: document.querySelector("#weat"),
  city: document.querySelector("#city"),
  button: document.querySelector(".button-64"),
  text: document.querySelector(".text"),
  border: document.querySelector(".border"),
};

// Make sure the image is loaded first otherwise nothing will draw.

function clearScreen() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.clientWidth, canvas.height);
  ctx.drawImage(background, 0, 0);
}

label.button.addEventListener("click", () => {
  if (type === "C") {
    label.text.textContent = "F°";
    type = "F";
  } else {
    label.text.textContent = "C°";
    type = "C";
  }
});

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
  const x = Math.round(event.clientX - rect.left);
  const y = Math.round(event.clientY - rect.top);
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
  if (type === "C") {
    label.lat.innerHTML = `Latitude: ${latitude}°`;
    label.long.innerHTML = `Longitude: ${longitude}°`;
    label.temp.innerHTML = `Temperature ${data.current_weather.temperature} °C`;
    label.speed.innerHTML = `Wind Speed: ${data.current_weather.windspeed} kph`;
    label.weat.innerHTML = `Weather: ${code}`;
  } else {
    label.lat.innerHTML = `Latitude: ${latitude}°`;
    label.long.innerHTML = `Longitude: ${longitude}°`;
    label.temp.innerHTML = `Temperature ${Number(
      convertTemp(data.current_weather.temperature).toFixed(2)
    )} °F`;
    label.speed.innerHTML = `Wind Speed: ${Number(
      Math.round(data.current_weather.windspeed * 0.621371).toFixed(2)
    )} mph`;
    label.weat.innerHTML = `Weather: ${code}`;
  }
}
function marker({ x, y }) {
  ctx.beginPath(); // starts circle
  ctx.arc(x, y, 5, 0, Math.PI * 2); // x,y , radius, start angle, end angle.
  ctx.fillStyle = "red";
  ctx.fill();
}

function convertTemp(temp) {
  return (9 / 5) * temp + 32;
}
