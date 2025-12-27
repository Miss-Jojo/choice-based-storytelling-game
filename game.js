let gameState = {
  variables: {},
  scenes: {},
  currentScene: "",
};

async function initGame() {
  const res = await fetch("datastory.json");
  const story = await res.json();

  gameState.variables = { ...story.variables };
  gameState.scenes = story.scenes;

  loadScene(story.start);
}

function loadScene(id) {
  gameState.currentScene = id;
  const scene = gameState.scenes[id];

  document.getElementById("text").innerText = scene.text;
  document.body.style.backgroundImage = `url(assets/backgrounds/${scene.background})`;

  renderChoices(scene.choices);

  if (!scene) {
    console.error("Scene not found:", id);
    return;
  }
}

function renderChoices(choices) {
  const container = document.getElementById("choices");
  container.innerHTML = "";

  choices.forEach((choice) => {
    const btn = document.createElement("button");
    btn.innerText = choice.text;

    btn.onclick = () => {
      applyEffects(choice.effects);
      loadScene(choice.next);
    };

    container.appendChild(btn);
  });
}

function applyEffects(effects) {
  for (let key in effects) {
    gameState.variables[key] += effects[key];
  }
}

initGame();
