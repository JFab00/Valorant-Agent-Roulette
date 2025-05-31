
    // Agent data with image URLs (using official Valorant agent icons)
    const agentData = [
      { name: "Brimstone", uuid: "9f0d8ba9-4140-b941-57d3-a7ad57c6b417"},
      { name: "Viper", uuid: "707eab51-4836-f488-046a-cda6bf494859" },
      { name: "Omen", uuid: "8e253930-4c05-31dd-1b6c-968525494517" },
      { name: "Killjoy", uuid: "1e58de9c-4950-5125-93e9-a0aee9f98746" },
      { name: "Cypher", uuid: "117ed9e3-49f3-6512-3ccf-0cada7e3823b" },
      { name: "Sova", uuid: "320b2a48-4d9b-a075-30f1-1f93a9b638fa" },
      { name: "Sage", uuid: "569fdd95-4d10-43ab-ca70-79becc718b46" },
      { name: "Phoenix", uuid: "eb93336a-449b-9c1b-0a54-a891f7921d69" },
      { name: "Jett", uuid: "add6443a-41bd-e414-f6ad-e58d267f4e95" },
      { name: "Reyna", uuid: "a3bfb853-43b2-7238-a4f1-ad90e9e46bcc" },
      { name: "Raze", uuid: "f94c3b30-42be-e959-889c-5aa313dba261" },
      { name: "Breach", uuid: "5f8d3a7f-467b-97f3-062c-13acf203c006" },
      { name: "Skye", uuid: "6f2a04ca-43e0-be17-7f36-b3908627744d" },
      { name: "Yoru", uuid: "7f94d92c-4234-0a36-9646-3a87eb8b5c89" },
      { name: "Astra", uuid: "41fb69c1-4189-7b37-f117-bcaf1e96f1bf" },
      { name: "KAY/O", uuid: "601dbbe7-43ce-be57-2a40-4abd24953621" },
      { name: "Chamber", uuid: "22697a3d-45bf-8dd7-4fec-84a9e28c69d7" },
      { name: "Neon", uuid: "bb2a4828-46eb-8cd1-e765-15848195d751" },
      { name: "Fade", uuid: "dade69b4-4f5a-8528-247b-219e5a1facd6" },
      { name: "Harbor", uuid: "95b78ed7-4637-86d9-7e41-71ba8c293152" },
      { name: "Gekko", uuid: "e370fa57-4757-3604-3648-499e1f642d3f" },
      { name: "Deadlock", uuid: "cc8b64c8-4b25-4ff9-6e7f-37b4da43d235" },
      { name: "Iso", uuid: "0e38b510-41a8-5780-5e8f-568b2a4f2d6c" },
      { name: "Clove", uuid: "1dbf2edd-4729-0984-3115-daa5eed44993" }
    ];

// Fallback image for when API images fail to load
const fallbackImage = "https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/blt6577b1f58530e6b2/5eb26f54402b8b4d13a56656/agent.png";

