// --- San Francisco Bay-Delta Fish Species Data ---
const fishSpecies = [
  {
    id: "delta_smelt",
    name: "Delta Smelt",
    scientific: "Hypomesus transpacificus",
    image: "images/delta_smelt.png",
    // 15 bases: 4 conserved start (ATGC), 7 unique, 4 conserved end (CGTA)
    sequence: "ATGCTTTACGCCGTA", 
    facts: [
      "Delta Smelt are tiny, translucent fish that grow to about 2-3 inches long.",
      "They smell like fresh cucumbers when caught! 🥒",
      "They live only in the San Francisco Estuary and are a key indicator of the Bay-Delta's health."
    ]
  },
  {
    id: "chinook_salmon",
    name: "Chinook Salmon",
    scientific: "Oncorhynchus tshawytscha",
    image: "images/chinook_salmon.png",
    sequence: "ATGCAGGTCCACGTA",
    facts: [
      "Chinook Salmon are the largest of the Pacific salmon, often called 'King Salmon'.",
      "They are born in fresh water, swim out to the ocean to grow, and return to their birth rivers to spawn.",
      "They travel hundreds of miles upstream, climbing fish ladders and leaping over rocks! 🧗‍♂️"
    ]
  },
  {
    id: "striped_bass",
    name: "Striped Bass",
    scientific: "Morone saxatilis",
    image: "images/striped_bass.png",
    sequence: "ATGCGGAACCTCGTA",
    facts: [
      "Striped Bass have 7 to 8 dark horizontal stripes along their silver sides.",
      "They were brought to California from the East Coast in 1879 by train! 🚂",
      "They are excellent, fast swimmers that love to hunt in schools."
    ]
  },
  {
    id: "green_sturgeon",
    name: "Green Sturgeon",
    scientific: "Acipenser medirostris",
    image: "images/green_sturgeon.png",
    sequence: "ATGCCACAGTGCGTA",
    facts: [
      "Sturgeons are prehistoric fish that lived at the same time as dinosaurs! 🦖",
      "They don't have scales; instead, they have rows of bony plates called scutes.",
      "Green Sturgeon can live for over 50 years and grow up to 7 feet long!"
    ]
  },
  {
    id: "pacific_herring",
    name: "Pacific Herring",
    scientific: "Clupea pallasii",
    image: "images/pacific_herring.png",
    sequence: "ATGCTCGATCGCGTA",
    facts: [
      "Pacific Herring lay millions of sticky eggs on eelgrass in San Francisco Bay every winter.",
      "Their spawning creates a wildlife feast, attracting thousands of birds, seals, and whales! 🦅🐳",
      "They have shiny, silver bodies that reflect light, helping them hide in schooling groups."
    ]
  }
];

// --- Web Audio Synthesizer for Zero-Asset SFX ---
let audioCtx = null;

function playSound(type) {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    const now = audioCtx.currentTime;

    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(350, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.04);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (type === 'snap') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(700, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.06);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);
      osc.start(now);
      osc.stop(now + 0.06);
    } else if (type === 'align') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.06); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.12); // G5
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.setValueAtTime(0.15, now + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'success-scan') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.25);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'win') {
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // Fanfare C4 to C6
      notes.forEach((freq, idx) => {
        const oscNode = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscNode.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscNode.type = 'sine';
        oscNode.frequency.setValueAtTime(freq, now + idx * 0.05);
        gainNode.gain.setValueAtTime(0.1, now + idx * 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.005, now + idx * 0.05 + 0.4);
        oscNode.start(now + idx * 0.05);
        oscNode.stop(now + idx * 0.05 + 0.4);
      });
    } else if (type === 'fail') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.linearRampToValueAtTime(110, now + 0.25);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    }
  } catch (e) {
    console.warn("AudioContext initialization failed or blocked", e);
  }
}

// --- Game State Variables ---
let scrambledOffsets = {}; // { speciesId: current_offset }
let mysterySpecies = null;
let mysteryOffset = 0;
let isKnownAligned = false;
let isMysteryAligned = false;
let currentMysteryMatchPercent = 0;

