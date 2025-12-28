// ==============================
// GLOBAL STATE
// ==============================

let typingTimeout = null;
let isTyping = false;

let gameState = {
  variables: {},
  scenes: {},
  currentScene: "",
  currentBeatIndex: 0,
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

function loadScene(sceneId) {
  const scene = gameState.scenes[sceneId];
  if (!scene) {
    console.error("Scene not found:", sceneId);
    return;
  }

  gameState.currentScene = sceneId;
  gameState.currentBeatIndex = 0;

  document.body.style.backgroundImage = `url(${BG_PATH}${scene.background})`;

  document.getElementById("choices").innerHTML = "";
  document.getElementById("text").innerText = "";

  playCurrentBeat();
}

// ==============================
// PLAY CURRENT BEAT
// ==============================

function playCurrentBeat() {
  const scene = gameState.scenes[gameState.currentScene];
  const beat = scene.beats[gameState.currentBeatIndex];

  if (!beat) return;

  // Clear choices by default
  document.getElementById("choices").innerHTML = "";

  if (beat.type === "text") {
    typeText(beat.content);
  }

  if (beat.type === "choice") {
    renderChoices(beat.choices);
  }
}

// ==============================
// ADVANCE BEAT
// ==============================

function nextBeat() {
  const scene = gameState.scenes[gameState.currentScene];
  const beat = scene.beats[gameState.currentBeatIndex];

  // If typing → skip
  if (isTyping) {
    finishTyping(beat.content);
    return;
  }

  // If current beat is choice → do nothing
  if (beat.type === "choice") return;

  gameState.currentBeatIndex++;
  playCurrentBeat();
}

// ==============================
// TYPEWRITER EFFECT (NATURAL & SLOW)
// ==============================

function typeText(text) {
  const textEl = document.getElementById("text");

  if (typingTimeout) clearTimeout(typingTimeout);

  textEl.innerText = "";
  textEl.classList.add("typing");

  let index = 0;
  isTyping = true;

  function typeNext() {
    if (!isTyping) return;

    textEl.innerText += text[index];
    const char = text[index];
    index++;

    if (index >= text.length) {
      isTyping = false;
      textEl.classList.remove("typing");
      return;
    }

    let delay = 60;

    if (char === "." || char === "!" || char === "?") delay = 420;
    else if (char === "," || char === ";") delay = 220;
    else if (char === "\n") delay = 500;

    typingTimeout = setTimeout(typeNext, delay);
  }

  typeNext();
}

// ==============================
// FINISH TYPING INSTANTLY
// ==============================

function finishTyping(fullText) {
  if (typingTimeout) clearTimeout(typingTimeout);

  isTyping = false;

  const textEl = document.getElementById("text");
  textEl.innerText = fullText;
  textEl.classList.remove("typing");
}

// ==============================
// CLICK ANYWHERE TO CONTINUE
// ==============================

document.addEventListener("click", (e) => {
  // Ignore clicks on buttons
  if (e.target.tagName === "BUTTON") return;

  nextBeat();
});

// ==============================
// RENDER CHOICES
// ==============================

function renderChoices(choices) {
  const container = document.getElementById("choices");
  container.innerHTML = "";

  choices.forEach((choice, index) => {
    const btn = document.createElement("button");
    btn.innerText = choice.text;

    btn.onclick = (e) => {
      e.stopPropagation();
      applyEffects(choice.effects || {});
      loadScene(choice.next);
    };

    container.appendChild(btn);

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
