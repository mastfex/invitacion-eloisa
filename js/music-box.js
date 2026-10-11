'use strict';

/**
 * "Cumpleaños feliz", arreglo instrumental para la invitación de Eloísa.
 * Melodía tradicional y arreglo de cajita musical en Do mayor, 3/4, 96 BPM.
 * Intenta reproducirse al cargar; navegadores móviles pueden exigir un toque.
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

  // "Cumpleaños feliz": melodía tradicional reconocible en Do mayor.
  // Arreglo instrumental propio, con timbre de cajita musical y acompañamiento de vals.
  // Notación de cada nota: [altura MIDI, inicio en pulsos dentro del compás, duración].
  const birthdayVerse = [
    [[67,0,.42],[67,.5,.42],[69,1,.85],[67,2,.85]], // Cum-ple-a-ños
    [[72,0,.85],[71,1,1.8]],                         // fe-liz
    [[67,0,.42],[67,.5,.42],[69,1,.85],[67,2,.85]],
    [[74,0,.85],[72,1,1.8]],
    [[67,0,.42],[67,.5,.42],[79,1,.85],[76,2,.85]],
    [[72,0,.85],[71,1,.85],[69,2,.85]],
    [[77,0,.42],[77,.5,.42],[76,1,.85],[72,2,.85]],
    [[74,0,.85],[72,1,1.8]]
  ];

  // Dos estrofas seguidas para una escucha menos corta (~30 segundos).
  // La segunda conserva la melodía y utiliza un acompañamiento más luminoso.
  const melody = birthdayVerse.concat(birthdayVerse);
  const harmony = [
    [60,64,67],[60,64,67],[55,59,62],[60,64,67],
    [60,64,67],[53,57,60],[53,57,60],[55,59,62],
    [60,64,67],[60,64,67],[55,59,62],[60,64,67],
    [60,64,67],[53,57,60],[53,57,60],[60,64,67]
  ];

  const secondsPerBeat = 60 / 96;
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

  function start(initialContext = null) {
    if (playing) return;
    try {
      context = initialContext || new AudioContextClass();
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
      // Si el navegador lo requiere, resume el audio después de un gesto.
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

  // Los navegadores modernos restringen el audio automático con sonido.
  // Se intenta al cargar; si está bloqueado, empieza con el primer toque
  // en cualquier parte de la invitación (excepto el botón que tiene control propio).
  let autoGestureArmed = false;
  function disarmFirstGesture() {
    if (!autoGestureArmed) return;
    autoGestureArmed = false;
    document.removeEventListener('pointerdown', onPointerDown, true);
    document.removeEventListener('pointerup', onPointerUp, true);
    document.removeEventListener('keydown', onKeyDown, true);
  }
  function onFirstGesture(event) {
    if (!autoGestureArmed) return;
    disarmFirstGesture();
    if (button.contains(event.target)) return;
    if (!playing && !document.hidden) start();
  }
  function onPointerDown(event) {
    if (event.pointerType === 'mouse') onFirstGesture(event);
  }
  function onPointerUp(event) {
    if (event.pointerType !== 'mouse') onFirstGesture(event);
  }
  function onKeyDown(event) {
    if (!event.repeat && !event.altKey && !event.ctrlKey && !event.metaKey) onFirstGesture(event);
  }
  function armFirstGesture() {
    if (autoGestureArmed) return;
    autoGestureArmed = true;
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('pointerup', onPointerUp, true);
    document.addEventListener('keydown', onKeyDown, true);
  }

  button.addEventListener('click', () => {
    disarmFirstGesture();
    if (playing) stop();
    else start();
  });

  // Este intento puede funcionar en navegadores que autorizan autoplay.
  // Si el navegador lo impide, no mostramos reproducción ficticia.
  function attemptAutoplay() {
    if (document.hidden) return;
    armFirstGesture();
    let candidate;
    try {
      candidate = new AudioContextClass();
      // En algunos navegadores queda pendiente hasta la primera interacción.
      // Cerramos el intento suspendido para no dejar recursos de audio activos.
      candidate.resume().then(() => {
        if (!playing && !document.hidden && candidate.state === 'running') {
          disarmFirstGesture();
          start(candidate);
        } else if (candidate.state !== 'closed') {
          candidate.close().catch(() => {});
        }
      }).catch(() => {});
      window.setTimeout(() => {
        if (candidate !== context && candidate.state !== 'closed' && !playing) {
          candidate.close().catch(() => {});
        }
      }, 500);
    } catch (_) {
      if (candidate && candidate.state !== 'closed') candidate.close().catch(() => {});
    }
  }

  // No reiniciar la música después de que la persona haya decidido pausarla.
  // Se detiene al cambiar de pestaña o al bloquear el teléfono.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      disarmFirstGesture();
      stop();
    }
  });
  window.addEventListener('pagehide', () => {
    disarmFirstGesture();
    stop();
  });
  display();
  attemptAutoplay();
})();