// Game constants
const CONSERVED_LEN = 4; // 4 conserved bases at start and end
const SEQ_START_COL = 2; // base offset 0 starts at index 2 of grid

// --- Init Game ---
function initGame() {
  isKnownAligned = false;
  isMysteryAligned = false;
  currentMysteryMatchPercent = 0;
  
  // 1. Select Mystery Fish species randomly
  const randIndex = Math.floor(Math.random() * fishSpecies.length);
  mysterySpecies = fishSpecies[randIndex];

  // 2. Scramble offsets for all 5 known species (between -4 and +4, but not 0)
  scrambledOffsets = {};
  fishSpecies.forEach(fish => {
    let offset = 0;
    while (offset === 0) {
      offset = Math.floor(Math.random() * 9) - 4; // -4 to 4
    }
    scrambledOffsets[fish.id] = offset;
  });

  // 3. Scramble Mystery offset (between -4 and +4)
  mysteryOffset = 0;
  while (mysteryOffset === 0) {
    mysteryOffset = Math.floor(Math.random() * 9) - 4;
  }

  // 4. Render Board UI
  renderKnownRows();
  renderMysteryRow();
  renderSpeciesChoices();

  // Hide guessing panel and success modals
  document.getElementById('identity-panel').classList.add('hidden');
  document.getElementById('modal-success').classList.add('hidden');
  document.getElementById('instruction-text').innerText = "Drag the fish DNA tracks left or right to align them! Look for matching color columns.";
  document.getElementById('info-banner').style.borderColor = "rgba(0, 180, 216, 0.25)";
  document.getElementById('info-banner').style.background = "rgba(0, 180, 216, 0.1)";
  
  // Update viewport sizing and verify alignment
  checkAlignment();
}

// Render the 5 known species rows
function renderKnownRows() {
  const container = document.getElementById('rows-container');
  container.innerHTML = '';

  fishSpecies.forEach(fish => {
    const rowEl = document.createElement('div');
    rowEl.className = 'align-row';
    rowEl.id = `row-${fish.id}`;
    
    // Label Badge
    const labelBadge = `
      <div class="species-label-badge">
        <div class="fish-avatar-circle">
          <img src="${fish.image}" alt="${fish.name}">
        </div>
        <div class="fish-info">
          <span class="name">${fish.name}</span>
          <span class="scientific">${fish.scientific}</span>
        </div>
      </div>
    `;

    // DNA view container
    const viewportContainer = document.createElement('div');
    viewportContainer.className = 'sequence-viewport-container';

    const viewport = document.createElement('div');
    viewport.className = 'sequence-viewport';
    
    const track = document.createElement('div');
    track.className = 'sequence-track';
    
    // Render bases
    for (let j = 0; j < fish.sequence.length; j++) {
      const base = fish.sequence[j];
      const baseBlock = document.createElement('div');
      baseBlock.className = `base-block base-${base.toLowerCase()}`;
      baseBlock.innerText = base;
      
      // Highlight conserved ends (first 4 and last 4 bases)
      if (j < CONSERVED_LEN || j >= fish.sequence.length - CONSERVED_LEN) {
        baseBlock.classList.add('conserved');
      }
      track.appendChild(baseBlock);
    }
    
    viewport.appendChild(track);
    viewportContainer.appendChild(viewport);

    // Controls
    const controls = `
      <div class="controls-status-col">
        <div class="nudge-buttons">
          <button class="nudge-btn nudge-left" data-fish="${fish.id}">◀</button>
          <button class="nudge-btn nudge-right" data-fish="${fish.id}">▶</button>
        </div>
        <div class="status-indicator" id="status-${fish.id}">❌</div>
      </div>
    `;

    rowEl.innerHTML = labelBadge;
    rowEl.appendChild(viewportContainer);
    rowEl.innerHTML += controls;
    container.appendChild(rowEl);

    // Attach drag interaction
    setupDragInteraction(viewport, track, fish.id, (newOffset) => {
      scrambledOffsets[fish.id] = newOffset;
      checkAlignment();
    });
  });

  // Attach button click events
  document.querySelectorAll('.nudge-left').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.getAttribute('data-fish');
      shiftSequence(id, -1);
    });
  });
  document.querySelectorAll('.nudge-right').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.getAttribute('data-fish');
      shiftSequence(id, 1);
    });
  });
}

