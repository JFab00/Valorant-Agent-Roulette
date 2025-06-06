// Fallback image for when API images fail to load
const fallbackImage =
  "https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/blt6577b1f58530e6b2/5eb26f54402b8b4d13a56656/agent.png";

let agentData = [];
let availableAgents = [];
let recentWinners = [];
const maxHistory = 5;
let isSpinning = false;
let skipSplash = false;
let muteSfx = false;

let scroll, spinSound, winSound;

function updateCheckboxState(container, checkbox) {
  container.classList.toggle("checked", checkbox.checked);
}

function toggleSettings() {
  const panel = document.getElementById("settings-panel");
  applyWinnerGradientOverlay([]);
  panel.classList.toggle("open");
  const overlay = document.getElementById("overlay");
  overlay.classList.toggle("show");
}

function saveSettings() {
  availableAgents = [];
  agentData.forEach((agent) => {
    const checkbox = document.getElementById(`agent-${agent.name}`);
    if (checkbox?.checked) availableAgents.push(agent);
  });
  if (availableAgents.length === 0)
    return alert("Please select at least one agent!");
  skipSplash = document.getElementById("skip-splash-checkbox")?.checked;
  muteSfx = document.getElementById("mute-sfx-checkbox")?.checked;
  localStorage.setItem("skipSplash", skipSplash);
  localStorage.setItem("muteSfx", muteSfx);
  toggleSettings();
  updateSpinButton();
}

function updateSpinButton() {
  const spinButton = document.getElementById("spin-button");
  spinButton.disabled = availableAgents.length === 0;
}

