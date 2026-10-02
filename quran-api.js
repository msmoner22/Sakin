/* =========================================================
   SAKIN QURAN API CONFIGURATION
   Safe frontend configuration only

   IMPORTANT:
   NEVER put QF_CLIENT_SECRET in this file.
   The secret must remain on a backend/server.
   ========================================================= */

(function () {
  "use strict";

  const CONFIG = {
    name: "Sakin Quran",

    /*
     * Frontend talks to Sakin's own API/proxy.
     *
     * This is intentionally NOT the Quran Foundation
     * secret or OAuth token.
     *
     * Later, the backend/proxy will securely connect to:
     * Quran Foundation Content API.
     */
    apiBase: "/api/quran",

    /*
     * API version used by the Quran Foundation Content API.
     */
    apiVersion: "v4",

    /*
     * Default Quran settings.
     */
    defaults: {
      language: "bn",
      translationLanguage: "bn",
      tafsirLanguage: "bn",
      mushaf: "indopak15",

      wordByWord: true,
      translation: true,
      tafsir: false,

      audio: true,
      autoPlay: false,

      offlineFirst: true
    }
  };

  /* -------------------------------------------------------
     Safe request helper
     ------------------------------------------------------- */

  async function request(path, options = {}) {
    const cleanPath = String(path || "").replace(/^\/+/, "");

    const url =
      CONFIG.apiBase.replace(/\/+$/, "") +
      "/" +
      cleanPath;

    const response = await fetch(url, {
      method: options.method || "GET",
      headers: {
        "Accept": "application/json",
        ...(options.headers || {})
      },
      body: options.body
    });

    if (!response.ok) {
      let message = "";

      try {
        const errorData = await response.json();
        message =
          errorData.message ||
          errorData.error ||
          "";
      } catch (_) {
        /* Ignore invalid JSON error body. */
      }

      throw new Error(
        "Sakin Quran API error " +
        response.status +
        (message ? ": " + message : "")
      );
    }

    return response.json();
  }

  /* -------------------------------------------------------
     API methods
     ------------------------------------------------------- */

  async function getChapters() {
    return request("chapters");
  }

  async function getChapter(chapterId, params = {}) {
    const query = new URLSearchParams(params);

    return request(
      "chapters/" +
      encodeURIComponent(chapterId) +
      (query.toString() ? "?" + query.toString() : "")
    );
  }

  async function getVerses(chapterId, params = {}) {
    const query = new URLSearchParams(params);

    return request(
      "verses/" +
      encodeURIComponent(chapterId) +
      (query.toString() ? "?" + query.toString() : "")
    );
  }

  async function getJuz(juzNumber, params = {}) {
    const query = new URLSearchParams(params);

    return request(
      "juz/" +
      encodeURIComponent(juzNumber) +
      (query.toString() ? "?" + query.toString() : "")
    );
  }

  async function getPages(pageNumber, params = {}) {
    const query = new URLSearchParams(params);

    return request(
      "pages/" +
      encodeURIComponent(pageNumber) +
      (query.toString() ? "?" + query.toString() : "")
    );
  }

  async function getLanguages() {
    return request("languages");
  }

  async function getTranslations(params = {}) {
    const query = new URLSearchParams(params);

    return request(
      "translations" +
      (query.toString() ? "?" + query.toString() : "")
    );
  }

  async function getTafsirs(params = {}) {
    const query = new URLSearchParams(params);

    return request(
      "tafsirs" +
      (query.toString() ? "?" + query.toString() : "")
    );
  }

  async function getRecitations(params = {}) {
    const query = new URLSearchParams(params);

    return request(
      "recitations" +
      (query.toString() ? "?" + query.toString() : "")
    );
  }

  /* -------------------------------------------------------
     Health check
     ------------------------------------------------------- */

  async function healthCheck() {
    return request("health");
  }

  /* -------------------------------------------------------
     Public Sakin Quran API
     ------------------------------------------------------- */

  window.SakinQuranAPI = {
    config: CONFIG,

    request,

    getChapters,
    getChapter,
    getVerses,

    getJuz,
    getPages,

    getLanguages,
    getTranslations,
    getTafsirs,
    getRecitations,

    healthCheck
  };

  /* -------------------------------------------------------
     Ready event
     ------------------------------------------------------- */

  window.dispatchEvent(
    new CustomEvent("sakin:quran:api-ready")
  );

})();
