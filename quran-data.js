/* =========================================================
   SAKIN QUR'AN DATA SYSTEM
   ========================================================= */

const SAKIN_QURAN_DATA = {

  version: "1.0",

  totalSurahs: 114,

  totalJuz: 30,

  languages: {
    bn: "বাংলা",
    en: "English",
    ar: "العربية",
    ur: "اردو",
    hi: "हिन्दी",
    tr: "Türkçe",
    id: "Bahasa Indonesia",
    ms: "Bahasa Melayu",
    fa: "فارسی"
  },

  arabicStyles: {
    uthmani: "Uthmani",
    indopak: "Indo-Pak / Hafizi",
    naskh: "Arabic Naskh"
  },

  tafsirs: [
    {
      id: "ibn-kathir",
      name: "Tafsir Ibn Kathir",
      language: "bn",
      available: false
    },

    {
      id: "ruh-al-mani",
      name: "Tafsir Ruh al-Ma'ani",
      language: "bn",
      available: false
    },

    {
      id: "jalalayn",
      name: "Tafsir al-Jalalayn",
      language: "bn",
      available: false
    },

    {
      id: "tabari",
      name: "Tafsir al-Tabari",
      language: "bn",
      available: false
    },

    {
      id: "qurtubi",
      name: "Tafsir al-Qurtubi",
      language: "bn",
      available: false
    },

    {
      id: "sadi",
      name: "Tafsir as-Sa'di",
      language: "bn",
      available: false
    },

    {
      id: "maariful-quran",
      name: "Ma'ariful Qur'an",
      language: "bn",
      available: false
    },

    {
      id: "abu-bakr-zakaria",
      name: "Tafsir Abu Bakr Zakaria",
      language: "bn",
      available: false
    },

    {
      id: "saeedi",
      name: "Tafsir Saeedi",
      language: "bn",
      available: false
    },

    {
      id: "other",
      name: "More Tafsir",
      language: "bn",
      available: false
    }
  ],

  surahs: [],

  juz: [],

  ayahs: {},

  translations: {},

  tafsirData: {},

  audio: {}

};


/* =========================================================
   CREATE 114 SURAH PLACEHOLDERS
   ========================================================= */

const SAKIN_SURAH_NAMES = [
  "Al-Fatihah",
  "Al-Baqarah",
  "Aal-E-Imran",
  "An-Nisa",
  "Al-Ma'idah",
  "Al-An'am",
  "Al-A'raf",
  "Al-Anfal",
  "At-Tawbah",
  "Yunus",
  "Hud",
  "Yusuf",
  "Ar-Ra'd",
  "Ibrahim",
  "Al-Hijr",
  "An-Nahl",
  "Al-Isra",
  "Al-Kahf",
  "Maryam",
  "Ta-Ha",
  "Al-Anbiya",
  "Al-Hajj",
  "Al-Mu'minun",
  "An-Nur",
  "Al-Furqan",
  "Ash-Shu'ara",
  "An-Naml",
  "Al-Qasas",
  "Al-Ankabut",
  "Ar-Rum",
  "Luqman",
  "As-Sajdah",
  "Al-Ahzab",
  "Saba",
  "Fatir",
  "Ya-Sin",
  "As-Saffat",
  "Sad",
  "Az-Zumar",
  "Ghafir",
  "Fussilat",
  "Ash-Shura",
  "Az-Zukhruf",
  "Ad-Dukhan",
  "Al-Jathiyah",
  "Al-Ahqaf",
  "Muhammad",
  "Al-Fath",
  "Al-Hujurat",
  "Qaf",
  "Adh-Dhariyat",
  "At-Tur",
  "An-Najm",
  "Al-Qamar",
  "Ar-Rahman",
  "Al-Waqi'ah",
  "Al-Hadid",
  "Al-Mujadilah",
  "Al-Hashr",
  "Al-Mumtahanah",
  "As-Saff",
  "Al-Jumu'ah",
  "Al-Munafiqun",
  "At-Taghabun",
  "At-Talaq",
  "At-Tahrim",
  "Al-Mulk",
  "Al-Qalam",
  "Al-Haqqah",
  "Al-Ma'arij",
  "Nuh",
  "Al-Jinn",
  "Al-Muzzammil",
  "Al-Muddaththir",
  "Al-Qiyamah",
  "Al-Insan",
  "Al-Mursalat",
  "An-Naba",
  "An-Nazi'at",
  "Abasa",
  "At-Takwir",
  "Al-Infitar",
  "Al-Mutaffifin",
  "Al-Inshiqaq",
  "Al-Buruj",
  "At-Tariq",
  "Al-A'la",
  "Al-Ghashiyah",
  "Al-Fajr",
  "Al-Balad",
  "Ash-Shams",
  "Al-Layl",
  "Ad-Duha",
  "Ash-Sharh",
  "At-Tin",
  "Al-Alaq",
  "Al-Qadr",
  "Al-Bayyinah",
  "Az-Zalzalah",
  "Al-Adiyat",
  "Al-Qari'ah",
  "At-Takathur",
  "Al-Asr",
  "Al-Humazah",
  "Al-Fil",
  "Quraysh",
  "Al-Ma'un",
  "Al-Kawthar",
  "Al-Kafirun",
  "An-Nasr",
  "Al-Masad",
  "Al-Ikhlas",
  "Al-Falaq",
  "An-Nas"
];