function updateCheckboxState(container, checkbox) {
  container.classList.toggle("checked", checkbox.checked);
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getAgentUUID(agentName) {
  const agent = agentData.find((a) => a.name === agentName);
  return agent ? agent.uuid : "";
}

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(
    result[3],
    16
  )}`;
}

function applyWinnerGradientOverlay(colors) {
  const overlay = document.getElementById("overlay");
  if (colors.length >= 4) {
    const rgbaStops = colors
      .map((hex, i) => `rgba(${hexToRgb(hex)}, 0.3) ${i * 33}%`)
      .join(", ");
    overlay.style.background = `linear-gradient(90deg, ${rgbaStops})`;
  } else {
    overlay.style.background = "rgba(0, 0, 0, 0.85)";
  }
}

async function fetchAgentData() {
  try {
    const res = await fetch(
      "https://valorant-api.com/v1/agents?isPlayableCharacter=true"
    );
    const json = await res.json();
    return json.data.map((agent) => ({
      name: agent.displayName,
      uuid: agent.uuid,
      role: agent.role?.displayName || "Unknown",
      displayIcon: agent.displayIcon,
      splash: agent.fullPortrait,
      backgroundGradientColors: (agent.backgroundGradientColors || []).map(
        (color) => color.slice(0, 6)
      ),
      backgroundImage: agent.background,
    }));
  } catch (err) {
    console.error("Error fetching agent data:", err);
    return [];
  }
}

function initializeSettings() {
  agentData.forEach((agent) => {
    const container = document.getElementById(`agents-${agent.role}`);
    if (!container) return;
    const div = document.createElement("div");
    div.className = `agent-checkbox ${
      availableAgents.some((a) => a.name === agent.name) ? "checked" : ""
    }`;
    div.innerHTML = `
      <img src="${agent.displayIcon}" alt="${
      agent.name
    }" onerror="this.src='${fallbackImage}'">
      <div class="agent-label">${agent.name}</div>
      <input type="checkbox" id="agent-${agent.name}" ${
      availableAgents.some((a) => a.name === agent.name) ? "checked" : ""
    }>
    `;
    const checkbox = div.querySelector("input");
    div.addEventListener("click", (e) => {
      if (e.target !== checkbox) {
        checkbox.checked = !checkbox.checked;
        updateCheckboxState(div, checkbox);
        e.preventDefault();
      }
    });
    checkbox.addEventListener("change", () =>
      updateCheckboxState(div, checkbox)
    );
    container.appendChild(div);
  });
}

function updateRecentDisplay() {
  const container = document.getElementById("recent-agents");
  container.innerHTML = "";
  recentWinners
    .slice()
    .reverse()
    .forEach((name) => {
      const agent = agentData.find((a) => a.name === name);
      if (!agent) return;
      const div = document.createElement("div");
      div.className = "recent-agent pop-in";
      div.style.backgroundImage = `url(${agent.displayIcon}), url(${fallbackImage})`;
      const label = document.createElement("div");
      label.className = "recent-agent-name";
      label.textContent = name;
      div.appendChild(label);
      container.appendChild(div);
      requestAnimationFrame(() => {
        div.classList.add("pop-in-active");
      });
    });
}

function createConfetti(colors) {
  const container = document.getElementById("winner-display");
  // const colors = ["#ff4655", "#ffffff", "#0f1923", "#ece8e1"];
  for (let i = 0; i < 150; i++) {
    const confetti = document.createElement("div");
    confetti.className = "confetti";
    confetti.style.left = Math.random() * 100 + "vw";
    confetti.style.top = "-10px";
    confetti.style.backgroundColor = `#${
      colors[Math.floor(Math.random() * colors.length)]
    }`;
    confetti.style.width = Math.random() * 10 + 5 + "px";
    confetti.style.height = Math.random() * 10 + 5 + "px";
    confetti.style.animationDelay = Math.random() * 2 + "s";
    confetti.style.animationDuration = Math.random() * 3 + 2 + "s";
    if (Math.random() > 0.5) confetti.style.borderRadius = "50%";
    else if (Math.random() > 0.7)
      confetti.style.clipPath = "polygon(50% 0%, 0% 100%, 100% 100%)";
    container.appendChild(confetti);
  }
}

function closeWinner() {
  const winnerDisplay = document.getElementById("winner-display");
  winnerDisplay.classList.remove("show");
  setTimeout(() => {
    winnerDisplay.style.display = "none";
    const overlay = document.getElementById("overlay");
    overlay.classList.remove("show");
    document.querySelectorAll(".confetti").forEach((el) => el.remove());
  }, 500);
}

function showWinner(winner) {
  console.log(winner);
  const winnerDisplay = document.getElementById("winner-display");
  const winnerSplash = document.getElementById("winner-splash");
  const winnerName = document.getElementById("winner-name");
  const winnerBG = document.getElementById("winner-background-image");
  const closeButton = document.getElementById("close-winner");
  winnerDisplay.style.display = "flex";
  winnerDisplay.classList.remove("show");
  void winnerDisplay.offsetHeight;
  winnerSplash.style.backgroundImage = `url(${winner.splash}), url(${fallbackImage})`;
  winnerBG.style.backgroundImage = `url(${winner.backgroundImage}), url(${fallbackImage})`;
  winnerName.textContent = winner.name;
  winnerName.style.textShadow = ` 0 0 10px #${winner.backgroundGradientColors[0]}, 0 0 20px #${winner.backgroundGradientColors[0]}, 0 0 30px #${winner.backgroundGradientColors[0]}`;
  // text-shadow: 0 0 10px #ff4655, 0 0 20px #ff4655, 0 0 30px #ff4655;
  closeButton.style.backgroundColor = `#${winner.backgroundGradientColors[0]}`;
  closeButton.style.boxShadow = ` 0 0 20px #${winner.backgroundGradientColors[0]}`;
  // box-shadow: 0 0 20px rgba(255, 70, 85, 0.6);
  setTimeout(() => {
    const overlay = document.getElementById("overlay");
    applyWinnerGradientOverlay(winner.backgroundGradientColors);
    overlay.classList.add("show");
    winnerDisplay.classList.add("show");
    createConfetti(winner.backgroundGradientColors);
  }, 10);
}