document.addEventListener('DOMContentLoaded', function() {
    let availableAgents = [...agentData];
    const scroll = document.getElementById('scroll');
    let isSpinning = false;

    // DOM elements
    const settingsButton = document.getElementById('settings-button');
    const spinButton = document.getElementById('spin-button');
    const saveSettingsButton = document.getElementById('save-settings');
    const closeWinnerButton = document.getElementById('close-winner');
    const overlay = document.getElementById('overlay');

    // Event listeners
    settingsButton.addEventListener('click', toggleSettings);
    spinButton.addEventListener('click', startRoulette);
    saveSettingsButton.addEventListener('click', saveSettings);
    closeWinnerButton.addEventListener('click', closeWinner);
    overlay.addEventListener('click', toggleSettings);

    // Initialize settings panel
    function initializeSettings() {
  const container = document.getElementById('agent-selection');
  container.innerHTML = '';
  
  agentData.forEach(agent => {
    const div = document.createElement('div');
    div.className = `agent-checkbox ${availableAgents.some(a => a.name === agent.name) ? 'checked' : ''}`;
    div.innerHTML = `
      <img src="https://media.valorant-api.com/agents/${agent.uuid}/displayicon.png" alt="${agent.name}" onerror="this.src='${fallbackImage}'">
      <div class="agent-label">${agent.name}</div>
      <input type="checkbox" id="agent-${agent.name}" ${availableAgents.some(a => a.name === agent.name) ? 'checked' : ''}>
    `;
    
    // Get the checkbox element
    const checkbox = div.querySelector('input');
    
    // Handle clicks on the entire card
    div.addEventListener('click', function(e) {
      // Prevent double triggers when clicking directly on the checkbox
      if (e.target !== checkbox) {
        checkbox.checked = !checkbox.checked;
        updateCheckboxState(div, checkbox);
        e.preventDefault(); // Prevent any default behavior
      }
    });
    
    // Also handle checkbox changes directly
    checkbox.addEventListener('change', function() {
      updateCheckboxState(div, this);
    });
    
    container.appendChild(div);
  });
}

// Helper function to update visual state
function updateCheckboxState(container, checkbox) {
  container.classList.toggle('checked', checkbox.checked);
}

    // Toggle settings panel visibility
    function toggleSettings() {
      const panel = document.getElementById('settings-panel');
      
      if (panel.style.display === 'block') {
        panel.style.display = 'none';
        overlay.style.display = 'none';
      } else {
        initializeSettings();
        panel.style.display = 'block';
        overlay.style.display = 'block';
      }
    }

    // Save selected agents
    function saveSettings() {
      availableAgents = [];
      agentData.forEach(agent => {
        const checkbox = document.getElementById(`agent-${agent.name}`);
        if (checkbox.checked) {
          availableAgents.push(agent);
        }
      });
      
      // Ensure at least one agent is selected
      if (availableAgents.length === 0) {
        alert('Please select at least one agent!');
        return;
      }
      
      toggleSettings();
      updateSpinButton();
    }

    function shuffle(array) {
      const arr = [...array];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    }

    function startRoulette() {
      if (isSpinning || availableAgents.length === 0) return;
      
      // Disable spin button during animation
      spinButton.disabled = true;
      isSpinning = true;
      scroll.innerHTML = '';

      const winner = availableAgents[Math.floor(Math.random() * availableAgents.length)];
      const prefix = shuffle(availableAgents);
      const suffix = shuffle(availableAgents);
      const displayList = [...prefix, ...shuffle(availableAgents), winner, ...suffix];

      displayList.forEach(agent => {
        const div = document.createElement('div');
        div.className = 'agent';
        div.style.backgroundImage = `url(https://media.valorant-api.com/agents/${agent.uuid}/displayicon.png), url(${fallbackImage})`;
        div.innerHTML = `<div class="agent-name">${agent.name}</div>`;
        // Add error handling for the background image
        div.onerror = function() {
          this.style.backgroundImage = `url(${fallbackImage})`;
        };
        scroll.appendChild(div);
      });

      const itemWidth = 120; // Width + margin of each agent item
      const winnerIndex = prefix.length + availableAgents.length;
      const containerCenter = 190; // Half of #roulette-container width (250px)
      const targetOffset = (winnerIndex * itemWidth + itemWidth / 2) - containerCenter;

      const duration = 3000; // animation duration in milliseconds
      const startTime = performance.now();

      function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const position = targetOffset * easeOutCubic(progress);

        scroll.style.left = `-${position}px`;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          isSpinning = false;
          setTimeout(() => {
            showWinner(winner);
            spinButton.disabled = false;
          }, 100);
        }
      }

      requestAnimationFrame(animate);
    }

    function showWinner(winner) {
  const winnerDisplay = document.getElementById('winner-display');
  const winnerSplash = document.getElementById('winner-splash');
  const winnerName = document.getElementById('winner-name');
  
  // Reset initial state
  winnerDisplay.style.display = 'flex';
  winnerDisplay.classList.remove('show');
  
  // Force reflow to enable animation
  void winnerDisplay.offsetHeight;
  
  // Set content
  winnerSplash.style.backgroundImage = `url(https://media.valorant-api.com/agents/${getAgentUUID(winner.name)}/fullportrait.png), url(${fallbackImage})`;
  winnerName.textContent = winner.name;
  
  // Trigger animations
  setTimeout(() => {
    document.getElementById('overlay').style.display = 'block';
    winnerDisplay.classList.add('show');
    createConfetti();
  }, 10);
}

// Helper function to get agent UUID (you'll need to add this to your agentData)
function getAgentUUID(agentName) {
  const agent = agentData.find(a => a.name === agentName);
  return agent ? agent.uuid : '';
}

// Confetti effect
function createConfetti() {
  const container = document.getElementById('winner-display');
  const colors = ['#ff4655', '#ffffff', '#0f1923', '#ece8e1'];
  
  for (let i = 0; i < 150; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.top = '-10px'; // Start above the viewport
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.width = Math.random() * 10 + 5 + 'px';
    confetti.style.height = Math.random() * 10 + 5 + 'px';
    confetti.style.animationDelay = Math.random() * 2 + 's';
    confetti.style.animationDuration = Math.random() * 3 + 2 + 's';
    
    // Random shapes
    if (Math.random() > 0.5) {
      confetti.style.borderRadius = '50%';
    } else if (Math.random() > 0.7) {
      confetti.style.clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)';
    }
    
    container.appendChild(confetti);
  }
}

function closeWinner() {
  const winnerDisplay = document.getElementById('winner-display');
  winnerDisplay.classList.remove('show');
  
  setTimeout(() => {
    winnerDisplay.style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
    document.querySelectorAll('.confetti').forEach(el => el.remove());
  }, 500); // Match this with your longest transition duration
}

    function updateSpinButton() {
      spinButton.disabled = availableAgents.length === 0;
    }

    // Easing function for smooth deceleration
    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    // Initialize on load
    const savedAgents = localStorage.getItem('valorantAvailableAgents');
    if (savedAgents) {
      const savedAgentNames = JSON.parse(savedAgents);
      availableAgents = agentData.filter(agent => savedAgentNames.includes(agent.name));
    }
    updateSpinButton();

    // Save to localStorage when window is closed
    window.addEventListener('beforeunload', function() {
      const agentNames = availableAgents.map(agent => agent.name);
      localStorage.setItem('valorantAvailableAgents', JSON.stringify(agentNames));
    });
});