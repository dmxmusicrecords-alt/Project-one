let audioCtx: AudioContext | null = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Synthesizes a premium, sparkling "Cash-In" sound.
 * Designed as an ascending cascade of metallic coins and bright, sparkling chimes
 * to audibly reinforce receiving funds, earnings, or refunds.
 */
export function playCashInSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // A fast, cheerful ascending melodic arpeggio (C6 -> E6 -> G6 -> C7)
    // with staggered starting times to create a rolling metal chime effect.
    const notes = [
      { freq: 1046.50, delay: 0.00, duration: 0.4 }, // C6
      { freq: 1318.51, delay: 0.06, duration: 0.4 }, // E6
      { freq: 1567.98, delay: 0.12, duration: 0.5 }, // G6
      { freq: 2093.00, delay: 0.18, duration: 0.7 }, // C7
    ];

    notes.forEach((note, idx) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      // Alternate types for a richer metallic spectrum mixture
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(note.freq, now + note.delay);
      // Slight pitch glide upwards for premium bubble chime styling
      osc.frequency.exponentialRampToValueAtTime(note.freq * 1.05, now + note.delay + note.duration);

      gainNode.gain.setValueAtTime(0, now + note.delay);
      gainNode.gain.linearRampToValueAtTime(0.08, now + note.delay + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + note.delay + note.duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now + note.delay);
      osc.stop(now + note.delay + note.duration + 0.05);
    });

    // Subtly high-passed white noise sparks simulating coin jingling
    const numCoins = 3;
    for (let i = 0; i < numCoins; i++) {
      const coinDelay = i * 0.07;
      const duration = 0.08;
      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let j = 0; j < bufferSize; j++) {
        data[j] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(5000 + (i * 800), now + coinDelay);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.04, now + coinDelay);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + coinDelay + duration);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      noise.start(now + coinDelay);
      noise.stop(now + coinDelay + duration + 0.02);
    }

  } catch (err) {
    console.warn("Failed to play cash-in sound:", err);
  }
}

/**
 * Synthesizes a highly realistic "Cash-Out" sound.
 * Emulates the mechanical drawer closing latch and double click ('ka-chunk')
 * followed immediately by a smooth, descending pitch sweep representing funds spent,
 * debited, or transferred down the pipeline.
 */
export function playCashOutSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // --- Part 1: Double Mechanical Drawer Click ("Ka-chunk") ---
    // Two rapid impulses of low-passed noise to represent structural hardware latch engagement
    const triggerTimes = [0.00, 0.06];
    triggerTimes.forEach((t) => {
      const duration = 0.04;
      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let j = 0; j < bufferSize; j++) {
        data[j] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, now + t);
      filter.Q.setValueAtTime(4, now + t);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.12, now + t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + t + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now + t);
      noise.stop(now + t + duration + 0.01);
    });

    // Low wooden mechanical thump accentuating the drawer closure
    const thump = ctx.createOscillator();
    const thumpGain = ctx.createGain();
    thump.type = 'triangle';
    thump.frequency.setValueAtTime(140, now);
    thump.frequency.exponentialRampToValueAtTime(60, now + 0.15);

    thumpGain.gain.setValueAtTime(0.18, now);
    thumpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

    thump.connect(thumpGain);
    thumpGain.connect(ctx.destination);
    thump.start(now);
    thump.stop(now + 0.18);

    // --- Part 2: Descending Debit Glide ("Swoosh") ---
    // A soft, descending sine glide representing funds departing the wallet
    const glide = ctx.createOscillator();
    const glideGain = ctx.createGain();

    glide.type = 'sine';
    glide.frequency.setValueAtTime(880, now + 0.08);
    // Smooth pitch sweep downwards
    glide.frequency.exponentialRampToValueAtTime(220, now + 0.45);

    glideGain.gain.setValueAtTime(0, now + 0.08);
    glideGain.gain.linearRampToValueAtTime(0.12, now + 0.12);
    glideGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.48);

    glide.connect(glideGain);
    glideGain.connect(ctx.destination);

    glide.start(now + 0.08);
    glide.stop(now + 0.52);

  } catch (err) {
    console.warn("Failed to play cash-out sound:", err);
  }
}

/**
 * Synthesizes a realistic, crisp cash register "Ka-Ching!" metallic sound.
 * Combining multiple high-pitched sine/triangle wave frequencies for the bell ring
 * paired with a burst of high-passed band noise for the mechanical key/drawer click.
 */