// Render the 1 Mystery Fish row
function renderMysteryRow() {
  const container = document.getElementById('mystery-row-container');
  container.innerHTML = '';

  const rowEl = document.createElement('div');
  rowEl.className = 'align-row';
  rowEl.id = `row-mystery`;

  // Label Badge
  const labelBadge = `
    <div class="species-label-badge">
      <div class="fish-avatar-circle">❓</div>
      <div class="fish-info">
        <span class="name">Mystery Fish</span>
        <span class="scientific">Unknown species</span>
      </div>
    </div>
  `;

  // DNA viewport
  const viewportContainer = document.createElement('div');
  viewportContainer.className = 'sequence-viewport-container';

  const viewport = document.createElement('div');
  viewport.className = 'sequence-viewport';

  const track = document.createElement('div');
  track.className = 'sequence-track';

  // Render bases (matches mystery species sequence)
  for (let j = 0; j < mysterySpecies.sequence.length; j++) {
    const base = mysterySpecies.sequence[j];
    const baseBlock = document.createElement('div');
    baseBlock.className = `base-block base-${base.toLowerCase()}`;
    baseBlock.innerText = base;
    if (j < CONSERVED_LEN || j >= mysterySpecies.sequence.length - CONSERVED_LEN) {
      baseBlock.classList.add('conserved');
    }
    track.appendChild(baseBlock);
  }

  viewport.appendChild(track);
  viewportContainer.appendChild(viewport);

  // Controls & match status
  const controls = `
    <div class="controls-status-col">
      <div class="nudge-buttons">
        <button class="nudge-btn" id="nudge-mystery-left">◀</button>
        <button class="nudge-btn" id="nudge-mystery-right">▶</button>
      </div>
      <div class="status-indicator" id="status-mystery" style="width: auto; padding: 0 8px;">Match: 0%</div>
    </div>
  `;

  rowEl.innerHTML = labelBadge;
  rowEl.appendChild(viewportContainer);
  rowEl.innerHTML += controls;
  container.appendChild(rowEl);

  // Attach drag interaction
  setupDragInteraction(viewport, track, 'mystery', (newOffset) => {
    mysteryOffset = newOffset;
    checkAlignment();
  });

  document.getElementById('nudge-mystery-left').addEventListener('click', () => {
    shiftMystery(-1);
  });
  document.getElementById('nudge-mystery-right').addEventListener('click', () => {
    shiftMystery(1);
  });
}

// Render multiple choice panel options
function renderSpeciesChoices() {
  const choicesContainer = document.getElementById('species-choices');
  choicesContainer.innerHTML = '';

  fishSpecies.forEach(fish => {
    const btn = document.createElement('button');
    btn.className = 'choice-card-btn';
    btn.setAttribute('data-id', fish.id);
    
    btn.innerHTML = `
      <div class="btn-avatar">
        <img src="${fish.image}" alt="${fish.name}">
      </div>
      <span class="btn-name">${fish.name}</span>
    `;

    btn.addEventListener('click', () => handleGuess(fish));
    choicesContainer.appendChild(btn);
  });
}