/* =========================================================
   BUILD SURAH STRUCTURE
   ========================================================= */

SAKIN_SURAH_NAMES.forEach((name, index) => {

  SAKIN_QURAN_DATA.surahs.push({

    number: index + 1,

    name: name,

    arabicName: "",

    revelation: "",

    totalAyahs: 0

  });

});


/* =========================================================
   CREATE 30 JUZ STRUCTURE
   ========================================================= */

for(let i = 1; i <= 30; i++){

  SAKIN_QURAN_DATA.juz.push({

    number: i,

    name: `Juz ${i}`,

    startSurah: null,

    startAyah: null,

    endSurah: null,

    endAyah: null

  });

}


/* =========================================================
   LANGUAGE MANAGEMENT
   ========================================================= */

function getSakinQuranLanguage(){

  return localStorage.getItem(
    "sakinQuranLanguage"
  ) || "bn";

}


function setSakinQuranLanguage(language){

  if(!SAKIN_QURAN_DATA.languages[language]){
    return;
  }

  localStorage.setItem(
    "sakinQuranLanguage",
    language
  );

}


/* =========================================================
   TAFSIR MANAGEMENT
   ========================================================= */

function getSakinTafsir(){

  return localStorage.getItem(
    "sakinTafsir"
  ) || "ibn-kathir";

}


function setSakinTafsir(tafsirId){

  const exists =
    SAKIN_QURAN_DATA.tafsirs.some(
      item => item.id === tafsirId
    );

  if(!exists){
    return;
  }

  localStorage.setItem(
    "sakinTafsir",
    tafsirId
  );

}


/* =========================================================
   READING PROGRESS
   ========================================================= */

function saveSakinQuranPosition(
  surah,
  ayah,
  juz = null
){

  const position = {

    surah: Number(surah),

    ayah: Number(ayah),

    juz: juz ? Number(juz) : null,

    savedAt: new Date().toISOString()

  };

  localStorage.setItem(
    "sakinQuranPosition",
    JSON.stringify(position)
  );

}


function getSakinQuranPosition(){

  try{

    const saved =
      localStorage.getItem(
        "sakinQuranPosition"
      );

    return saved
      ? JSON.parse(saved)
      : null;

  }catch(error){

    return null;

  }

}


/* =========================================================
   AUDIO PROGRESS
   ========================================================= */

function saveSakinQuranAudioPosition(
  surah,
  ayah
){

  const position = {

    surah: Number(surah),

    ayah: Number(ayah),

    savedAt: new Date().toISOString()

  };

  localStorage.setItem(
    "sakinQuranAudioPosition",
    JSON.stringify(position)
  );

}


function getSakinQuranAudioPosition(){

  try{

    const saved =
      localStorage.getItem(
        "sakinQuranAudioPosition"
      );

    return saved
      ? JSON.parse(saved)
      : null;

  }catch(error){

    return null;

  }

}


/* =========================================================
   DATA STATUS
   ========================================================= */

function getSakinQuranDataStatus(){

  return {

    surahs:
      SAKIN_QURAN_DATA.surahs.length,

    juz:
      SAKIN_QURAN_DATA.juz.length,

    languages:
      Object.keys(
        SAKIN_QURAN_DATA.languages
      ).length,

    tafsirs:
      SAKIN_QURAN_DATA.tafsirs.length,

    verifiedQuranTextLoaded:
      Object.keys(
        SAKIN_QURAN_DATA.ayahs
      ).length > 0

  };

}


/* =========================================================
   GLOBAL ACCESS
   ========================================================= */

window.SAKIN_QURAN_DATA =
  SAKIN_QURAN_DATA;

window.getSakinQuranLanguage =
  getSakinQuranLanguage;

window.setSakinQuranLanguage =
  setSakinQuranLanguage;

window.getSakinTafsir =
  getSakinTafsir;

window.setSakinTafsir =
  setSakinTafsir;

window.saveSakinQuranPosition =
  saveSakinQuranPosition;

window.getSakinQuranPosition =
  getSakinQuranPosition;

window.saveSakinQuranAudioPosition =
  saveSakinQuranAudioPosition;

window.getSakinQuranAudioPosition =
  getSakinQuranAudioPosition;

window.getSakinQuranDataStatus =
  getSakinQuranDataStatus;
