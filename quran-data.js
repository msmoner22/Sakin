/* =========================================================
   SAKIN QURAN DATA SYSTEM
   Foundation for:
   - Noorani Quran Sharif
   - 15-line Hafizi Quran Sharif
   - Multiple Arabic display styles
   - Bengali meaning
   - Bengali pronunciation
   - English translation
   - Scalable multi-language system
   - Tafsir system
   ========================================================= */


/* ---------------------------------------------------------
   1. QURAN DISPLAY MODES
   --------------------------------------------------------- */

const SAKIN_QURAN_CONFIG = {

    defaultReadingMode: "noorani",

    readingModes: {

        noorani: {
            id: "noorani",
            name: "Noorani Quran Sharif",
            description: "Noorani-style Quran reading mode",
            available: true
        },

        hafizi15: {
            id: "hafizi15",
            name: "15-Line Hafizi Quran Sharif",
            description: "15-line Hafizi Quran reading mode",
            available: true
        }

    }

};


/* ---------------------------------------------------------
   2. ARABIC DISPLAY STYLES
   --------------------------------------------------------- */

const SAKIN_ARABIC_STYLES = {

    uthmani: {
        id: "uthmani",
        name: "Uthmani / Osmani",
        description: "Uthmani Quran script"
    },

    indopak: {
        id: "indopak",
        name: "Indo-Pak",
        description: "Indo-Pak Quran script"
    },

    naskh: {
        id: "naskh",
        name: "Naskh",
        description: "Naskh Arabic display"
    }

};


/* ---------------------------------------------------------
   3. TRANSLATION SYSTEM
   --------------------------------------------------------- */

const SAKIN_TRANSLATION_LANGUAGES = {

    bn: {
        id: "bn",
        name: "বাংলা অর্থ",
        nativeName: "বাংলা",
        type: "translation",
        direction: "rtl"
    },

    bn_pronunciation: {
        id: "bn_pronunciation",
        name: "বাংলা উচ্চারণ",
        nativeName: "বাংলা উচ্চারণ",
        type: "transliteration",
        direction: "ltr"
    },

    en: {
        id: "en",
        name: "English Translation",
        nativeName: "English",
        type: "translation",
        direction: "ltr"
    },

    ar: {
        id: "ar",
        name: "Arabic",
        nativeName: "العربية",
        type: "translation",
        direction: "rtl"
    }

};


/*
   ভবিষ্যতে এখানে আরও ভাষা যোগ করা যাবে।

   উদাহরণ:

   SAKIN_TRANSLATION_LANGUAGES["ur"] = {
       id: "ur",
       name: "Urdu",
       nativeName: "اردو",
       type: "translation",
       direction: "rtl"
   };

   একই পদ্ধতিতে পৃথিবীর আরও অনেক ভাষা যুক্ত করা যাবে।
*/


/* ---------------------------------------------------------
   4. TAFSIR SYSTEM
   --------------------------------------------------------- */

const SAKIN_TAFSIRS = [

    {
        id: "ibn_kathir",
        name: "Tafsir Ibn Kathir",
        language: "multi"
    },

    {
        id: "ruh_al_maani",
        name: "Tafsir Ruh al-Ma'ani",
        language: "multi"
    },

    {
        id: "jalalayn",
        name: "Tafsir al-Jalalayn",
        language: "multi"
    },

    {
        id: "saeedi",
        name: "Tafsir Saeedi",
        language: "bn"
    },

    {
        id: "abu_bakr_zakaria",
        name: "Tafsir Abu Bakr Zakaria",
        language: "bn"
    },

    {
        id: "tafsir_10",
        name: "Additional Verified Tafsir",
        language: "multi"
    },

    {
        id: "tafsir_11",
        name: "Additional Verified Tafsir",
        language: "multi"
    },

    {
        id: "tafsir_12",
        name: "Additional Verified Tafsir",
        language: "multi"
    },

    {
        id: "tafsir_13",
        name: "Additional Verified Tafsir",
        language: "multi"
    },

    {
        id: "tafsir_14",
        name: "Additional Verified Tafsir",
        language: "multi"
    }

];


/* ---------------------------------------------------------
   5. 114 SURAH NAMES
   --------------------------------------------------------- */

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


/* ---------------------------------------------------------
   6. QURAN DATA STRUCTURE
   ---------------------------------------------------------

   এখানে এখনো আসল আয়াত বসানো হচ্ছে না।

   পরবর্তী ধাপে যাচাই করা Quran dataset যুক্ত হবে।

   Structure:

   SAKIN_QURAN_DATA = {
       1: {
           name: "Al-Fatihah",
           ayahs: [
               {
                   number: 1,

                   arabic: {
                       uthmani: "...",
                       indopak: "...",
                       naskh: "..."
                   },

                   translation: {
                       bn: "...",
                       bn_pronunciation: "...",
                       en: "...",
                       ar: "..."
                   }
               }
           ]
       }
   }

   --------------------------------------------------------- */

const SAKIN_QURAN_DATA = {};


/* ---------------------------------------------------------
   7. FUTURE MULTI-LANGUAGE SYSTEM
   --------------------------------------------------------- */

const SAKIN_LANGUAGE_SYSTEM = {

    currentLanguage: "bn",

    supportedLanguages: [

        "bn",
        "bn_pronunciation",
        "en",
        "ar"

    ],

    maximumPlannedLanguages: 100,

    translationSourcePolicy:
        "Only verified and properly licensed translations should be added."

};


/* ---------------------------------------------------------
   8. QURAN READING SETTINGS
   --------------------------------------------------------- */

const SAKIN_QURAN_READING_SETTINGS = {

    readingMode: "noorani",

    arabicStyle: "uthmani",

    translationLanguage: "bn",

    showArabic: true,

    showTranslation: true,

    showPronunciation: false,

    showTafsir: false,

    autoSavePosition: true,

    lastSurah: 1,

    lastAyah: 1

};


/* ---------------------------------------------------------
   9. JUZ INFORMATION
   --------------------------------------------------------- */

const SAKIN_JUZ_LIST = Array.from(
    { length: 30 },
    (_, index) => ({
        juz: index + 1,
        name: "Juz " + (index + 1)
    })
);


/* ---------------------------------------------------------
   10. EXPORT TO WINDOW
   --------------------------------------------------------- */

window.SAKIN_QURAN_CONFIG =
    SAKIN_QURAN_CONFIG;

window.SAKIN_ARABIC_STYLES =
    SAKIN_ARABIC_STYLES;

window.SAKIN_TRANSLATION_LANGUAGES =
    SAKIN_TRANSLATION_LANGUAGES;

window.SAKIN_TAFSIRS =
    SAKIN_TAFSIRS;

window.SAKIN_SURAH_NAMES =
    SAKIN_SURAH_NAMES;

window.SAKIN_QURAN_DATA =
    SAKIN_QURAN_DATA;

window.SAKIN_LANGUAGE_SYSTEM =
    SAKIN_LANGUAGE_SYSTEM;

window.SAKIN_QURAN_READING_SETTINGS =
    SAKIN_QURAN_READING_SETTINGS;

window.SAKIN_JUZ_LIST =
    SAKIN_JUZ_LIST;