// --- Drag & Snap Physics and Touch Stability ---
function setupDragInteraction(viewport, track, fishId, onReleaseCallback) {
  let startX = 0;
  let currentOffsetPx = 0;
  let initialOffset = 0;
  let isDragging = false;
  let baseWidth = 40; // Default fallback

  function getActiveOffset() {
    return fishId === 'mystery' ? mysteryOffset : scrambledOffsets[fishId];
  }

  function handleStart(e) {
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    
    isDragging = true;
    track.classList.add('dragging');
    track.classList.remove('transitioning');
    
    // Calculate actual base block width (includes block width + gap)
    const block = track.querySelector('.base-block');
    if (block) {
      const blockWidth = block.getBoundingClientRect().width;
      const gap = parseFloat(window.getComputedStyle(track).gap) || 4;
      baseWidth = blockWidth + gap;
    }

    startX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    initialOffset = getActiveOffset();

    // Get current min-offset to calculate absolute horizontal screen coordinate
    const minOffset = parseInt(document.documentElement.style.getPropertyValue('--min-offset')) || 0;
    currentOffsetPx = (initialOffset - minOffset) * baseWidth;
  }

  function handleMove(e) {
    if (!isDragging) return;
    
    // Crucial for iPad: Prevent safari browser from scrolling or bouncing the screen while dragging DNA
    if (e.cancelable) {
      e.preventDefault();
    }
    
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const deltaX = clientX - startX;
    
    const newPx = currentOffsetPx + deltaX;
    track.style.transform = `translateX(${newPx}px)`;
  }

  function handleEnd() {
    if (!isDragging) return;
    isDragging = false;
    track.classList.remove('dragging');
    track.classList.add('transitioning');

    const transformStyle = track.style.transform;
    const matchPx = transformStyle.match(/translateX\((-?\d+(?:\.\d+)?)px\)/);
    let finalPx = currentOffsetPx;
    if (matchPx) {
      finalPx = parseFloat(matchPx[1]);
    }

    const minOffset = parseInt(document.documentElement.style.getPropertyValue('--min-offset')) || 0;
    let snappedIndex = Math.round(finalPx / baseWidth) + minOffset;
    
    // Clamp allowed indices to range [-6, 6]
    snappedIndex = Math.max(-6, Math.min(6, snappedIndex));

    // Snap sound
    if (snappedIndex !== initialOffset) {
      playSound('snap');
    }

    onReleaseCallback(snappedIndex);
  }

  // Bind Mouse & Touch events
  viewport.addEventListener('mousedown', handleStart);
  window.addEventListener('mousemove', handleMove);
  window.addEventListener('mouseup', handleEnd);

  viewport.addEventListener('touchstart', handleStart, { passive: false });
  window.addEventListener('touchmove', handleMove, { passive: false });
  window.addEventListener('touchend', handleEnd);
  window.addEventListener('mouseleave', handleEnd);
}

// Shift a sequence row using nudge buttons
function shiftSequence(id, direction) {
  const currentOffset = scrambledOffsets[id];
  let newOffset = currentOffset + direction;
  newOffset = Math.max(-6, Math.min(6, newOffset));

  if (newOffset !== currentOffset) {
    scrambledOffsets[id] = newOffset;
    playSound('click');
    checkAlignment();
  }
}

// Shift mystery sequence row using nudge buttons
function shiftMystery(direction) {
  let newOffset = mysteryOffset + direction;
  newOffset = Math.max(-6, Math.min(6, newOffset));

  if (newOffset !== mysteryOffset) {
    mysteryOffset = newOffset;
    playSound('click');
    checkAlignment();
  }
}

// --- Dynamic Viewport Auto-Framing (Camera Center) ---
function updateViewportFraming() {
  const allOffsets = [...Object.values(scrambledOffsets), mysteryOffset];
  const minOffset = Math.min(...allOffsets);
  const maxOffset = Math.max(...allOffsets);
  const span = maxOffset - minOffset + 15; // 15 bases sequence length

  // Set document level variables for CSS calculations
  document.documentElement.style.setProperty('--min-offset', minOffset);
  document.documentElement.style.setProperty('--max-offset', maxOffset);
  document.documentElement.style.setProperty('--span', span);

  // 1. Center the viewports and set dynamic widths
  document.querySelectorAll('.sequence-viewport').forEach(vp => {
    vp.style.width = `calc(var(--span) * var(--base-width))`;
    // viewport left boundary shifts dynamically by minOffset
    vp.style.left = `calc(50% + (var(--min-offset) - 7.5) * var(--base-width))`;
  });

  // 2. Translate tracks to maintain grid alignment relative to viewport left boundary
  fishSpecies.forEach(fish => {
    const offset = scrambledOffsets[fish.id];
    const track = document.querySelector(`#row-${fish.id} .sequence-track`);
    if (track && !track.classList.contains('dragging')) {
      track.style.transform = `translateX(calc((${offset} - var(--min-offset)) * var(--base-width)))`;
    }
  });

  const mysteryTrack = document.querySelector(`#row-mystery .sequence-track`);
  if (mysteryTrack && !mysteryTrack.classList.contains('dragging')) {
    mysteryTrack.style.transform = `translateX(calc((${mysteryOffset} - var(--min-offset)) * var(--base-width)))`;
  }
}

