/* =========================================================
   SAKIN QURAN ENGINE CONFIGURATION
   Complete Quran architecture
   ========================================================= */

const SAKIN_QURAN_ENGINE = {

    /* -----------------------------------------
       Quran structure
       ----------------------------------------- */

    totalSurahs: 114,

    totalJuz: 30,

    totalAyahs: 6236,

    readingModes: {

        surah: {
            id: "surah",
            name: "Surah",
            description: "Read Quran by Surah"
        },

        juz: {
            id: "juz",
            name: "Juz / Para",
            description: "Read Quran by Juz / Para"
        },

        verse: {
            id: "verse",
            name: "Ayah",
            description: "Read Quran Ayah by Ayah"
        },

        word: {
            id: "word",
            name: "Word by Word",
            description: "Read Quran word by word"
        },

        mushaf: {
            id: "mushaf",
            name: "Mushaf",
            description: "Read Quran in Mushaf layout"
        }

    },


    /* -----------------------------------------
       Mushaf / Arabic display
       ----------------------------------------- */

    mushafModes: {

        uthmani: {
            id: "uthmani",
            name: "Uthmani / Osmani",
            apiMushafId: 4
        },

        indopak: {
            id: "indopak",
            name: "Indo-Pak",
            apiMushafId: 3
        },

        indopak15: {
            id: "indopak15",
            name: "Indo-Pak 15-Line Hafizi",
            apiMushafId: 6
        },

        naskh: {
            id: "naskh",
            name: "Naskh",
            apiMushafId: 4
        }

    },


    /* -----------------------------------------
       Data fields required by Sakin
       ----------------------------------------- */

    verseFields: [

        "chapter_id",
        "verse_number",
        "verse_key",

        "text_uthmani",
        "text_indopak",

        "juz_number",
        "hizb_number",
        "rub_el_hizb_number",

        "page_number",
        "ruku_number",
        "manzil_number"

    ],


    /* -----------------------------------------
       Word-level fields
       ----------------------------------------- */

    wordFields: [

        "verse_id",
        "chapter_id",
        "verse_key",

        "position",

        "text_uthmani",
        "text_indopak",

        "text_imlaei",

        "page_number",
        "line_number",

        "audio_url",

        "char_type_name"

    ],


    /* -----------------------------------------
       Translation system
       ----------------------------------------- */

    translations: {

        bn: {
            id: "bn",
            name: "বাংলা অর্থ",
            type: "translation"
        },

        bnPronunciation: {
            id: "bn-pronunciation",
            name: "বাংলা উচ্চারণ",
            type: "transliteration"
        },

        en: {
            id: "en",
            name: "English",
            type: "translation"
        },

        ar: {
            id: "ar",
            name: "العربية",
            type: "translation"
        }

    },


    /* -----------------------------------------
       Future language expansion
       ----------------------------------------- */

    languageSystem: {

        currentLanguage: "bn",

        maximumLanguages: 100,

        allowExpansion: true,

        languages: [

            "bn",
            "en",
            "ar"

        ]

    },


    /* -----------------------------------------
       Tafsir system
       ----------------------------------------- */

    tafsir: {

        enabled: true,

        resources: [

            {
                id: "ibn-kathir",
                name: "Tafsir Ibn Kathir"
            },

            {
                id: "ruh-al-maani",
                name: "Tafsir Ruh al-Ma'ani"
            },

            {
                id: "jalalayn",
                name: "Tafsir al-Jalalayn"
            },

            {
                id: "saeedi",
                name: "Tafsir Saeedi"
            },

            {
                id: "abu-bakr-zakaria",
                name: "Tafsir Abu Bakr Zakaria"
            }

        ]

    },


    /* -----------------------------------------
       Reading position / bookmark
       ----------------------------------------- */

    bookmark: {

        enabled: true,

        storageKey: "sakin_quran_bookmark",

        fields: [

            "surah",
            "ayah",
            "juz",
            "page",
            "line",
            "word"

        ]

    },


    /* -----------------------------------------
       Continue Reading
       ----------------------------------------- */

    continueReading: {

        enabled: true,

        storageKey: "sakin_quran_continue",

        autoSave: true,

        saveOnAyahChange: true,

        saveOnPageChange: true,

        saveOnExit: true

    },


    /* -----------------------------------------
       Mushaf page system
       ----------------------------------------- */

    pages: {

        madani: 604,

        indoPak15Line: 610,

        supportDifferentLayouts: true

    },


    /* -----------------------------------------
       Word-by-word system
       ----------------------------------------- */

    wordByWord: {

        enabled: true,

        showArabicWord: true,

        showTranslation: true,

        showTransliteration: true,

        highlightSelectedWord: true

    },


    /* -----------------------------------------
       Line-by-line system
       ----------------------------------------- */

    lineByLine: {

        enabled: true,

        groupByPage: true,

        groupByLine: true,

        preserveMushafOrder: true

    },


    /* -----------------------------------------
       Audio system
       ----------------------------------------- */

    audio: {

        enabled: true,

        ayahAudio: true,

        wordAudio: true,

        autoNextAyah: true,

        repeatAyah: true,

        repeatSurah: true,

        savePosition: true

    }

};


/* =========================================================
   BOOKMARK FUNCTIONS
   ========================================================= */

function saveSakinQuranBookmark(data) {

    const bookmark = {

        surah: data.surah || 1,

        ayah: data.ayah || 1,

        juz: data.juz || 1,

        page: data.page || 1,

        line: data.line || 1,

        word: data.word || 1,

        savedAt: new Date().toISOString()

    };

    localStorage.setItem(

        SAKIN_QURAN_ENGINE.bookmark.storageKey,

        JSON.stringify(bookmark)

    );

    return bookmark;

}


function getSakinQuranBookmark() {

    const saved = localStorage.getItem(

        SAKIN_QURAN_ENGINE.bookmark.storageKey

    );

    if (!saved) {

        return null;

    }

    try {

        return JSON.parse(saved);

    } catch (error) {

        return null;

    }

}


/* =========================================================
   CONTINUE READING
   ========================================================= */

function saveSakinQuranProgress(data) {

    const progress = {

        surah: data.surah || 1,

        ayah: data.ayah || 1,

        juz: data.juz || 1,

        page: data.page || 1,

        line: data.line || 1,

        word: data.word || 1,

        savedAt: new Date().toISOString()

    };

    localStorage.setItem(

        SAKIN_QURAN_ENGINE.continueReading.storageKey,

        JSON.stringify(progress)

    );

    return progress;

}


function getSakinQuranProgress() {

    const saved = localStorage.getItem(

        SAKIN_QURAN_ENGINE.continueReading.storageKey

    );

    if (!saved) {

        return null;

    }

    try {

        return JSON.parse(saved);

    } catch (error) {

        return null;

    }

}


/* =========================================================
   CLEAR PROGRESS
   ========================================================= */

function clearSakinQuranProgress() {

    localStorage.removeItem(

        SAKIN_QURAN_ENGINE.continueReading.storageKey

    );

}


/* =========================================================
   EXPORT
   ========================================================= */

window.SAKIN_QURAN_ENGINE =
    SAKIN_QURAN_ENGINE;

window.saveSakinQuranBookmark =
    saveSakinQuranBookmark;

window.getSakinQuranBookmark =
    getSakinQuranBookmark;

window.saveSakinQuranProgress =
    saveSakinQuranProgress;

window.getSakinQuranProgress =
    getSakinQuranProgress;

window.clearSakinQuranProgress =
    clearSakinQuranProgress;
