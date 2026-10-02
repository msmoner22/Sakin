/* =========================================================
   SAKIN QUR'AN AUDIO SYSTEM
   ========================================================= */

const SAKIN_AUDIO = {

  currentSurah: 0,

  currentAyah: 0,

  currentReciter: "default",

  isPlaying: false,

  repeat: false,

  audio: null

};


/* =========================================================
   RECITER SYSTEM
   ========================================================= */

const SAKIN_RECITERS = [

  {
    id: "default",
    name: "Default Reciter",
    audioBase: ""
  },

  {
    id: "reciter-1",
    name: "Reciter 1",
    audioBase: ""
  },

  {
    id: "reciter-2",
    name: "Reciter 2",
    audioBase: ""
  }

];


/* =========================================================
   SET AUDIO POSITION
   ========================================================= */

function setSakinAudioPosition(surah, ayah){

  SAKIN_AUDIO.currentSurah =
    Number(surah);

  SAKIN_AUDIO.currentAyah =
    Number(ayah);

  if(
    typeof saveSakinQuranAudioPosition ===
    "function"
  ){

    saveSakinQuranAudioPosition(
      surah,
      ayah
    );

  }

}


/* =========================================================
   GET SAVED AUDIO POSITION
   ========================================================= */

function getSavedSakinAudioPosition(){

  if(
    typeof getSakinQuranAudioPosition ===
    "function"
  ){

    return getSakinQuranAudioPosition();

  }

  return null;

}


/* =========================================================
   AUDIO URL
   ========================================================= */

function getSakinAudioUrl(
  surah,
  ayah,
  reciter = "default"
){

  const selected =
    SAKIN_RECITERS.find(
      item => item.id === reciter
    );

  if(!selected){
    return "";
  }

  /*
    The verified Qur'an audio source will be
    connected here.

    Audio files will NOT be generated or
    invented by this system.
  */

  if(!selected.audioBase){
    return "";
  }

  return `${selected.audioBase}/${surah}/${ayah}.mp3`;

}


/* =========================================================
   PLAY AYAH
   ========================================================= */

function playSakinAyah(
  surah,
  ayah,
  reciter = SAKIN_AUDIO.currentReciter
){

  setSakinAudioPosition(
    surah,
    ayah
  );

  SAKIN_AUDIO.currentReciter =
    reciter;

  const url =
    getSakinAudioUrl(
      surah,
      ayah,
      reciter
    );

  if(!url){

    updateSakinAudioStatus(
      "Audio source will be connected after the verified Qur'an audio dataset is added."
    );

    return;

  }

  if(SAKIN_AUDIO.audio){

    SAKIN_AUDIO.audio.pause();

    SAKIN_AUDIO.audio = null;

  }

  SAKIN_AUDIO.audio =
    new Audio(url);

  SAKIN_AUDIO.audio.preload =
    "auto";

  SAKIN_AUDIO.audio.addEventListener(
    "play",
    function(){

      SAKIN_AUDIO.isPlaying =
        true;

      highlightSakinAyah(
        surah,
        ayah
      );

      updateSakinAudioStatus(
        "▶️ Audio playing"
      );

    }
  );

  SAKIN_AUDIO.audio.addEventListener(
    "pause",
    function(){

      SAKIN_AUDIO.isPlaying =
        false;

      updateSakinAudioStatus(
        "⏸️ Audio paused"
      );

    }
  );

  SAKIN_AUDIO.audio.addEventListener(
    "ended",
    function(){

      SAKIN_AUDIO.isPlaying =
        false;

      if(SAKIN_AUDIO.repeat){

        playSakinAyah(
          surah,
          ayah,
          reciter
        );

        return;

      }

      playNextSakinAyah();

    }
  );

  SAKIN_AUDIO.audio.addEventListener(
    "error",
    function(){

      SAKIN_AUDIO.isPlaying =
        false;

      updateSakinAudioStatus(
        "Audio could not be loaded."
      );

    }
  );

  SAKIN_AUDIO.audio.play()
    .catch(function(){

      updateSakinAudioStatus(
        "Tap Play again to start audio."
      );

    });

}


/* =========================================================
   PLAY CURRENT AYAH
   ========================================================= */

function playCurrentSakinAudio(){

  if(
    !SAKIN_AUDIO.currentSurah
  ){

    const saved =
      getSavedSakinAudioPosition();

    if(saved){

      SAKIN_AUDIO.currentSurah =
        Number(saved.surah);

      SAKIN_AUDIO.currentAyah =
        Number(saved.ayah);

    }

  }

  if(
    !SAKIN_AUDIO.currentSurah
  ){

    updateSakinAudioStatus(
      "Select a Surah first."
    );

    return;

  }

  playSakinAyah(
    SAKIN_AUDIO.currentSurah,
    SAKIN_AUDIO.currentAyah
  );

}


/* =========================================================
   PAUSE
   ========================================================= */

function pauseSakinAudio(){

  if(SAKIN_AUDIO.audio){

    SAKIN_AUDIO.audio.pause();

  }else{

    updateSakinAudioStatus(
      "No audio is currently playing."
    );

  }

}


/* =========================================================
   STOP
   ========================================================= */

function stopSakinAudio(){

  if(SAKIN_AUDIO.audio){

    SAKIN_AUDIO.audio.pause();

    SAKIN_AUDIO.audio.currentTime =
      0;

  }

  SAKIN_AUDIO.isPlaying =
    false;

  updateSakinAudioStatus(
    "Audio stopped"
  );

}


/* =========================================================
   REPEAT
   ========================================================= */

