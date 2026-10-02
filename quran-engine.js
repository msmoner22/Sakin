/* =========================================================
   SAKIN QURAN ENGINE
   Surah • Juz • Ayah • Translation • Tafsir
   Word-by-Word • Bookmark • Continue Reading
   Offline Data Support
   ========================================================= */

(function () {
    "use strict";

    const state = {
        ready: false,
        manifest: null,
        resources: {},
        currentSurah: 1,
        currentAyah: 1,
        currentJuz: 1,
        currentPage: 1,
        translation: "bn",
        tafsir: null,
        wordByWord: true,
        readingMode: "hafizi15",
        arabicStyle: "uthmani",
        bookmarks: [],
        audio: null
    };

    /* -----------------------------------------------------
       BASIC HELPERS
       ----------------------------------------------------- */

    function loader() {
        return window.SakinQuranDataLoader || null;
    }

    async function loadData() {

        const dataLoader = loader();

        if (!dataLoader) {
            throw new Error(
                "quran-data-loader.js was not loaded."
            );
        }

        if (!dataLoader.isLoaded()) {
            await dataLoader.loadAll();
        }

        state.manifest =
            dataLoader.getManifest();

        state.resources =
            dataLoader.state.files || {};

        return state.resources;
    }

    function getResourceNames(prefix) {

        if (!state.manifest) {
            return [];
        }

        const resources =
            Array.isArray(state.manifest.resources)
                ? state.manifest.resources
                : [];

        return resources.filter(function (name) {
            return name.startsWith(prefix);
        });
    }

    function getResource(prefix) {

        const names =
            getResourceNames(prefix);

        for (const name of names) {

            if (state.resources[name]) {
                return state.resources[name];
            }
        }

        return null;
    }

    /* -----------------------------------------------------
       FIND RECORDS IN QURAN FOUNDATION DATA
       ----------------------------------------------------- */

    function findArray(value) {

        if (Array.isArray(value)) {
            return value;
        }

        if (!value || typeof value !== "object") {
            return [];
        }

        const possibleKeys = [
            "data",
            "items",
            "results",
            "verses",
            "ayahs",
            "chapters",
            "records"
        ];

        for (const key of possibleKeys) {

            if (Array.isArray(value[key])) {
                return value[key];
            }
        }

        return [];
    }

    function findRecords(value) {

        const direct =
            findArray(value);

        if (direct.length) {
            return direct;
        }

        if (
            value &&
            typeof value === "object"
        ) {

            for (const key of Object.keys(value)) {

                const nested =
                    findArray(value[key]);

                if (nested.length) {
                    return nested;
                }
            }
        }

        return [];
    }

    /* -----------------------------------------------------
       QURAN CORE
       ----------------------------------------------------- */

    function getCore() {
        return state.resources["quran_core_1"] || null;
    }

    function getCoreRecords() {

        return findRecords(
            getCore()
        );
    }

    function getChapters() {

        const core =
            getCore();

        if (!core) {
            return [];
        }

        if (Array.isArray(core.chapters)) {
            return core.chapters;
        }

        if (core.data &&
            Array.isArray(core.data.chapters)) {
            return core.data.chapters;
        }

        return [];
    }

    function getChapter(surahNumber) {

        const chapters =
            getChapters();

        return chapters.find(function (chapter) {

            return Number(
                chapter.id ||
                chapter.chapter_id ||
                chapter.number
            ) === Number(surahNumber);

        }) || null;
    }

    /* -----------------------------------------------------
       VERSES
       ----------------------------------------------------- */

    function getAllVerses() {

        const core =
            getCore();

        if (!core) {
            return [];
        }

        if (Array.isArray(core.verses)) {
            return core.verses;
        }

        if (
            core.data &&
            Array.isArray(core.data.verses)
        ) {
            return core.data.verses;
        }

        return getCoreRecords();
    }

    function getSurahVerses(surahNumber) {

        const verses =
            getAllVerses();

        return verses.filter(function (verse) {

            const chapter =
                verse.chapter_id ??
                verse.chapterId ??
                verse.surah_id ??
                verse.surahId;

            return Number(chapter) ===
                Number(surahNumber);

        });
    }

    function getAyah(surahNumber, ayahNumber) {

        const verses =
            getSurahVerses(surahNumber);

        return verses.find(function (verse) {

            const number =
                verse.verse_number ??
                verse.verseNumber ??
                verse.ayah_number ??
                verse.ayahNumber ??
                verse.number;

            return Number(number) ===
                Number(ayahNumber);

        }) || null;
    }

    /* -----------------------------------------------------
       TRANSLATIONS
       ----------------------------------------------------- */

    function getTranslationResources() {

        return getResourceNames(
            "translations_"
        );
    }

    function getTranslationData() {

        const names =
            getTranslationResources();

        const result = [];

        for (const name of names) {

            const data =
                state.resources[name];

            if (!data) {
                continue;
            }

            result.push({
                resource: name,
                data: data
            });
        }

        return result;
    }

    function findTranslationForAyah(
        surahNumber,
        ayahNumber
    ) {

        const resources =
            getTranslationData();

        for (const resource of resources) {

            const records =
                findRecords(resource.data);

            for (const item of records) {

                const chapter =
                    item.chapter_id ??
                    item.chapterId ??
                    item.surah_id ??
                    item.surahId;

                const ayah =
                    item.verse_number ??
                    item.verseNumber ??
                    item.ayah_number ??
                    item.ayahNumber;

                if (
                    Number(chapter) ===
                        Number(surahNumber) &&
                    Number(ayah) ===
                        Number(ayahNumber)
                ) {

                    return {
                        resource: resource.resource,
                        text:
                            item.text ||
                            item.translation ||
                            item.translated_text ||
                            item.content ||
                            ""
                    };
                }
            }
        }

        return null;
    }

    /* -----------------------------------------------------
       WORD BY WORD
       ----------------------------------------------------- */

    function getWordByWordResources() {

        return getResourceNames(
            "word_by_word_translations_"
        );
    }

    function getWordsForAyah(
        surahNumber,
        ayahNumber
    ) {

        const names =
            getWordByWordResources();

        const words = [];

        for (const name of names) {

            const data =
                state.resources[name];

            const records =
                findRecords(data);

            for (const item of records) {

                const chapter =
                    item.chapter_id ??
                    item.chapterId ??
                    item.surah_id ??
                    item.surahId;

                const ayah =
                    item.verse_number ??
                    item.verseNumber ??
                    item.ayah_number ??
                    item.ayahNumber;

                if (
                    Number(chapter) ===
                        Number(surahNumber) &&
                    Number(ayah) ===
                        Number(ayahNumber)
                ) {

                    words.push(item);
                }
            }
        }

        return words;
    }

    /* -----------------------------------------------------
       TAFSIR
       ----------------------------------------------------- */

    function getTafsirResources() {

        return getResourceNames(
            "tafsirs_"
        );
    }

    function getTafsirForAyah(
        surahNumber,
        ayahNumber
    ) {

        const names =
            getTafsirResources();

        for (const name of names) {

            const data =
                state.resources[name];

            const records =
                findRecords(data);

            for (const item of records) {

                const chapter =
                    item.chapter_id ??
                    item.chapterId ??
                    item.surah_id ??
                    item.surahId;

                const ayah =
                    item.verse_number ??
                    item.verseNumber ??
                    item.ayah_number ??
                    item.ayahNumber;

                if (
                    Number(chapter) ===
                        Number(surahNumber) &&
                    Number(ayah) ===
                        Number(ayahNumber)
                ) {

                    return {
                        resource: name,
                        text:
                            item.text ||
                            item.tafsir_text ||
                            item.content ||
                            ""
                    };
                }
            }
        }

        return null;
    }

    /* -----------------------------------------------------
       BOOKMARK
       ----------------------------------------------------- */

    function loadBookmarks() {

        try {

            const saved =
                localStorage.getItem(
                    "sakin_quran_bookmarks"
                );

            state.bookmarks =
                saved
                    ? JSON.parse(saved)
                    : [];

        } catch (error) {

            state.bookmarks = [];
        }
    }

    function saveBookmarks() {

        localStorage.setItem(
            "sakin_quran_bookmarks",
            JSON.stringify(
                state.bookmarks
            )
        );
    }

    function addBookmark(
        surah,
        ayah
    ) {

        const exists =
            state.bookmarks.some(function (item) {

                return (
                    Number(item.surah) ===
                        Number(surah) &&
                    Number(item.ayah) ===
                        Number(ayah)
                );

            });

        if (!exists) {

            state.bookmarks.push({
                surah: Number(surah),
                ayah: Number(ayah),
                createdAt:
                    new Date().toISOString()
            });

            saveBookmarks();
        }
    }

    function removeBookmark(
        surah,
        ayah
    ) {

        state.bookmarks =
            state.bookmarks.filter(function (item) {

                return !(
                    Number(item.surah) ===
                        Number(surah) &&
                    Number(item.ayah) ===
                        Number(ayah)
                );

            });

        saveBookmarks();
    }

    /* -----------------------------------------------------
       CONTINUE READING
       ----------------------------------------------------- */

    function savePosition() {

        localStorage.setItem(
            "sakin_quran_continue_reading",
            JSON.stringify({
                surah: state.currentSurah,
                ayah: state.currentAyah,
                juz: state.currentJuz,
                page: state.currentPage
            })
        );
    }

    function loadPosition() {

        try {

            const saved =
                localStorage.getItem(
                    "sakin_quran_continue_reading"
                );

            if (!saved) {
                return;
            }

            const position =
                JSON.parse(saved);

            if (position.surah) {
                state.currentSurah =
                    Number(position.surah);
            }

            if (position.ayah) {
                state.currentAyah =
                    Number(position.ayah);
            }

            if (position.juz) {
                state.currentJuz =
                    Number(position.juz);
            }

            if (position.page) {
                state.currentPage =
                    Number(position.page);
            }

        } catch (error) {
            console.warn(
                "Could not restore Quran position."
            );
        }
    }

    /* -----------------------------------------------------
       SETTINGS
       ----------------------------------------------------- */

    function setTranslation(language) {
        state.translation =
            language || "bn";

        saveSettings();
        render();
    }

    function setReadingMode(mode) {

        const allowed = [
            "noorani",
            "hafizi15",
            "uthmani",
            "indopak"
        ];

        if (allowed.includes(mode)) {
            state.readingMode = mode;
            saveSettings();
            render();
        }
    }

    function setArabicStyle(style) {

        const allowed = [
            "uthmani",
            "indopak",
            "naskh"
        ];

        if (allowed.includes(style)) {
            state.arabicStyle = style;
            saveSettings();
            render();
        }
    }

    function saveSettings() {

        localStorage.setItem(
            "sakin_quran_settings",
            JSON.stringify({
                translation: state.translation,
                readingMode: state.readingMode,
                arabicStyle: state.arabicStyle,
                wordByWord: state.wordByWord
            })
        );
    }

    function loadSettings() {

        try {

            const saved =
                localStorage.getItem(
                    "sakin_quran_settings"
                );

            if (!saved) {
                return;
            }

            const settings =
                JSON.parse(saved);

            if (settings.translation) {
                state.translation =
                    settings.translation;
            }

            if (settings.readingMode) {
                state.readingMode =
                    settings.readingMode;
            }

            if (settings.arabicStyle) {
                state.arabicStyle =
                    settings.arabicStyle;
            }

            if (
                typeof settings.wordByWord ===
                "boolean"
            ) {
                state.wordByWord =
                    settings.wordByWord;
            }

        } catch (error) {
            console.warn(
                "Could not load Quran settings."
            );
        }
    }

    /* -----------------------------------------------------
       NAVIGATION
       ----------------------------------------------------- */

    async function openSurah(number) {

        const chapter =
            getChapter(number);

        if (!chapter) {
            console.warn(
                "Surah not found:",
                number
            );
        }

        state.currentSurah =
            Number(number);

        state.currentAyah = 1;

        savePosition();

        render();

        return chapter;
    }

    async function openAyah(
        surah,
        ayah
    ) {

        state.currentSurah =
            Number(surah);

        state.currentAyah =
            Number(ayah);

        savePosition();

        render();

        return getAyah(
            surah,
            ayah
        );
    }

    function nextAyah() {

        const verses =
            getSurahVerses(
                state.currentSurah
            );

        if (
            state.currentAyah <
            verses.length
        ) {

            state.currentAyah++;

        } else if (
            state.currentSurah < 114
        ) {

            state.currentSurah++;
            state.currentAyah = 1;
        }

        savePosition();
        render();
    }

    function previousAyah() {

        if (state.currentAyah > 1) {

            state.currentAyah--;

        } else if (
            state.currentSurah > 1
        ) {

            state.currentSurah--;

            const verses =
                getSurahVerses(
                    state.currentSurah
                );

            state.currentAyah =
                verses.length || 1;
        }

        savePosition();
        render();
    }

    /* -----------------------------------------------------
       RENDER
       ----------------------------------------------------- */

    function escapeHTML(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function getArabicText(ayah) {

        if (!ayah) {
            return "";
        }

        return (
            ayah.text_uthmani ||
            ayah.uthmani ||
            ayah.text_indopak ||
            ayah.indopak ||
            ayah.text ||
            ayah.text_naskh ||
            ""
        );
    }

    function renderAyah(
        ayah
    ) {

        const number =
            ayah.verse_number ??
            ayah.verseNumber ??
            ayah.ayah_number ??
            ayah.ayahNumber ??
            ayah.number ??
            "";

        const arabic =
            getArabicText(ayah);

        const translation =
            findTranslationForAyah(
                state.currentSurah,
                number
            );

        const tafsir =
            getTafsirForAyah(
                state.currentSurah,
                number
            );

        let html = "";

        html +=
            '<article class="sakin-ayah">';

        html +=
            '<div class="sakin-ayah-number">' +
            escapeHTML(number) +
            "</div>";

        html +=
            '<div class="sakin-arabic ' +
            escapeHTML(
                state.arabicStyle
            ) +
            '">' +
            escapeHTML(arabic) +
            "</div>";

        if (
            state.wordByWord
        ) {

            const words =
                getWordsForAyah(
                    state.currentSurah,
                    number
                );

            if (words.length) {

                html +=
                    '<div class="sakin-word-by-word">';

                for (const word of words) {

                    const arabicWord =
                        word.text ||
                        word.word ||
                        word.arabic ||
                        "";

                    const meaning =
                        word.translation ||
                        word.translated_text ||
                        word.meaning ||
                        "";

                    html +=
                        '<span class="sakin-word">' +
                        '<span class="sakin-word-arabic">' +
                        escapeHTML(
                            arabicWord
                        ) +
                        "</span>" +
                        '<span class="sakin-word-meaning">' +
                        escapeHTML(
                            meaning
                        ) +
                        "</span>" +
                        "</span>";
                }

                html += "</div>";
            }
        }

        if (translation) {

            html +=
                '<div class="sakin-translation">' +
                escapeHTML(
                    translation.text
                ) +
                "</div>";
        }

        if (tafsir) {

            html +=
                '<details class="sakin-tafsir">' +
                "<summary>তাফসির</summary>" +
                "<div>" +
                escapeHTML(
                    tafsir.text
                ) +
                "</div>" +
                "</details>";
        }

        html += "</article>";

        return html;
    }

    function render() {

        const container =
            document.querySelector(
                "#sakin-quran-reader"
            );

        if (!container) {
            return;
        }

        const chapter =
            getChapter(
                state.currentSurah
            );

        const verses =
            getSurahVerses(
                state.currentSurah
            );

        let html = "";

        html +=
            '<div class="sakin-quran-toolbar">';

        html +=
            "<button " +
            'onclick="SakinQuranEngine.previousAyah()">' +
            "← আগের" +
            "</button>";

        html +=
            "<strong>" +
            escapeHTML(
                chapter?.name_simple ||
                chapter?.name ||
                "Surah " +
                state.currentSurah
            ) +
            "</strong>";

        html +=
            "<button " +
            'onclick="SakinQuranEngine.nextAyah()">' +
            "পরের →" +
            "</button>";

        html += "</div>";

        if (!verses.length) {

            html +=
                '<div class="sakin-quran-empty">' +
                "এই সূরার আয়াত ডেটা পাওয়া যায়নি।" +
                "</div>";

        } else {

            for (const ayah of verses) {
                html += renderAyah(ayah);
            }
        }

        container.innerHTML =
            html;
    }

    /* -----------------------------------------------------
       INITIALIZATION
       ----------------------------------------------------- */

    async function init() {

        if (state.ready) {
            render();
            return;
        }

        loadSettings();
        loadPosition();
        loadBookmarks();

        await loadData();

        state.ready = true;

        render();

        return state;
    }

    /* -----------------------------------------------------
       PUBLIC API
       ----------------------------------------------------- */

    window.SakinQuranEngine = {

        init,

        state,

        getChapters,
        getChapter,
        getAllVerses,
        getSurahVerses,
        getAyah,

        getTranslationData,
        findTranslationForAyah,

        getWordsForAyah,

        getTafsirResources,
        getTafsirForAyah,

        openSurah,
        openAyah,
        nextAyah,
        previousAyah,

        setTranslation,
        setReadingMode,
        setArabicStyle,

        addBookmark,
        removeBookmark,

        savePosition,
        loadPosition,

        saveSettings,
        loadSettings,

        render
    };

})();
