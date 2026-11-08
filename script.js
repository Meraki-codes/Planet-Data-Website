const root = document.documentElement;
const toggleBtn = document.getElementById("toggle-dark");
const icon = document.getElementById("icon");
const searchBtn = document.getElementById("searchbtn");
const searchInput = document.getElementById("search-planet");

function updateButton() {
  const isDark = root.classList.contains("dark");
  icon.className = isDark ? "fa-solid fa-sun" : "fa-solid fa-moon";
  toggleBtn.firstChild.textContent = isDark ? "Light" : "Dark";
}

const saved = localStorage.getItem("theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

if (saved === "dark" || (!saved && prefersDark)) {
  root.classList.add("dark");
}

updateButton();

toggleBtn.addEventListener("click", () => {
  root.classList.toggle("dark");
  localStorage.setItem(
    "theme",
    root.classList.contains("dark") ? "dark" : "light",
  );
  updateButton();
});

let planets = [];

async function loadPlanets() {
  try {
    const response = await fetch(
      "https://raw.githubusercontent.com/Anurella/Anurella.github.io/refs/heads/master/json/planet.json",
    );
    if (!response.ok) throw new Error("Request failed");
    planets = await response.json();
    console.log(planets);

    const earth = planets.find((p) => p.name === "Earth");
    if (earth) showDetails(earth);

    const table = document.getElementById("table-data");
    const seen = [];

    const rows = planets.map((planet) => {
      let category = "";

      if (planet.type === "Terrestrial" && !seen.includes("Terrestrial")) {
        const count = planets.filter((p) => p.type === "Terrestrial").length;
        category += `<th rowspan="${count}" colspan="2">Terrestrial Planets</th>`;
        seen.push("Terrestrial");
      }

      if (planet.type === "Gas Giant") {
        if (!seen.includes("Jovian")) {
          const count = planets.filter(
            (p) => p.type === "Gas Giant" || p.type === "Ice Giant",
          ).length;
          category += `<th rowspan="${count}">Jovian Planets</th>`;
          seen.push("Jovian");
        }
        if (!seen.includes("Gas Giant")) {
          const count = planets.filter((p) => p.type === "Gas Giant").length;
          category += `<th rowspan="${count}">Gas Giant</th>`;
          seen.push("Gas Giant");
        }
      }

      if (planet.type === "Ice Giant" && !seen.includes("Ice Giant")) {
        const count = planets.filter((p) => p.type === "Ice Giant").length;
        category += `<th rowspan="${count}">Ice Giant</th>`;
        seen.push("Ice Giant");
      }

      if (planet.type === "Dwarf Planet") {
        category += `<th colspan="2">Dwarf Planets</th>`;
      }

      return `<tr>
    ${category}
    <td>${planet.name}</td>
    <td>${planet.mass}</td>
    <td>${planet.diameter}</td>
  </tr>`;
    });

    table.innerHTML = rows.join("");
  } catch (error) {
    console.error(error);
    alert("Unable to fetch results");
  }
}

function showDetails(planet) {
  const planetContainer = document.getElementById("planet-info");
  planetContainer.innerHTML = `<div class="planet-image">
          <img id="planImage" src="${planet.image}" alt="Planet Image" />
        </div>

        <div class="planet-data">
          <div class="planet-title">
            <h2 id="planet-name">${planet.name}</h2>
            <small id="planet-type">${planet.type}</small>
          </div>

          <div class="planet-description">
            <p id="planet-description">
              ${planet.description}
            </p>
          </div>

          <div class="planet-stats">
            <div class="planet-stat">
              <span class="stat-label">Gravity</span>
              <span class="stat-value" id="gravity">${planet.gravity}</span>
            </div>

            <div class="planet-stat">
              <span class="stat-label">Mass</span>
              <span class="stat-value" id="mass">${planet.mass}</span>
            </div>

            <div class="planet-stat">
              <span class="stat-label">Period</span>
              <span class="stat-value" id="period">${planet.period}</span>
            </div>
          </div>

          <div class="planet-numbers">
            <div class="number-container">
              <i class="fa-solid fa-temperature-low"></i>
              <span class="number-value" id="temperature">${planet.temperature}</span>
            </div>

            <div class="number-container">
              <i class="fa-solid fa-moon"></i>
              <span class="number-value" id="moon">${planet.moons}</span>
            </div>

            <div class="number-container">
              <i class="fa-solid fa-circle"></i>
              <span class="number-value" id="sun">${planet.diameter}</span>
            </div>

            <div class="number-container">
              <i class="fa-regular fa-sun"></i>
              <span class="number-value" id="distance">${planet.distanceFromSun}</span>
            </div>
          </div>
        </div>`;
}

function showSuggestions(list) {
  const ul = document.getElementById("suggestions");
  ul.replaceChildren();

  list.forEach((p) => {
    const li = document.createElement("li");
    li.textContent = p.name;
    li.addEventListener("click", () => {
      showDetails(p);
      searchInput.value = p.name;
      ul.replaceChildren();
    });
    ul.appendChild(li);
  });
}

function getMatches(query) {
  return planets.filter((p) => p.name.toLowerCase().startsWith(query));
}

searchInput.addEventListener("input", (e) => {
  const query = e.target.value.toLowerCase().trim();
  if (!query) {
    showSuggestions([]);
    return;
  }
  showSuggestions(getMatches(query));
});

searchBtn.addEventListener("click", () => {
  const query = searchInput.value.toLowerCase().trim();
  const matches = getMatches(query);

  const small = document.querySelector(".error");
  if (!query || !matches.length) {
    small.classList.remove("hidden");
    small.textContent = "Not found";
    return;
  }
  small.classList.add("hidden");
  showDetails(matches[0]);
  const ul = document.getElementById("suggestions");
  ul.replaceChildren();
});

document.getElementById("form").addEventListener("submit", (e) => {
  e.preventDefault();
});

loadPlanets();
