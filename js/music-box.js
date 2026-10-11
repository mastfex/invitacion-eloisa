'use strict';

/**
 * "Cajita de sueños", melodía original creada para la invitación de Eloísa.
 * Vals de cajita musical en Do mayor, 3/4, 94 BPM.
 * Usa Web Audio: sin archivos externos, cookies ni reproducción automática.
 */
(() => {
  const button = document.getElementById('music-toggle');
  const status = document.getElementById('music-status');
  const control = document.getElementById('music-player-control');
  if (!button || !status || !control) return;

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    button.disabled = true;
    button.setAttribute('aria-label', 'Música no disponible en este navegador');
    status.textContent = 'No disponible aquí';
    return;
  }

  // Partitura original: notas MIDI [altura, comienzo del compás, duración en pulsos].
  const melody = [
    [[72, 0, .7], [76, .9, .7], [79, 1.85, .8]],
    [[76, 0, .7], [81, .95, .8], [79, 2, .7]],
    [[77, 0, .7], [76, .9, .7], [72, 1.85, .9]],
    [[74, 0, .6], [79, .9, .65], [71, 1.8, 1]],
    [[72, 0, .7], [79, .8, .7], [84, 1.7, 1]],
    [[83, 0, .7], [79, 1, .7], [76, 2, .7]],
    [[77, 0, .65], [81, .8, .65], [84, 1.7, .9]],
    [[79, 0, .65], [76, .8, .7], [74, 1.7, 1]],
    [[76, 0, .7], [81, .9, .7], [84, 1.85, .8]],
    [[81, 0, .65], [79, .8, .65], [77, 1.8, .9]],
    [[74, 0, .7], [77, .9, .75], [81, 1.85, .8]],
    [[83, 0, .75], [79, .95, .7], [74, 1.85, .95]],
    [[72, 0, .55], [76, .65, .55], [79, 1.35, .65], [84, 2.15, .65]],
    [[81, 0, .7], [77, .9, .7], [76, 1.85, .85]],
    [[79, 0, .6], [83, .8, .6], [86, 1.65, .75]],
    [[84, 0, 1.55], [79, 1.8, .8]]
  ];

  const harmony = [
    [60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62],
    [60, 64, 67], [52, 55, 59], [53, 57, 60], [55, 59, 62],
    [57, 60, 64], [53, 57, 60], [50, 53, 57], [55, 59, 62],
    [60, 64, 67], [53, 57, 60], [55, 59, 62], [60, 64, 67]
  ];

  const secondsPerBeat = 60 / 94;
  const duration = melody.length * 3 * secondsPerBeat;
  const score = [];
  melody.forEach((measure, index) => {
    const base = index * 3;
    measure.forEach(([note, beat, length]) => {
      score.push({ at: base + beat, note, length, volume: .98 });
    });
    const chord = harmony[index];
    // Acompañamiento de vals: grave, campanita y respuesta.
    score.push({ at: base, note: chord[0], length: 1.15, volume: .28 });
    score.push({ at: base + 1, note: chord[1], length: .9, volume: .22 });
    score.push({ at: base + 2, note: chord[2], length: .9, volume: .22 });
  });
  score.sort((a, b) => a.at - b.at);

  let context = null;
  let bus = null;
  let master = null;
  let scheduler = null;
  let playing = false;
  let index = 0;
  let cycle = 0;
  let origin = 0;

  function display() {
    button.setAttribute('aria-pressed', String(playing));
    button.setAttribute('aria-label', playing ? 'Pausar melodía de cajita musical' : 'Reproducir melodía de cajita musical');
    button.title = playing ? 'Pausar melodía' : 'Reproducir melodía';
    status.textContent = playing ? 'Reproduciendo · pausar' : 'Toca para escuchar';
    control.textContent = playing ? 'Ⅱ' : '▶';
  }

  function playBell(note, at, beats, volume) {
    const frequency = 440 * Math.pow(2, (note - 69) / 12);
    const ring = Math.max(.48, beats * secondsPerBeat + .5);
    const envelope = context.createGain();
    envelope.gain.setValueAtTime(.00001, at);
    envelope.gain.exponentialRampToValueAtTime(Math.max(.0001, .045 * volume), at + .012);
    envelope.gain.exponentialRampToValueAtTime(.0001, at + ring);
    envelope.connect(bus);

    // Parciales delicados y ligeramente inarmónicos: carácter de cajita musical.
    [[1, 1], [2.009, .22], [3.97, .075]].forEach(([multiple, gain]) => {
      const oscillator = context.createOscillator();
      const overtone = context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency * multiple, at);
      overtone.gain.value = gain;
      oscillator.connect(overtone);
      overtone.connect(envelope);
      oscillator.start(at);
      oscillator.stop(at + ring + .04);
      oscillator.onended = () => {
        oscillator.disconnect();
        overtone.disconnect();
      };
    });
  }

  function schedule() {
    if (!playing || !context) return;
    const horizon = context.currentTime + .38;
    while (true) {
      const event = score[index];
      const when = origin + cycle * duration + event.at * secondsPerBeat;
      if (when > horizon) break;
      if (when >= context.currentTime) playBell(event.note, when, event.length, event.volume);
      index++;
      if (index === score.length) {
        index = 0;
        cycle++;
      }
    }
  }

  function stop() {
    if (!playing && !context) return;
    playing = false;
    if (scheduler !== null) {
      clearInterval(scheduler);
      scheduler = null;
    }
    const oldContext = context;
    const oldMaster = master;
    context = null;
    bus = null;
    master = null;
    if (oldContext) {
      if (oldMaster && oldContext.state === 'running') {
        oldMaster.gain.setTargetAtTime(.00001, oldContext.currentTime, .04);
      }
      // Cierra solo el contexto anterior; pulsar rápidamente no afecta al nuevo.
      window.setTimeout(() => { oldContext.close().catch(() => {}); }, 180);
    }
    display();
  }

  function start() {
    if (playing) return;
    try {
      context = new AudioContextClass();
      master = context.createGain();
      master.gain.value = .8;
      bus = context.createGain();
      const echo = context.createDelay(.45);
      const echoLevel = context.createGain();
      echo.delayTime.value = .19;
      echoLevel.gain.value = .16;
      bus.connect(master);
      bus.connect(echo);
      echo.connect(echoLevel);
      echoLevel.connect(master);
      master.connect(context.destination);

      index = 0;
      cycle = 0;
      origin = context.currentTime + .12;
      playing = true;
      display();
      // Se invoca desde el botón: compatible con la política de audio móvil.
      context.resume().catch(() => {
        stop();
        status.textContent = 'No se pudo iniciar el audio';
      });
      schedule();
      scheduler = window.setInterval(schedule, 110);
    } catch (error) {
      stop();
      status.textContent = 'Audio no disponible';
    }
  }

  button.addEventListener('click', () => {
    if (playing) stop();
    else start();
  });

  // No reproducir música cuando la persona cambia de pestaña o bloquea el celular.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
  });
  window.addEventListener('pagehide', stop);
  display();
})();