function startRoulette() {
  const spinButton = document.getElementById("spin-button");
  const settingsButton = document.getElementById("settings-button");

  if (isSpinning || availableAgents.length === 0) return;
  spinButton.disabled = true;
  settingsButton.disabled = true;
  isSpinning = true;
  scroll.innerHTML = "";

  if (!muteSfx) {
    spinSound.currentTime = 0;
    spinSound.loop = true;
    spinSound.volume = 0.3;
    spinSound.play().catch(console.warn);
  }

  const eligible = availableAgents.filter(
    (a) => !recentWinners.includes(a.name)
  );
  const winnerPool = eligible.length > 0 ? eligible : availableAgents;

  const winner = winnerPool[Math.floor(Math.random() * winnerPool.length)];
  const prefix = shuffle(availableAgents);
  const suffix = shuffle(availableAgents);
  const displayList = [
    ...prefix,
    ...shuffle(availableAgents),
    winner,
    ...suffix,
  ];

  displayList.forEach((agent) => {
    const div = document.createElement("div");
    div.className = "agent";
    div.style.backgroundImage = `url(${agent.displayIcon}), url(${fallbackImage})`;
    div.innerHTML = `<div class="agent-name">${agent.name}</div>`;
    scroll.appendChild(div);
  });

  const itemWidth = 123.97;
  // const winnerIndex = Math.floor(displayList.indexOf(winner));
  const winnerIndex = prefix.length + availableAgents.length;
  const containerCenter = 302;
  const targetOffset =
    winnerIndex * itemWidth + itemWidth / 2 - containerCenter;

  const duration = 3500;
  const startTime = performance.now();

  function animate(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const position = targetOffset * easeOutCubic(progress);

    scroll.style.left = `-${position}px`;

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      spinSound.pause();
      spinSound.currentTime = 0;

      if (!muteSfx) {
        winSound.currentTime = 0;
        winSound.volume = 0.6;
        winSound.play().catch(console.warn);
      }

      isSpinning = false;
      setTimeout(() => {
        if (!skipSplash) showWinner(winner);
        recentWinners.push(winner.name);
        if (recentWinners.length > maxHistory) recentWinners.shift();

        updateRecentDisplay();
        spinButton.disabled = false;
        settingsButton.disabled = false;
      }, 100);
    }
  }
  requestAnimationFrame(animate);
}

async function initializeApp() {
  agentData = await fetchAgentData();
  console.log(agentData);
  if (agentData.length === 0) {
    alert("Failed to load agents. Please check your internet connection.");
    return;
  }
  const savedAgents = localStorage.getItem("valorantAvailableAgents");
  if (savedAgents) {
    const names = JSON.parse(savedAgents);
    availableAgents = agentData.filter((agent) => names.includes(agent.name));
  } else {
    availableAgents = [...agentData];
  }
  const savedWinners = localStorage.getItem("recentWinners");
  if (savedWinners) recentWinners = JSON.parse(savedWinners);
  const savedSkip = localStorage.getItem("skipSplash");
  if (savedSkip) skipSplash = savedSkip === "true";
  const skipCheckbox = document.getElementById("skip-splash-checkbox");
  if (skipCheckbox) skipCheckbox.checked = skipSplash;
  const savedMute = localStorage.getItem("muteSfx");
  if (savedMute) muteSfx = savedMute === "true";
  const muteCheckbox = document.getElementById("mute-sfx-checkbox");
  if (muteCheckbox) muteCheckbox.checked = muteSfx;
  initializeSettings();
  updateSpinButton();
  updateRecentDisplay();
}

window.addEventListener("beforeunload", () => {
  const agentNames = availableAgents.map((a) => a.name);
  localStorage.setItem("valorantAvailableAgents", JSON.stringify(agentNames));
  localStorage.setItem("recentWinners", JSON.stringify(recentWinners));
});

document.addEventListener("DOMContentLoaded", () => {
  scroll = document.getElementById("scroll");
  spinSound = new Audio("resources/spin-sound.mp3");
  winSound = new Audio("resources/winner-sound.mp3");

  const settingsButton = document.getElementById("settings-button");
  const spinButton = document.getElementById("spin-button");
  const saveSettingsButton = document.getElementById("save-settings");
  const closeWinnerButton = document.getElementById("close-winner");
  const overlay = document.getElementById("overlay");

  settingsButton?.addEventListener("click", toggleSettings);
  spinButton?.addEventListener("click", startRoulette);
  saveSettingsButton?.addEventListener("click", saveSettings);
  closeWinnerButton?.addEventListener("click", closeWinner);
  overlay?.addEventListener("click", toggleSettings);
  document
    .getElementById("close-settings")
    ?.addEventListener("click", toggleSettings);

  initializeApp();
});