// --- Sequence Matching & Game States ---
function checkAlignment() {
  const knownOffsets = fishSpecies.map(fish => scrambledOffsets[fish.id]);
  
  // Calculate frequencies of each offset to award incremental feedback
  const freq = {};
  knownOffsets.forEach(off => {
    freq[off] = (freq[off] || 0) + 1;
  });

  // Find the offset with highest frequency (the main aligned cluster offset)
  let targetGroupOffset = 0;
  let maxFreq = 0;
  Object.keys(freq).forEach(offStr => {
    const off = parseInt(offStr);
    const count = freq[off];
    if (count > maxFreq) {
      maxFreq = count;
      targetGroupOffset = off;
    } else if (count === maxFreq && Math.abs(off) < Math.abs(targetGroupOffset)) {
      targetGroupOffset = off;
    }
  });

  // All 5 known species aligned together relatively!
  const allAligned = (maxFreq === 5);
  const commonOffset = allAligned ? targetGroupOffset : null;

  // Render status lights for known rows
  fishSpecies.forEach(fish => {
    const offset = scrambledOffsets[fish.id];
    const statusInd = document.getElementById(`status-${fish.id}`);
    const rowEl = document.getElementById(`row-${fish.id}`);
    
    // Status light is aligned (yellow or green) if it is part of a cluster of 2+ fish
    if (offset === targetGroupOffset && maxFreq >= 2) {
      rowEl.classList.add('aligned');
      statusInd.className = 'status-indicator aligned';
      statusInd.innerText = '✓';
      
      if (allAligned) {
        statusInd.style.background = 'rgba(74, 214, 109, 0.2)';
        statusInd.style.borderColor = 'rgba(74, 214, 109, 0.6)';
        statusInd.style.color = 'var(--color-success)';
        statusInd.style.boxShadow = '0 0 10px rgba(74, 214, 109, 0.3)';
      } else {
        // Group alignment (Amber/Yellow)
        statusInd.style.background = 'rgba(255, 183, 3, 0.2)';
        statusInd.style.borderColor = 'rgba(255, 183, 3, 0.6)';
        statusInd.style.color = 'var(--color-warning)';
        statusInd.style.boxShadow = 'none';
      }
    } else {
      rowEl.classList.remove('aligned');
      statusInd.className = 'status-indicator';
      statusInd.innerText = '❌';
      statusInd.style.background = '';
      statusInd.style.borderColor = '';
      statusInd.style.color = '';
      statusInd.style.boxShadow = '';
    }
  });

  // Glow viewport boundaries when relative alignment is reached
  const glowL = document.getElementById('glow-left');
  const glowR = document.getElementById('glow-right');
  
  if (allAligned) {
    if (!isKnownAligned) {
      isKnownAligned = true;
      glowL.classList.add('aligned-glow');
      glowR.classList.add('aligned-glow');
      playSound('success-scan');
      
      document.getElementById('instruction-text').innerText = "Step 2: Drag the purple Mystery Fish to align it with the others and find a match!";
      document.getElementById('info-banner').style.borderColor = "var(--color-mystery)";
      document.getElementById('info-banner').style.background = "rgba(168, 85, 247, 0.1)";
    }
  } else {
    isKnownAligned = false;
    glowL.classList.remove('aligned-glow');
    glowR.classList.remove('aligned-glow');
  }

  // 2. Evaluate Mystery Fish overlap match score
  const targetFish = mysterySpecies;
  const targetOffset = scrambledOffsets[targetFish.id];
  
  // Calculate percentage of matching nucleotides at current relative shifts
  const percentMatch = calculateMatch(mysterySpecies.sequence, mysteryOffset, targetFish.sequence, targetOffset);
  currentMysteryMatchPercent = percentMatch;

  const mysteryStatus = document.getElementById('status-mystery');
  const mysteryRow = document.getElementById('row-mystery');
  mysteryStatus.innerText = `Match: ${percentMatch}%`;

  // Highlight matching columns
  highlightMatchingBases();

  // Win condition: 100% overlap match AND known fish are aligned, AND mystery aligns with them
  if (percentMatch === 100 && isKnownAligned && mysteryOffset === targetOffset) {
    if (!isMysteryAligned) {
      isMysteryAligned = true;
      mysteryStatus.className = 'status-indicator full-match';
      mysteryStatus.innerText = `100% Match!`;
      mysteryRow.classList.add('aligned');
      playSound('align');
      
      // Reveal guessing card
      document.getElementById('identity-panel').classList.remove('hidden');
      document.getElementById('instruction-text').innerText = "Step 3: Excellent! The DNA matches 100%! Select which fish it is below.";
      document.getElementById('identity-panel').scrollIntoView({ behavior: 'smooth' });
    }
  } else {
    isMysteryAligned = false;
    mysteryStatus.className = 'status-indicator';
    mysteryRow.classList.remove('aligned');
    document.getElementById('identity-panel').classList.add('hidden');
    
    if (isKnownAligned) {
      document.getElementById('instruction-text').innerText = "Step 2: Drag the purple Mystery Fish to align it with the others and find a match!";
    }
  }

  // Update dynamic framing dimensions
  updateViewportFraming();
}