function toggleSakinAudioRepeat(){

  SAKIN_AUDIO.repeat =
    !SAKIN_AUDIO.repeat;

  updateSakinAudioStatus(
    SAKIN_AUDIO.repeat
      ? "🔁 Repeat ON"
      : "🔁 Repeat OFF"
  );

}


/* =========================================================
   NEXT AYAH
   ========================================================= */

function playNextSakinAyah(){

  if(!SAKIN_AUDIO.currentSurah){

    return;

  }

  const nextAyah =
    SAKIN_AUDIO.currentAyah + 1;

  /*
    The final Ayah of each Surah will be
    determined from the verified Qur'an
    dataset.

    Until that dataset is connected,
    the system safely moves to the next
    Ayah number.
  */

  SAKIN_AUDIO.currentAyah =
    nextAyah;

  setSakinAudioPosition(
    SAKIN_AUDIO.currentSurah,
    nextAyah
  );

  highlightSakinAyah(
    SAKIN_AUDIO.currentSurah,
    nextAyah
  );

  playSakinAyah(
    SAKIN_AUDIO.currentSurah,
    nextAyah
  );

}


/* =========================================================
   PREVIOUS AYAH
   ========================================================= */

function playPreviousSakinAyah(){

  if(!SAKIN_AUDIO.currentSurah){

    return;

  }

  const previousAyah =
    Math.max(
      1,
      SAKIN_AUDIO.currentAyah - 1
    );

  SAKIN_AUDIO.currentAyah =
    previousAyah;

  setSakinAudioPosition(
    SAKIN_AUDIO.currentSurah,
    previousAyah
  );

  highlightSakinAyah(
    SAKIN_AUDIO.currentSurah,
    previousAyah
  );

  playSakinAyah(
    SAKIN_AUDIO.currentSurah,
    previousAyah
  );

}


/* =========================================================
   SELECT RECITER
   ========================================================= */

function setSakinReciter(reciterId){

  const exists =
    SAKIN_RECITERS.some(
      item => item.id === reciterId
    );

  if(!exists){

    return;

  }

  SAKIN_AUDIO.currentReciter =
    reciterId;

  localStorage.setItem(
    "sakinQuranReciter",
    reciterId
  );

  updateSakinAudioStatus(
    "Reciter selected"
  );

}


/* =========================================================
   LOAD SAVED RECITER
   ========================================================= */

function loadSakinReciter(){

  const saved =
    localStorage.getItem(
      "sakinQuranReciter"
    );

  if(saved){

    const exists =
      SAKIN_RECITERS.some(
        item => item.id === saved
      );

    if(exists){

      SAKIN_AUDIO.currentReciter =
        saved;

    }

  }

}


/* =========================================================
   HIGHLIGHT CURRENT AYAH
   ========================================================= */

function highlightSakinAyah(
  surah,
  ayah
){

  document
    .querySelectorAll(".ayah")
    .forEach(
      element =>
        element.classList.remove(
          "active"
        )
    );

  const target =
    document.querySelector(
      `[data-surah="${surah}"][data-ayah="${ayah}"]`
    );

  if(target){

    target.classList.add(
      "active"
    );

    target.scrollIntoView({
      behavior:"smooth",
      block:"center"
    });

  }

}


/* =========================================================
   AUDIO STATUS
   ========================================================= */

function updateSakinAudioStatus(
  message
){

  const status =
    document.getElementById(
      "audioStatus"
    );

  if(status){

    status.textContent =
      message;

  }

}


/* =========================================================
   AUDIO PLAYER CONTROLS
   ========================================================= */

function setSakinAudioVolume(
  volume
){

  const value =
    Math.max(
      0,
      Math.min(
        1,
        Number(volume)
      )
    );

  if(SAKIN_AUDIO.audio){

    SAKIN_AUDIO.audio.volume =
      value;

  }

}


/* =========================================================
   AUDIO CONTINUE
   ========================================================= */

function continueSakinAudio(){

  const saved =
    getSavedSakinAudioPosition();

  if(!saved){

    updateSakinAudioStatus(
      "No saved audio position yet."
    );

    return;

  }

  SAKIN_AUDIO.currentSurah =
    Number(saved.surah);

  SAKIN_AUDIO.currentAyah =
    Number(saved.ayah);

  playSakinAyah(
    SAKIN_AUDIO.currentSurah,
    SAKIN_AUDIO.currentAyah
  );

}


/* =========================================================
   INITIALIZE AUDIO SYSTEM
   ========================================================= */

function initializeSakinAudio(){

  loadSakinReciter();

  const saved =
    getSavedSakinAudioPosition();

  if(saved){

    SAKIN_AUDIO.currentSurah =
      Number(saved.surah);

    SAKIN_AUDIO.currentAyah =
      Number(saved.ayah);

  }

}


/* =========================================================
   GLOBAL ACCESS
   ========================================================= */

window.SAKIN_AUDIO =
  SAKIN_AUDIO;

window.SAKIN_RECITERS =
  SAKIN_RECITERS;

window.playSakinAyah =
  playSakinAyah;

window.playCurrentSakinAudio =
  playCurrentSakinAudio;

window.pauseSakinAudio =
  pauseSakinAudio;

window.stopSakinAudio =
  stopSakinAudio;

window.toggleSakinAudioRepeat =
  toggleSakinAudioRepeat;

window.playNextSakinAyah =
  playNextSakinAyah;

window.playPreviousSakinAyah =
  playPreviousSakinAyah;

window.setSakinReciter =
  setSakinReciter;

window.continueSakinAudio =
  continueSakinAudio;

window.setSakinAudioVolume =
  setSakinAudioVolume;

window.highlightSakinAyah =
  highlightSakinAyah;


/* =========================================================
   START
   ========================================================= */

initializeSakinAudio();
