// ==============================
// GLOBAL STATE
// ==============================

let typingInterval = null;
let isTyping = false;

let gameState = {
  variables: {},
  scenes: {},
  currentScene: "",
};

const BG_PATH = "assets/backgrounds/";

// ==============================
// INIT GAME
// ==============================

async function initGame() {
  try {
    console.log("GAME SCRIPT LOADED");

    const res = await fetch("./data/story.json");
    const story = await res.json();

    gameState.variables = { ...story.variables };
    gameState.scenes = story.scenes;

    loadScene(story.start);
  } catch (err) {
    console.error("Failed to load story.json", err);
  }
}

// ==============================
// LOAD SCENE
// ==============================

function loadScene(id) {
  const scene = gameState.scenes[id];

  if (!scene) {
    console.error("Scene not found:", id);
    return;
  }

  gameState.currentScene = id;

  // Set background
  document.body.style.backgroundImage = `url(${BG_PATH}${scene.background})`;

  // Clear choices immediately
  const choicesEl = document.getElementById("choices");
  choicesEl.innerHTML = "";

  // Type text, then show choices with a pause
  typeText(scene.text, () => {
    setTimeout(() => {
      renderChoices(scene.choices || []);
    }, 400);
  });
}

// ==============================
// TYPEWRITER EFFECT
// ==============================

function typeText(text, onComplete) {
  const textEl = document.getElementById("text");

  if (typingInterval) clearInterval(typingInterval);

  textEl.innerText = "";
  textEl.classList.add("typing");

  let index = 0;
  isTyping = true;

  typingInterval = setInterval(() => {
    textEl.innerText += text[index];
    index++;

    if (index >= text.length) {
      clearInterval(typingInterval);
      textEl.classList.remove("typing");
      isTyping = false;
      if (onComplete) onComplete();
    }
  }, 25);
}

// ==============================
// CLICK TO SKIP TYPING
// ==============================

document.addEventListener("click", () => {
  if (!isTyping) return;

  clearInterval(typingInterval);
  isTyping = false;

  const textEl = document.getElementById("text");
  const scene = gameState.scenes[gameState.currentScene];

  textEl.innerText = scene.text;
  textEl.classList.remove("typing");

  setTimeout(() => {
    renderChoices(scene.choices || []);
  }, 200);
});

// ==============================
// RENDER CHOICES (SMOOTH APPEAR)
// ==============================

function renderChoices(choices) {
  const container = document.getElementById("choices");
  container.innerHTML = "";

  choices.forEach((choice, index) => {
    const btn = document.createElement("button");
    btn.innerText = choice.text;

    btn.onclick = (e) => {
      e.stopPropagation(); // prevent click-skip conflict
      applyEffects(choice.effects || {});
      loadScene(choice.next);
    };

    container.appendChild(btn);

    // staggered fade-in
    setTimeout(() => {
      btn.classList.add("show");
    }, 300 + index * 150);
  });
}

// ==============================
// APPLY EFFECTS
// ==============================

function applyEffects(effects) {
  for (let key in effects) {
    if (!(key in gameState.variables)) {
      gameState.variables[key] = 0;
    }
    gameState.variables[key] += effects[key];
  }
}

// ==============================
// START GAME
// ==============================

initGame();