// Calculate match percentage in overlapping region (15 bases total)
function calculateMatch(seqA, offsetA, seqB, offsetB) {
  let matches = 0;
  const start = Math.max(offsetA, offsetB);
  const end = Math.min(offsetA + 15, offsetB + 15);
  
  if (start >= end) return 0;
  
  for (let i = start; i < end; i++) {
    const charA = seqA[i - offsetA];
    const charB = seqB[i - offsetB];
    if (charA && charB && charA === charB) {
      matches++;
    }
  }
  return Math.round((matches / 15) * 100);
}

// Highlight matching base blocks in real-time
function highlightMatchingBases() {
  document.querySelectorAll('.base-block').forEach(b => {
    b.classList.remove('correct-match');
  });
  document.querySelectorAll('.align-row').forEach(r => {
    r.classList.remove('matching-highlight');
  });

  const mysteryRow = document.getElementById('row-mystery');
  if (!mysteryRow) return;

  fishSpecies.forEach(fish => {
    const offsetFish = scrambledOffsets[fish.id];
    const row = document.getElementById(`row-${fish.id}`);
    if (!row) return;

    const start = Math.max(mysteryOffset, offsetFish);
    const end = Math.min(mysteryOffset + 15, offsetFish + 15);
    let hasMatch = false;

    for (let i = start; i < end; i++) {
      const idxM = i - mysteryOffset;
      const idxF = i - offsetFish;

      if (mysterySpecies.sequence[idxM] === fish.sequence[idxF]) {
        hasMatch = true;
        
        const mysteryBlock = mysteryRow.querySelectorAll('.base-block')[idxM];
        const fishBlock = row.querySelectorAll('.base-block')[idxF];
        
        if (mysteryBlock) mysteryBlock.classList.add('correct-match');
        if (fishBlock) fishBlock.classList.add('correct-match');
      }
    }

    if (hasMatch && fish.id === mysterySpecies.id && mysteryOffset === offsetFish) {
      row.classList.add('matching-highlight');
    }
  });
}