export function playCashRegisterSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // --- Part 1: Retro Arcade / Online Money Game Power-up Arpeggio ---
    // A fast, extremely energetic ascending major-pentatonic chord arpeggio
    // designed to match the highly satisfying loot-collect sounds in finance games.
    const gameNotes = [
      { freq: 523.25,  delay: 0.00, volume: 0.08, dur: 0.35, pitchBend: 1.05 }, // C5
      { freq: 659.25,  delay: 0.05, volume: 0.09, dur: 0.35, pitchBend: 1.05 }, // E5
      { freq: 783.99,  delay: 0.10, volume: 0.09, dur: 0.35, pitchBend: 1.05 }, // G5
      { freq: 1046.50, delay: 0.15, volume: 0.10, dur: 0.40, pitchBend: 1.05 }, // C6
      { freq: 1318.51, delay: 0.20, volume: 0.11, dur: 0.45, pitchBend: 1.05 }, // E6
      { freq: 1567.98, delay: 0.25, volume: 0.12, dur: 0.55, pitchBend: 1.10 }, // G6
      { freq: 2093.00, delay: 0.30, volume: 0.14, dur: 0.75, pitchBend: 1.15 }  // C7
    ];

    gameNotes.forEach((note) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      // Use triangle waves for that classic, warm, thick retro arcade video game vibe
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.freq, now + note.delay);
      // Slight glide upwards for extra cheerful game feedback
      osc.frequency.exponentialRampToValueAtTime(note.freq * note.pitchBend, now + note.delay + note.dur * 0.4);

      gainNode.gain.setValueAtTime(0, now + note.delay);
      gainNode.gain.linearRampToValueAtTime(note.volume, now + note.delay + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + note.delay + note.dur);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now + note.delay);
      osc.stop(now + note.delay + note.dur + 0.05);
    });

    // --- Part 2: Iconic Dual-Chime "Ka-Cheng!" High-Register Bell ---
    // High metal bells resonating with rich ring modulation to build the sharp "Ching!"
    const bellFreqs = [1975.53, 2217.46, 2637.02, 3135.96]; // B6, C#7, E7, G7
    bellFreqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + 0.08);
      // Bell vibrato/flutter simulation
      osc.frequency.linearRampToValueAtTime(freq + 15, now + 0.18);
      osc.frequency.linearRampToValueAtTime(freq - 15, now + 0.38);

      gainNode.gain.setValueAtTime(0, now + 0.08);
      gainNode.gain.linearRampToValueAtTime(0.06, now + 0.09);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.8 + (idx * 0.05));

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now + 0.08);
      osc.stop(now + 1.2);
    });

    // --- Part 3: Golden Coin Fountain / Jackpot Spill ---
    // Staggered, ultra-crisp white noise bursts filtered to sound exactly like glossy metal gold coins cascading
    const coinsCount = 8;
    for (let i = 0; i < coinsCount; i++) {
      const delay = 0.05 + (i * 0.055); // Rapid rapid waterfall rate
      const duration = 0.05 + (Math.random() * 0.03);
      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let j = 0; j < bufferSize; j++) {
        data[j] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      // Bandpass band with an extra high frequency spectrum simulation to build pristine coin reflections
      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(6500 + (i * 350) + (Math.random() * 800), now + delay);
      bandpass.Q.setValueAtTime(8, now + delay);

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0, now + delay);
      gainNode.gain.linearRampToValueAtTime(0.08, now + delay + 0.005);
      gainNode.gain.exponentialRampToValueAtTime(0.0002, now + delay + duration);

      noise.connect(bandpass);
      bandpass.connect(gainNode);
      gainNode.connect(ctx.destination);

      noise.start(now + delay);
      noise.stop(now + delay + duration + 0.01);
    }

    // --- Part 4: Physical Coin Tray Slide / Cash Box Rumble ---
    // Mechanical cash sound representing the tray sliding open
    const slideDuration = 0.15;
    const slideBufferSize = ctx.sampleRate * slideDuration;
    const slideBuffer = ctx.createBuffer(1, slideBufferSize, ctx.sampleRate);
    const slideData = slideBuffer.getChannelData(0);
    for (let i = 0; i < slideBufferSize; i++) {
      slideData[i] = Math.random() * 2 - 1;
    }

    const slideNoise = ctx.createBufferSource();
    slideNoise.buffer = slideBuffer;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(600, now);

    const slideGain = ctx.createGain();
    slideGain.gain.setValueAtTime(0.08, now);
    slideGain.gain.exponentialRampToValueAtTime(0.001, now + slideDuration);

    slideNoise.connect(lowpass);
    lowpass.connect(slideGain);
    slideGain.connect(ctx.destination);

    slideNoise.start(now);
    slideNoise.stop(now + slideDuration + 0.01);

  } catch (err) {
    console.warn("Failed to play cash register sound:", err);
  }
}

/**
 * Synthesizes a warm, futuristic digital notification chime.
 * Uses a soft synth sequence (pluck) for pleasant support notification feedback.
 */
export function playNotificationSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Simple warm dual-chime arpeggio (C5 -> G5)
    const tones = [
      { freq: 523.25, timeOffset: 0, duration: 0.25 }, // C5
      { freq: 783.99, timeOffset: 0.08, duration: 0.45 }, // G5
    ];

    tones.forEach((tone) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(tone.freq, now + tone.timeOffset);
      
      gainNode.gain.setValueAtTime(0, now + tone.timeOffset);
      gainNode.gain.linearRampToValueAtTime(0.15, now + tone.timeOffset + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + tone.timeOffset + tone.duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now + tone.timeOffset);
      osc.stop(now + tone.timeOffset + tone.duration + 0.05);
    });

  } catch (err) {
    console.warn("Failed to play notification sound:", err);
  }
}
