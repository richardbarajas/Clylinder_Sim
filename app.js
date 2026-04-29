// Positions: cylinder extends DOWNWARD
// Pos 0: fully retracted (both stages in)
// Pos 1: stage 1 mid extend
// Pos 2: stage 1 full (picks up totes)
// Pos 3: both stages full extend (tote stack up, cylinder retracted = pos 3 in manual)
const POSITIONS = [
  { label: "Retracted",    stage1: 0,   stage2: 0,   pct: 0 },
  { label: "Mid Extend",   stage1: 50,  stage2: 0,   pct: 33 },
  { label: "Pick Totes",   stage1: 100, stage2: 0,   pct: 66 },
  { label: "Full Extend",  stage1: 100, stage2: 100, pct: 100 },
];

const STAGE1_MAX = 120; // px
const STAGE2_MAX = 100;

const stage1 = document.getElementById("stage1");
const stage2 = document.getElementById("stage2");
const statusEl = document.getElementById("status");
const buttons = document.querySelectorAll(".pos-btn");
const sliders = document.querySelectorAll(".flow-slider");
const speedText = document.getElementById("speed-text");

let flowTurns = 8; // default 8 turns out

function getSpeed() {
  // Average of all 4 valve settings
  let total = 0;
  sliders.forEach(s => total += parseInt(s.value));
  return total / sliders.length;
}

function getTransitionDuration() {
  const avg = getSpeed();
  // More turns out = faster (less restriction)
  // 0 turns = very slow (3s), 16 turns = very fast (0.3s)
  return (3 - (avg / 16) * 2.7).toFixed(2);
}

function updateSpeed() {
  const avg = getSpeed();
  const dur = getTransitionDuration();

  // Update display
  sliders.forEach(s => {
    const val = s.closest(".valve").querySelector(".valve-val");
    val.textContent = s.value + " turns";
  });

  let label = "Normal";
  if (avg <= 3) label = "⚠️ Too Slow — may fault";
  else if (avg <= 6) label = "Slow";
  else if (avg <= 10) label = "Normal";
  else if (avg <= 14) label = "Fast";
  else label = "⚠️ Too Fast — reduce turns";

  speedText.textContent = label;

  // Update transition speeds
  stage1.style.transitionDuration = dur + "s";
  stage2.style.transitionDuration = dur + "s";
}

function actuate(posIndex) {
  const pos = POSITIONS[posIndex];
  const dur = getTransitionDuration();

  stage1.style.transitionDuration = dur + "s";
  stage2.style.transitionDuration = dur + "s";

  // Stage 1 extends downward
  stage1.style.height = (pos.stage1 / 100 * STAGE1_MAX) + "px";

  // Stage 2 extends downward out of stage 1
  stage2.style.height = (pos.stage2 / 100 * STAGE2_MAX) + "px";

  // Buttons
  buttons.forEach((btn, i) => btn.classList.toggle("active", i === posIndex));

  // Status
  const dotClass = pos.pct === 0 ? "retracted" : pos.pct === 100 ? "extended" : "moving";
  statusEl.innerHTML = `
    <span class="status-dot ${dotClass}"></span>
    Position: <strong>${pos.label}</strong> — Stage 1: ${pos.stage1}% · Stage 2: ${pos.stage2}%
  `;
}

// Button clicks
buttons.forEach((btn, i) => btn.addEventListener("click", () => actuate(i)));

// Flow sliders
sliders.forEach(s => s.addEventListener("input", updateSpeed));

// Init
updateSpeed();
actuate(0);