// --- Guess Handling ---
function handleGuess(guessFish) {
  if (guessFish.id === mysterySpecies.id) {
    playSound('win');
    showWinModal(guessFish);
  } else {
    playSound('fail');
    
    const btn = document.querySelector(`.choice-card-btn[data-id="${guessFish.id}"]`);
    btn.style.animation = 'none';
    btn.offsetHeight; /* trigger reflow */
    btn.style.animation = 'shake 0.4s ease';
    
    const correctRow = document.getElementById(`row-${mysterySpecies.id}`);
    correctRow.style.animation = 'none';
    correctRow.offsetHeight;
    correctRow.style.animation = 'glow-pulse 0.8s ease';
    
    document.getElementById('instruction-text').innerText = "Oops! Look closely at the DNA colors to find the exact match!";
  }
}

// Show success win modal
function showWinModal(fish) {
  const modal = document.getElementById('modal-success');
  modal.classList.remove('hidden');

  document.getElementById('winner-img').src = fish.image;
  document.getElementById('winner-name').innerText = fish.name;
  document.getElementById('winner-scientific').innerText = fish.scientific;

  const factsUl = document.getElementById('winner-facts');
  factsUl.innerHTML = '';
  fish.facts.forEach(fact => {
    const li = document.createElement('li');
    li.innerText = fact;
    factsUl.appendChild(li);
  });

  triggerConfetti();
}

// Confetti Particle Generator
function triggerConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  const ctx = canvas.getContext('2d');
  
  canvas.width = canvas.parentElement.clientWidth;
  canvas.height = canvas.parentElement.clientHeight;
  
  let particles = [];
  const colors = ['#00b4d8', '#ff7096', '#4ad66d', '#ffb703', '#a855f7', '#ff5a5f'];
  
  for (let i = 0; i < 150; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * -120 - 20,
      size: Math.random() * 8 + 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedY: Math.random() * 3.5 + 2,
      speedX: Math.random() * 2.5 - 1.25,
      rotation: Math.random() * 360,
      spin: Math.random() * 5 - 2.5
    });
  }
  
  let animationId;
  function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let active = false;
    
    particles.forEach(p => {
      p.y += p.speedY;
      p.x += p.speedX;
      p.rotation += p.spin;
      p.speedX += Math.sin(p.y / 30) * 0.05;

      if (p.y < canvas.height + 20) {
        active = true;
      }
      
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation * Math.PI / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
    });
    
    if (active) {
      animationId = requestAnimationFrame(update);
    }
  }
  
  update();
}

// --- CSS Animations inserted dynamically for Choice card shake ---
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20%, 60% { transform: translateX(-8px); }
    40%, 80% { transform: translateX(8px); }
  }
  @keyframes glow-pulse {
    0% { box-shadow: 0 0 0 rgba(74, 214, 109, 0); }
    50% { box-shadow: 0 0 20px rgba(74, 214, 109, 0.8); border-color: rgba(74, 214, 109, 0.8); }
    100% { box-shadow: 0 0 0 rgba(74, 214, 109, 0); }
  }
`;
document.head.appendChild(styleSheet);


// --- Modal & Button Listeners ---
document.getElementById('btn-how-to').addEventListener('click', () => {
  document.getElementById('modal-how-to').classList.remove('hidden');
});

document.getElementById('btn-close-how-to').addEventListener('click', () => {
  document.getElementById('modal-how-to').classList.add('hidden');
});

document.getElementById('btn-start-game').addEventListener('click', () => {
  document.getElementById('modal-how-to').classList.add('hidden');
});

document.getElementById('btn-restart').addEventListener('click', () => {
  initGame();
  playSound('click');
});

document.getElementById('btn-play-again').addEventListener('click', () => {
  initGame();
  playSound('click');
});

// Start the game on load
window.addEventListener('DOMContentLoaded', () => {
  initGame();
  
  // Show instructions on very first start
  document.getElementById('modal-how-to').classList.remove('hidden');
});
