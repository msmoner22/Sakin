/* =========================================================
   SAKIN QURAN ENGINE
   Version: 1.0
   ---------------------------------------------------------
   Works with:
   - quran-data/ synced JSON files
   - quran-mushaf.js
   - quran-offline.js
   - quran-reader.css
   - SakinQuranAPI
   ========================================================= */

(function () {
  "use strict";

  /* =======================================================
     CONFIG
     ======================================================= */

  const CONFIG = {
    dataPath: "./quran-data/",
    manifestFile: "manifest.json",

    coreFile: "quran_core_1.json",
    mushafFile: "mushafs_1.json",

    storage: {
      settings: "sakin_quran_engine_settings",
      position: "sakin_quran_continue_reading",
      bookmarks: "sakin_quran_bookmarks",
      lastSurah: "sakin_quran_last_surah",
      lastPage: "sakin_quran_last_page",
      lastJuz: "sakin_quran_last_juz"
    },

    defaults: {
      language: "bn",
      translation: true,
      wordByWord: true,
      tafsir: false,
      audio: true,
      autoPlay: false,
      mushaf: "indopak15"
    }
  };


  /* =======================================================
     STATE
     ======================================================= */

  const state = {
    ready: false,
    loading: false,

    manifest: null,
    resources: {},

    core: {
      chapters: [],
      verses: [],
      words: [],
      juz: [],
      hizb: [],
      rubElHizb: []
    },

    mushaf: {
      records: []
    },

    translations: [],
    wordTranslations: [],
    tafsirs: [],

    current: {
      surah: 1,
      ayah: 1,
      page: 1,
      juz: 1,
      verseKey: "1:1"
    },

    settings: {},
    bookmarks: [],

    audio: {
      element: null,
      currentUrl: null,
      currentAyah: null,
      playing: false
    }
  };


  /* =======================================================
     UTILITY
     ======================================================= */

  function qs(selector, root = document) {
    return root.querySelector(selector);
  }

  function qsa(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
  }

  function escapeHTML(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function number(value, fallback = 0) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function unique(array) {
    return [...new Set(array)];
  }

  function normalizeRecords(data) {
    if (!data) return [];

    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data.records)) {
      return data.records;
    }

    if (Array.isArray(data.data)) {
      return data.data;
    }

    if (Array.isArray(data.chapters)) {
      return data.chapters;
    }

    if (Array.isArray(data.verses)) {
      return data.verses;
    }

    return [];
  }


  /* =======================================================
     STORAGE
     ======================================================= */

  function loadJSON(key, fallback) {
    try {
      const value = localStorage.getItem(key);

      if (!value) {
        return fallback;
      }

      return JSON.parse(value);
    } catch (error) {
      console.warn("Sakin Quran storage read error:", error);
      return fallback;
    }
  }

  function saveJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn("Sakin Quran storage write error:", error);
    }
  }

  function loadSettings() {
    state.settings = {
      ...CONFIG.defaults,
      ...loadJSON(CONFIG.storage.settings, {})
    };
  }

  function saveSettings() {
    saveJSON(CONFIG.storage.settings, state.settings);
  }

  function loadBookmarks() {
    state.bookmarks = loadJSON(CONFIG.storage.bookmarks, []);

    if (!Array.isArray(state.bookmarks)) {
      state.bookmarks = [];
    }
  }

  function saveBookmarks() {
    saveJSON(CONFIG.storage.bookmarks, state.bookmarks);
  }


  /* =======================================================
     DATA LOADING
     ======================================================= */

  async function fetchJSON(file) {
    const url = CONFIG.dataPath + file;

    const response = await fetch(url, {
      method: "GET",
      cache: "no-cache",
      headers: {
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(
        "Unable to load Quran data: " +
        file +
        " (" +
        response.status +
        ")"
      );
    }

    return response.json();
  }


  async function loadManifest() {
    try {
      state.manifest = await fetchJSON(CONFIG.manifestFile);
      return state.manifest;
    } catch (error) {
      console.warn(
        "Sakin Quran manifest unavailable:",
        error
      );

      state.manifest = {
        resources: []
      };

      return state.manifest;
    }
  }


  function resourceExists(resourceName) {
    if (!state.manifest) return false;

    const resources = Array.isArray(
      state.manifest.resources
    )
      ? state.manifest.resources
      : [];

    return resources.includes(resourceName);
  }


  async function loadResourceFile(fileName, key) {
    try {
      const data = await fetchJSON(fileName);

      state.resources[key] = data;

      return data;
    } catch (error) {
      console.warn(
        "Optional Quran resource unavailable:",
        fileName,
        error
      );

      state.resources[key] = null;

      return null;
    }
  }


  /* =======================================================
     CORE DATA
     ======================================================= */

  async function loadCore() {
    const data = await loadResourceFile(
      CONFIG.coreFile,
      "quran_core"
    );

    if (!data) {
      return;
    }

    const records = normalizeRecords(data);

    state.core.chapters = records.filter(
      r => r.record_type === "chapter"
    );

    state.core.verses = records.filter(
      r => r.record_type === "verse"
    );

    state.core.words = records.filter(
      r => r.record_type === "word"
    );

    state.core.juz = records.filter(
      r => r.record_type === "juz"
    );

    state.core.hizb = records.filter(
      r => r.record_type === "hizb"
    );

    state.core.rubElHizb = records.filter(
      r => r.record_type === "rub_el_hizb"
    );

    /*
     * Some snapshots can use separate arrays.
     */

    if (
      state.core.verses.length === 0 &&
      Array.isArray(data.verses)
    ) {
      state.core.verses = data.verses;
    }

    if (
      state.core.chapters.length === 0 &&
      Array.isArray(data.chapters)
    ) {
      state.core.chapters = data.chapters;
    }

    if (
      state.core.words.length === 0 &&
      Array.isArray(data.words)
    ) {
      state.core.words = data.words;
    }
  }


  /* =======================================================
     MUSHAF DATA
     ======================================================= */

  async function loadMushaf() {
    const data = await loadResourceFile(
      CONFIG.mushafFile,
      "mushaf"
    );

    if (!data) {
      return;
    }

    state.mushaf.records = normalizeRecords(data);
  }


  /* =======================================================
     OTHER RESOURCE DISCOVERY
     ======================================================= */

  function findResourceFiles(prefix) {
    const resources =
      state.manifest &&
      Array.isArray(state.manifest.resources)
        ? state.manifest.resources
        : [];

    return resources.filter(
      resource => resource.startsWith(prefix)
    );
  }


  async function loadAllTranslations() {
    const files = findResourceFiles("translations_");

    for (const resource of files) {
      const file = resource + ".json";

      const data = await loadResourceFile(
        file,
        resource
      );

      if (!data) continue;

      const records = normalizeRecords(data);

      state.translations.push({
        resource,
        records
      });
    }
  }


  async function loadAllWordTranslations() {
    const files = findResourceFiles(
      "word_by_word_translations_"
    );

    for (const resource of files) {
      const file = resource + ".json";

      const data = await loadResourceFile(
        file,
        resource
      );

      if (!data) continue;

      const records = normalizeRecords(data);

      state.wordTranslations.push({
        resource,
        records
      });
    }
  }


  async function loadAllTafsirs() {
    const files = findResourceFiles("tafsirs_");

    for (const resource of files) {
      const file = resource + ".json";

      const data = await loadResourceFile(
        file,
        resource
      );

      if (!data) continue;

      const records = normalizeRecords(data);

      state.tafsirs.push({
        resource,
        records
      });
    }
  }


  /* =======================================================
     CHAPTER / SURAH
     ======================================================= */

  function getSurahs() {
    return [...state.core.chapters]
      .sort(
        (a, b) =>
          number(a.chapter_number ?? a.id) -
          number(b.chapter_number ?? b.id)
      );
  }


  function getSurah(surahNumber) {
    const n = number(surahNumber);

    return (
      state.core.chapters.find(
        chapter =>
          number(
            chapter.chapter_number ??
            chapter.id
          ) === n
      ) || null
    );
  }


  function getVersesForSurah(surahNumber) {
    const n = number(surahNumber);

    return state.core.verses
      .filter(
        verse =>
          number(verse.chapter_id) === n
      )
      .sort(
        (a, b) =>
          number(
            a.verse_number ??
            a.verse_index
          ) -
          number(
            b.verse_number ??
            b.verse_index
          )
      );
  }


  function getVerse(verseKey) {
    return (
      state.core.verses.find(
        verse =>
          verse.verse_key === verseKey
      ) || null
    );
  }


  /* =======================================================
     WORDS
     ======================================================= */

  function getWordsForVerse(verse) {
    if (!verse) return [];

    const verseId = number(verse.id);

    const result = state.core.words
      .filter(
        word =>
          number(word.verse_id) === verseId
      )
      .sort(
        (a, b) =>
          number(a.position) -
          number(b.position)
      );

    return result;
  }


  function getArabicWord(word) {
    if (!word) return "";

    return (
      word.text_uthmani_tajweed ||
      word.text_uthmani ||
      word.text_indopak ||
      word.text ||
      ""
    );
  }


  /* =======================================================
     JUZ
     ======================================================= */

  function getJuz(juzNumber) {
    const n = number(juzNumber);

    return (
      state.core.juz.find(
        juz =>
          number(juz.juz_number ?? juz.id) === n
      ) || null
    );
  }


  function getVersesForJuz(juzNumber) {
    const juz = getJuz(juzNumber);

    if (!juz) return [];

    const mapping = juz.verse_mapping;

    if (mapping && typeof mapping === "object") {
      const result = [];

      for (const [key, value] of Object.entries(
        mapping
      )) {
        const verse = getVerse(key);

        if (verse) {
          result.push(verse);
        }
      }

      return result;
    }

    const first = number(juz.first_verse_id);
    const last = number(juz.last_verse_id);

    return state.core.verses.filter(
      verse =>
        number(verse.id) >= first &&
        number(verse.id) <= last
    );
  }


  /* =======================================================
     PAGE / MUSHAF
     ======================================================= */

  function getPageRecords(pageNumber) {
    const page = number(pageNumber);

    return state.mushaf.records.filter(record => {

      const recordPage =
        record.page_number ??
        record.page ??
        record.page_id;

      return number(recordPage) === page;
    });
  }


  function getVersesForPage(pageNumber) {
    const records = getPageRecords(pageNumber);

    const keys = unique(
      records
        .map(record =>
          record.verse_key ||
          record.verseKey
        )
        .filter(Boolean)
    );

    return keys
      .map(key => getVerse(key))
      .filter(Boolean);
  }


  /* =======================================================
     TRANSLATION
     ======================================================= */

  function findTranslationResource(
    language = "bn"
  ) {
    const normalized =
      String(language).toLowerCase();

    /*
     * Try metadata first.
     */

    for (const resource of state.translations) {

      const record = resource.records.find(
        r =>
          String(
            r.language_name ||
            r.language ||
            ""
          ).toLowerCase() === normalized
      );

      if (record) {
        return resource;
      }
    }

    /*
     * If language is Bangla, prefer first
     * available translation rather than breaking
     * the reader.
     */

    if (normalized === "bn") {
      return state.translations[0] || null;
    }

    return null;
  }


  function getTranslation(
    verseKey,
    language = state.settings.language
  ) {
    const resource =
      findTranslationResource(language);

    if (!resource) return "";

    const record =
      resource.records.find(
        r =>
          r.verse_key === verseKey ||
          r.verseKey === verseKey
      );

    if (!record) return "";

    return (
      record.text ||
      record.translation_text ||
      record.translation ||
      ""
    );
  }


  /* =======================================================
     WORD-BY-WORD TRANSLATION
     ======================================================= */

  function getWordTranslation(
    wordId,
    language = state.settings.language
  ) {
    const normalized =
      String(language).toLowerCase();

    for (const resource of state.wordTranslations) {

      const record =
        resource.records.find(
          r =>
            number(r.word_id) ===
            number(wordId)
        );

      if (!record) continue;

      const recordLanguage =
        String(
          record.language_name ||
          record.language ||
          ""
        ).toLowerCase();

      if (
        !recordLanguage ||
        recordLanguage === normalized
      ) {
        return (
          record.text ||
          record.translation ||
          record.word_translation ||
          ""
        );
      }
    }

    return "";
  }


  /* =======================================================
     TAFSIR
     ======================================================= */

  function getTafsir(
    verseKey,
    language = state.settings.language
  ) {
    for (const resource of state.tafsirs) {

      const record =
        resource.records.find(
          r =>
            r.verse_key === verseKey ||
            r.verseKey === verseKey ||
            (
              number(r.verse_id) ===
              number(
                getVerse(verseKey)?.id
              )
            )
        );

      if (!record) continue;

      const recordLanguage =
        String(
          record.language_name ||
          record.language ||
          ""
        ).toLowerCase();

      const requested =
        String(language).toLowerCase();

      if (
        !recordLanguage ||
        recordLanguage === requested
      ) {
        return (
          record.text ||
          record.tafsir_text ||
          record.tafsir ||
          ""
        );
      }
    }

    return "";
  }


  /* =======================================================
     BOOKMARKS
     ======================================================= */

  function isBookmarked(verseKey) {
    return state.bookmarks.some(
      item =>
        item.verseKey === verseKey
    );
  }


  function addBookmark(verseKey, note = "") {
    if (!verseKey) return false;

    if (isBookmarked(verseKey)) {
      return false;
    }

    const verse = getVerse(verseKey);

    state.bookmarks.push({
      verseKey,
      note,
      createdAt: new Date().toISOString(),

      surah:
        verse?.chapter_id ??
        null,

      ayah:
        verse?.verse_number ??
        null
    });

    saveBookmarks();

    emit(
      "sakin:quran:bookmarkchange",
      {
        verseKey,
        action: "add"
      }
    );

    return true;
  }


  function removeBookmark(verseKey) {
    state.bookmarks =
      state.bookmarks.filter(
        item =>
          item.verseKey !== verseKey
      );

    saveBookmarks();

    emit(
      "sakin:quran:bookmarkchange",
      {
        verseKey,
        action: "remove"
      }
    );
  }


  function toggleBookmark(verseKey) {
    if (isBookmarked(verseKey)) {
      removeBookmark(verseKey);
      return false;
    }

    addBookmark(verseKey);
    return true;
  }


  function getBookmarks() {
    return [...state.bookmarks];
  }


  /* =======================================================
     CONTINUE READING
     ======================================================= */

  function saveReadingPosition(position = {}) {

    const current = {
      surah:
        number(
          position.surah ??
          state.current.surah,
          1
        ),

      ayah:
        number(
          position.ayah ??
          state.current.ayah,
          1
        ),

      page:
        number(
          position.page ??
          state.current.page,
          1
        ),

      juz:
        number(
          position.juz ??
          state.current.juz,
          1
        ),

      verseKey:
        position.verseKey ||
        state.current.verseKey ||
        "1:1",

      updatedAt:
        new Date().toISOString()
    };

    state.current = {
      ...state.current,
      ...current
    };

    saveJSON(
      CONFIG.storage.position,
      current
    );

    saveJSON(
      CONFIG.storage.lastSurah,
      current.surah
    );

    saveJSON(
      CONFIG.storage.lastPage,
      current.page
    );

    saveJSON(
      CONFIG.storage.lastJuz,
      current.juz
    );

    emit(
      "sakin:quran:positionchange",
      current
    );
  }


  function getReadingPosition() {
    return loadJSON(
      CONFIG.storage.position,
      {
        surah: 1,
        ayah: 1,
        page: 1,
        juz: 1,
        verseKey: "1:1"
      }
    );
  }


  function continueReading() {
    const position =
      getReadingPosition();

    state.current = {
      ...state.current,
      ...position
    };

    renderCurrentSurah();

    return position;
  }


  /* =======================================================
     AUDIO
     ======================================================= */

  function createAudio() {
    if (state.audio.element) {
      return state.audio.element;
    }

    const audio =
      document.createElement("audio");

    audio.preload = "none";

    audio.setAttribute(
      "aria-label",
      "Sakin Quran audio"
    );

    audio.addEventListener(
      "play",
      () => {
        state.audio.playing = true;

        emit(
          "sakin:quran:audio",
          {
            action: "play",
            verseKey:
              state.audio.currentAyah
          }
        );
      }
    );

    audio.addEventListener(
      "pause",
      () => {
        state.audio.playing = false;

        emit(
          "sakin:quran:audio",
          {
            action: "pause",
            verseKey:
              state.audio.currentAyah
          }
        );
      }
    );

    audio.addEventListener(
      "ended",
      () => {
        state.audio.playing = false;

        emit(
          "sakin:quran:audio",
          {
            action: "ended",
            verseKey:
              state.audio.currentAyah
          }
        );
      }
    );

    state.audio.element = audio;

    return audio;
  }


  function playAudio(
    audioUrl,
    verseKey = null
  ) {
    if (!audioUrl) {
      console.warn(
        "No audio URL available."
      );

      return false;
    }

    const audio = createAudio();

    state.audio.currentUrl =
      audioUrl;

    state.audio.currentAyah =
      verseKey;

    audio.src = audioUrl;

    audio.play().catch(
      error =>
        console.warn(
          "Audio playback blocked:",
          error
        )
    );

    return true;
  }


  function pauseAudio() {
    if (!state.audio.element) {
      return;
    }

    state.audio.element.pause();
  }


  function resumeAudio() {
    if (!state.audio.element) {
      return;
    }

    state.audio.element.play().catch(
      error =>
        console.warn(
          "Audio resume failed:",
          error
        )
    );
  }


  function stopAudio() {
    if (!state.audio.element) {
      return;
    }

    state.audio.element.pause();

    state.audio.element.currentTime = 0;

    state.audio.currentAyah = null;
  }


  /* =======================================================
     AUDIO URL DISCOVERY
     ======================================================= */

  function findAudioUrl(verseKey) {

    /*
     * Search synced recitation resources.
     */

    const resources =
      Object.entries(
        state.resources
      );

    for (
      const [name, data]
      of resources
    ) {

      if (
        !name.startsWith(
          "recitations_"
        ) &&
        !name.startsWith(
          "chapter_recitations_"
        )
      ) {
        continue;
      }

      const records =
        normalizeRecords(data);

      for (const record of records) {

        if (
          record.verse_key ===
          verseKey ||
          record.verseKey ===
          verseKey
        ) {
          return (
            record.audio_url ||
            record.audioUrl ||
            record.url ||
            null
          );
        }
      }
    }

    return null;
  }


  /* =======================================================
     RENDER
     ======================================================= */

  function getReaderContainer() {
    return (
      qs(
        "#sakin-quran-reader"
      ) ||
      qs(
        "[data-sakin-quran-reader]"
      ) ||
      qs(
        ".sakin-quran-reader"
      )
    );
  }


  function renderVerse(verse) {

    const verseKey =
      verse.verse_key ||
      verse.verseKey ||
      "";

    const words =
      getWordsForVerse(verse);

    let arabic = "";

    if (words.length) {

      arabic =
        words
          .map(word => {

            const text =
              getArabicWord(word);

            const wordTranslation =
              state.settings.wordByWord
                ? getWordTranslation(
                    word.id,
                    state.settings.language
                  )
                : "";

            return `
              <span
                class="sakin-word"
                data-word-id="${escapeHTML(word.id)}"
                data-verse-key="${escapeHTML(verseKey)}"
                title="${escapeHTML(wordTranslation)}"
              >
                ${escapeHTML(text)}
              </span>
            `;
          })
          .join(" ");

    } else {

      arabic = escapeHTML(
        verse.text_uthmani ||
        verse.text_uthmani_tajweed ||
        verse.text_indopak ||
        verse.text ||
        ""
      );
    }

    const translation =
      state.settings.translation
        ? getTranslation(
            verseKey,
            state.settings.language
          )
        : "";

    const tafsir =
      state.settings.tafsir
        ? getTafsir(
            verseKey,
            state.settings.language
          )
        : "";

    const bookmarked =
      isBookmarked(verseKey);

    const audioUrl =
      findAudioUrl(verseKey);

    return `
      <article
        class="sakin-ayah"
        data-verse-key="${escapeHTML(verseKey)}"
      >

        <div class="sakin-ayah-header">

          <span class="sakin-ayah-number">
            ${escapeHTML(
              verse.verse_number ??
              verse.number ??
              ""
            )}
          </span>

          <div class="sakin-ayah-actions">

            <button
              type="button"
              class="sakin-audio-button"
              data-action="audio"
              data-verse-key="${escapeHTML(verseKey)}"
              data-audio-url="${escapeHTML(audioUrl || "")}"
              ${audioUrl ? "" : "disabled"}
            >
              ▶
            </button>

            <button
              type="button"
              class="sakin-bookmark-button ${bookmarked ? "active" : ""}"
              data-action="bookmark"
              data-verse-key="${escapeHTML(verseKey)}"
              aria-label="Bookmark"
            >
              ${bookmarked ? "★" : "☆"}
            </button>

          </div>

        </div>

        <div
          class="sakin-ayah-arabic"
          dir="rtl"
          lang="ar"
        >
          ${arabic}
        </div>

        ${
          translation
            ? `
              <div
                class="sakin-ayah-translation"
                dir="auto"
              >
                ${escapeHTML(
                  translation
                )}
              </div>
            `
            : ""
        }

        ${
          tafsir
            ? `
              <div
                class="sakin-ayah-tafsir"
                dir="auto"
              >
                <strong>তাফসির</strong>
                <div>
                  ${escapeHTML(
                    tafsir
                  )}
                </div>
              </div>
            `
            : ""
        }

      </article>
    `;
  }


  function renderCurrentSurah() {

    const container =
      getReaderContainer();

    if (!container) {
      return;
    }

    const surah =
      getSurah(
        state.current.surah
      );

    const verses =
      getVersesForSurah(
        state.current.surah
      );

    if (!verses.length) {

      container.innerHTML = `
        <div class="sakin-quran-empty">
          Quran data is not available yet.
        </div>
      `;

      return;
    }

    const title =
      surah?.name_simple ||
      surah?.name_arabic ||
      surah?.name ||
      `Surah ${state.current.surah}`;

    const arabicTitle =
      surah?.name_arabic ||
      "";

    container.innerHTML = `

      <section
        class="sakin-surah"
        data-surah="${state.current.surah}"
      >

        <header class="sakin-surah-header">

          <div class="sakin-surah-title">
            <h2>
              ${escapeHTML(title)}
            </h2>

            <div
              class="sakin-surah-arabic-title"
              dir="rtl"
            >
              ${escapeHTML(arabicTitle)}
            </div>
          </div>

          <div class="sakin-surah-meta">
            ${verses.length} Ayah
          </div>

        </header>

        <div class="sakin-ayah-list">
          ${verses.map(renderVerse).join("")}
        </div>

      </section>
    `;

    state.current.verseKey =
      verses[0].verse_key ||
      `${state.current.surah}:1`;

    attachVerseEvents();

    saveReadingPosition(
      state.current
    );

    emit(
      "sakin:quran:render",
      {
        surah:
          state.current.surah
      }
    );
  }


  /* =======================================================
     EVENTS
     ======================================================= */

  function attachVerseEvents() {

    const container =
      getReaderContainer();

    if (!container) {
      return;
    }

    qsa(
      "[data-action='bookmark']",
      container
    ).forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const key =
            button.dataset.verseKey;

          toggleBookmark(key);

          button.classList.toggle(
            "active",
            isBookmarked(key)
          );

          button.textContent =
            isBookmarked(key)
              ? "★"
              : "☆";
        }
      );
    });


    qsa(
      "[data-action='audio']",
      container
    ).forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const key =
            button.dataset.verseKey;

          const url =
            button.dataset.audioUrl;

          if (
            state.audio.currentAyah ===
            key &&
            state.audio.playing
          ) {
            pauseAudio();
            return;
          }

          if (url) {
            playAudio(
              url,
              key
            );
          }
        }
      );
    });


    qsa(
      ".sakin-ayah",
      container
    ).forEach(ayah => {

      ayah.addEventListener(
        "click",
        () => {

          const key =
            ayah.dataset.verseKey;

          const verse =
            getVerse(key);

          if (!verse) return;

          state.current.ayah =
            number(
              verse.verse_number ??
              verse.number,
              1
            );

          state.current.verseKey =
            key;

          saveReadingPosition(
            state.current
          );
        }
      );
    });
  }


  /* =======================================================
     NAVIGATION
     ======================================================= */

  function goToSurah(surahNumber) {

    const n =
      Math.max(
        1,
        Math.min(
          114,
          number(surahNumber, 1)
        )
      );

    state.current.surah = n;
    state.current.ayah = 1;

    const verses =
      getVersesForSurah(n);

    if (verses.length) {

      state.current.verseKey =
        verses[0].verse_key ||
        `${n}:1`;
    }

    renderCurrentSurah();

    return n;
  }


  function nextSurah() {

    return goToSurah(
      state.current.surah + 1
    );
  }


  function previousSurah() {

    return goToSurah(
      state.current.surah - 1
    );
  }


  function goToJuz(juzNumber) {

    const verses =
      getVersesForJuz(
        juzNumber
      );

    if (!verses.length) {
      return false;
    }

    const first =
      verses[0];

    const chapter =
      number(
        first.chapter_id,
        1
      );

    state.current.juz =
      number(juzNumber, 1);

    state.current.surah =
      chapter;

    state.current.ayah =
      number(
        first.verse_number,
        1
      );

    state.current.verseKey =
      first.verse_key ||
      `${chapter}:${state.current.ayah}`;

    renderCurrentSurah();

    return true;
  }


  function goToPage(pageNumber) {

    const verses =
      getVersesForPage(
        pageNumber
      );

    if (!verses.length) {
      return false;
    }

    const first =
      verses[0];

    state.current.page =
      number(pageNumber, 1);

    state.current.surah =
      number(
        first.chapter_id,
        1
      );

    state.current.ayah =
      number(
        first.verse_number,
        1
      );

    state.current.verseKey =
      first.verse_key ||
      `${state.current.surah}:${state.current.ayah}`;

    renderCurrentSurah();

    return true;
  }


  /* =======================================================
     MUSHAF MODE
     ======================================================= */

  function setMushafMode(mode) {

    const allowed = [
      "indopak15",
      "uthmani",
      "indopak",
      "noorani"
    ];

    if (!allowed.includes(mode)) {
      return false;
    }

    state.settings.mushaf =
      mode;

    saveSettings();

    /*
     * If quran-mushaf.js exists,
     * use its public API.
     */

    if (
      window.SakinQuranMushaf &&
      typeof
        window.SakinQuranMushaf
          .setMushaf === "function"
    ) {

      try {
        window.SakinQuranMushaf
          .setMushaf(mode);
      } catch (error) {
        console.warn(
          "Mushaf mode switch failed:",
          error
        );
      }
    }

    document.documentElement
      .setAttribute(
        "data-sakin-mushaf",
        mode
      );

    emit(
      "sakin:quran:mushafchange",
      {
        mushaf: mode
      }
    );

    renderCurrentSurah();

    return true;
  }


  /* =======================================================
     LANGUAGE
     ======================================================= */

  function setLanguage(language) {

    if (!language) {
      return false;
    }

    state.settings.language =
      String(language)
        .toLowerCase();

    saveSettings();

    emit(
      "sakin:quran:languagechange",
      {
        language:
          state.settings.language
      }
    );

    renderCurrentSurah();

    return true;
  }


  function setTranslationEnabled(enabled) {

    state.settings.translation =
      Boolean(enabled);

    saveSettings();

    renderCurrentSurah();
  }


  function setWordByWordEnabled(enabled) {

    state.settings.wordByWord =
      Boolean(enabled);

    saveSettings();

    renderCurrentSurah();
  }


  function setTafsirEnabled(enabled) {

    state.settings.tafsir =
      Boolean(enabled);

    saveSettings();

    renderCurrentSurah();
  }


  /* =======================================================
     EVENT EMITTER
     ======================================================= */

  function emit(name, detail = {}) {

    window.dispatchEvent(
      new CustomEvent(
        name,
        {
          detail
        }
      )
    );
  }


  /* =======================================================
     LOADING UI
     ======================================================= */

  function showLoading() {

    const container =
      getReaderContainer();

    if (!container) return;

    container.innerHTML = `
      <div class="sakin-quran-loading">
        <div>
          Quran loading...
        </div>
      </div>
    `;
  }


  function showError(error) {

    const container =
      getReaderContainer();

    if (!container) return;

    container.innerHTML = `
      <div class="sakin-quran-error">
        <strong>
          Quran data could not be loaded.
        </strong>

        <div>
          ${escapeHTML(
            error?.message ||
            "Unknown error"
          )}
        </div>
      </div>
    `;
  }


  /* =======================================================
     INITIALIZATION
     ======================================================= */

  async function init() {

    if (state.ready) {
      return state;
    }

    if (state.loading) {
      return;
    }

    state.loading = true;

    loadSettings();
    loadBookmarks();

    showLoading();

    try {

      await loadManifest();

      await loadCore();

      await loadMushaf();

      /*
       * Load optional resources.
       */

      await loadAllTranslations();

      await loadAllWordTranslations();

      await loadAllTafsirs();

      /*
       * Restore previous position.
       */

      const position =
        getReadingPosition();

      state.current = {
        ...state.current,
        ...position
      };

      /*
       * Apply Mushaf mode.
       */

      document.documentElement
        .setAttribute(
          "data-sakin-mushaf",
          state.settings.mushaf
        );

      state.ready = true;
      state.loading = false;

      renderCurrentSurah();

      emit(
        "sakin:quran:ready",
        {
          chapters:
            state.core.chapters.length,

          verses:
            state.core.verses.length,

          words:
            state.core.words.length,

          translations:
            state.translations.length,

          tafsirs:
            state.tafsirs.length
        }
      );

      return state;

    } catch (error) {

      state.loading = false;

      console.error(
        "Sakin Quran Engine error:",
        error
      );

      showError(error);

      emit(
        "sakin:quran:error",
        {
          error
        }
      );

      return null;
    }
  }


  /* =======================================================
     PUBLIC API
     ======================================================= */

  window.SakinQuranEngine = {

    config: CONFIG,

    state,

    init,

    getSurahs,
    getSurah,
    getVersesForSurah,
    getVerse,

    getWordsForVerse,

    getJuz,
    getVersesForJuz,

    getPageRecords,
    getVersesForPage,

    getTranslation,
    getWordTranslation,
    getTafsir,

    getBookmarks,
    addBookmark,
    removeBookmark,
    toggleBookmark,
    isBookmarked,

    saveReadingPosition,
    getReadingPosition,
    continueReading,

    playAudio,
    pauseAudio,
    resumeAudio,
    stopAudio,
    findAudioUrl,

    goToSurah,
    nextSurah,
    previousSurah,
    goToJuz,
    goToPage,

    setMushafMode,
    setLanguage,

    setTranslationEnabled,
    setWordByWordEnabled,
    setTafsirEnabled
  };


  /* =======================================================
     AUTO START
     ======================================================= */

  function start() {

    if (
      document.readyState ===
      "loading"
    ) {

      document.addEventListener(
        "DOMContentLoaded",
        init,
        {
          once: true
        }
      );

    } else {

      init();

    }
  }


  start();

})();
