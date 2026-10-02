/* =========================================================
   SAKIN QURAN — OFFLINE ENGINE
   File: quran-offline.js
   ========================================================= */

(function (window) {
  "use strict";

  const DB_NAME = "SakinQuranOffline";
  const DB_VERSION = 1;

  const STORES = {
    data: "quranData",
    audio: "quranAudio",
    settings: "settings"
  };

  let database = null;

  /* ---------------------------------------------------------
     Open IndexedDB
     --------------------------------------------------------- */

  function openDatabase() {
    return new Promise(function (resolve, reject) {

      if (!("indexedDB" in window)) {
        reject(new Error("IndexedDB is not supported."));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = function (event) {
        const db = event.target.result;

        if (!db.objectStoreNames.contains(STORES.data)) {
          db.createObjectStore(STORES.data, {
            keyPath: "key"
          });
        }

        if (!db.objectStoreNames.contains(STORES.audio)) {
          db.createObjectStore(STORES.audio, {
            keyPath: "key"
          });
        }

        if (!db.objectStoreNames.contains(STORES.settings)) {
          db.createObjectStore(STORES.settings, {
            keyPath: "key"
          });
        }
      };

      request.onsuccess = function (event) {
        database = event.target.result;
        resolve(database);
      };

      request.onerror = function () {
        reject(request.error);
      };
    });
  }

  /* ---------------------------------------------------------
     Database
     --------------------------------------------------------- */

  async function getDB() {
    if (database) {
      return database;
    }

    return openDatabase();
  }

  /* ---------------------------------------------------------
     Save data
     --------------------------------------------------------- */

  async function saveData(key, value) {
    const db = await getDB();

    return new Promise(function (resolve, reject) {

      const transaction = db.transaction(
        [STORES.data],
        "readwrite"
      );

      const store = transaction.objectStore(
        STORES.data
      );

      store.put({
        key: key,
        value: value,
        savedAt: Date.now()
      });

      transaction.oncomplete = function () {
        resolve(true);
      };

      transaction.onerror = function () {
        reject(transaction.error);
      };
    });
  }

  /* ---------------------------------------------------------
     Get data
     --------------------------------------------------------- */

  async function getData(key) {
    const db = await getDB();

    return new Promise(function (resolve, reject) {

      const transaction = db.transaction(
        [STORES.data],
        "readonly"
      );

      const store = transaction.objectStore(
        STORES.data
      );

      const request = store.get(key);

      request.onsuccess = function () {

        if (!request.result) {
          resolve(null);
          return;
        }

        resolve(request.result.value);
      };

      request.onerror = function () {
        reject(request.error);
      };
    });
  }

  /* ---------------------------------------------------------
     Delete data
     --------------------------------------------------------- */

  async function deleteData(key) {
    const db = await getDB();

    return new Promise(function (resolve, reject) {

      const transaction = db.transaction(
        [STORES.data],
        "readwrite"
      );

      const store = transaction.objectStore(
        STORES.data
      );

      store.delete(key);

      transaction.oncomplete = function () {
        resolve(true);
      };

      transaction.onerror = function () {
        reject(transaction.error);
      };
    });
  }

  /* ---------------------------------------------------------
     Save audio
     --------------------------------------------------------- */

  async function saveAudio(key, blob) {
    const db = await getDB();

    return new Promise(function (resolve, reject) {

      const transaction = db.transaction(
        [STORES.audio],
        "readwrite"
      );

      const store = transaction.objectStore(
        STORES.audio
      );

      store.put({
        key: key,
        blob: blob,
        savedAt: Date.now()
      });

      transaction.oncomplete = function () {
        resolve(true);
      };

      transaction.onerror = function () {
        reject(transaction.error);
      };
    });
  }

  /* ---------------------------------------------------------
     Get audio
     --------------------------------------------------------- */

  async function getAudio(key) {
    const db = await getDB();

    return new Promise(function (resolve, reject) {

      const transaction = db.transaction(
        [STORES.audio],
        "readonly"
      );

      const store = transaction.objectStore(
        STORES.audio
      );

      const request = store.get(key);

      request.onsuccess = function () {

        if (!request.result) {
          resolve(null);
          return;
        }

        resolve(request.result.blob);
      };

      request.onerror = function () {
        reject(request.error);
      };
    });
  }

  /* ---------------------------------------------------------
     Delete audio
     --------------------------------------------------------- */

  async function deleteAudio(key) {
    const db = await getDB();

    return new Promise(function (resolve, reject) {

      const transaction = db.transaction(
        [STORES.audio],
        "readwrite"
      );

      const store = transaction.objectStore(
        STORES.audio
      );

      store.delete(key);

      transaction.oncomplete = function () {
        resolve(true);
      };

      transaction.onerror = function () {
        reject(transaction.error);
      };
    });
  }

  /* ---------------------------------------------------------
     Save setting
     --------------------------------------------------------- */

  async function saveSetting(key, value) {
    const db = await getDB();

    return new Promise(function (resolve, reject) {

      const transaction = db.transaction(
        [STORES.settings],
        "readwrite"
      );

      const store = transaction.objectStore(
        STORES.settings
      );

      store.put({
        key: key,
        value: value
      });

      transaction.oncomplete = function () {
        resolve(true);
      };

      transaction.onerror = function () {
        reject(transaction.error);
      };
    });
  }

  /* ---------------------------------------------------------
     Get setting
     --------------------------------------------------------- */

  async function getSetting(key) {
    const db = await getDB();

    return new Promise(function (resolve, reject) {

      const transaction = db.transaction(
        [STORES.settings],
        "readonly"
      );

      const store = transaction.objectStore(
        STORES.settings
      );

      const request = store.get(key);

      request.onsuccess = function () {

        if (!request.result) {
          resolve(null);
          return;
        }

        resolve(request.result.value);
      };

      request.onerror = function () {
        reject(request.error);
      };
    });
  }

  /* ---------------------------------------------------------
     Download and cache file
     --------------------------------------------------------- */

  async function cacheUrl(key, url, type) {

    if (!url) {
      throw new Error("URL is required.");
    }

    const existing = type === "audio"
      ? await getAudio(key)
      : await getData(key);

    if (existing) {
      return existing;
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        "Download failed: " + response.status
      );
    }

    if (type === "audio") {

      const blob = await response.blob();

      await saveAudio(key, blob);

      return blob;
    }

    const data = await response.json();

    await saveData(key, data);

    return data;
  }

  /* ---------------------------------------------------------
     Offline status
     --------------------------------------------------------- */

  function isOnline() {
    return navigator.onLine !== false;
  }

  function isOffline() {
    return navigator.onLine === false;
  }

  /* ---------------------------------------------------------
     Dispatch network status
     --------------------------------------------------------- */

  function dispatchStatus() {

    try {

      window.dispatchEvent(
        new CustomEvent(
          "sakin:quran:networkchange",
          {
            detail: {
              online: isOnline(),
              offline: isOffline()
            }
          }
        )
      );

    } catch (error) {
      console.warn(
        "Sakin Quran: network event failed.",
        error
      );
    }
  }

  window.addEventListener(
    "online",
    dispatchStatus
  );

  window.addEventListener(
    "offline",
    dispatchStatus
  );

  /* ---------------------------------------------------------
     Service Worker
     --------------------------------------------------------- */

  async function registerServiceWorker() {

    if (!("serviceWorker" in navigator)) {
      return null;
    }

    try {

      const registration =
        await navigator.serviceWorker.register(
          "sakin-quran-sw.js",
          {
            scope: "./"
          }
        );

      return registration;

    } catch (error) {

      console.warn(
        "Sakin Quran: Service Worker registration failed.",
        error
      );

      return null;
    }
  }

  /* ---------------------------------------------------------
     Cache current reading position
     --------------------------------------------------------- */

  function saveReadingPosition(position) {

    if (!position) {
      return;
    }

    try {

      localStorage.setItem(
        "sakin_quran_continue_reading",
        JSON.stringify({
          surah: position.surah || null,
          ayah: position.ayah || null,
          juz: position.juz || null,
          page: position.page || null,
          mushaf: position.mushaf || null,
          updatedAt: Date.now()
        })
      );

    } catch (error) {

      console.warn(
        "Sakin Quran: Could not save reading position.",
        error
      );
    }
  }

  /* ---------------------------------------------------------
     Get reading position
     --------------------------------------------------------- */

  function getReadingPosition() {

    try {

      const saved =
        localStorage.getItem(
          "sakin_quran_continue_reading"
        );

      if (!saved) {
        return null;
      }

      return JSON.parse(saved);

    } catch (error) {

      console.warn(
        "Sakin Quran: Could not read reading position.",
        error
      );

      return null;
    }
  }

  /* ---------------------------------------------------------
     Bookmark
     --------------------------------------------------------- */

  function saveBookmark(bookmark) {

    if (!bookmark) {
      return false;
    }

    try {

      const existing =
        JSON.parse(
          localStorage.getItem(
            "sakin_quran_bookmarks"
          ) || "[]"
        );

      const id =
        String(bookmark.surah || "") +
        ":" +
        String(bookmark.ayah || "");

      const filtered =
        existing.filter(function (item) {
          return item.id !== id;
        });

      filtered.push({
        id: id,
        surah: bookmark.surah || null,
        ayah: bookmark.ayah || null,
        page: bookmark.page || null,
        juz: bookmark.juz || null,
        mushaf: bookmark.mushaf || null,
        createdAt: Date.now()
      });

      localStorage.setItem(
        "sakin_quran_bookmarks",
        JSON.stringify(filtered)
      );

      return true;

    } catch (error) {

      console.warn(
        "Sakin Quran: Bookmark failed.",
        error
      );

      return false;
    }
  }

  /* ---------------------------------------------------------
     Get bookmarks
     --------------------------------------------------------- */

  function getBookmarks() {

    try {

      return JSON.parse(
        localStorage.getItem(
          "sakin_quran_bookmarks"
        ) || "[]"
      );

    } catch (error) {

      return [];
    }
  }

  /* ---------------------------------------------------------
     Remove bookmark
     --------------------------------------------------------- */

  function removeBookmark(surah, ayah) {

    try {

      const id =
        String(surah || "") +
        ":" +
        String(ayah || "");

      const bookmarks =
        getBookmarks().filter(
          function (item) {
            return item.id !== id;
          }
        );

      localStorage.setItem(
        "sakin_quran_bookmarks",
        JSON.stringify(bookmarks)
      );

      return true;

    } catch (error) {

      return false;
    }
  }

  /* ---------------------------------------------------------
     Public API
     --------------------------------------------------------- */

  window.SakinQuranOffline = {

    version: "1.0.0",

    openDatabase: openDatabase,

    saveData: saveData,

    getData: getData,

    deleteData: deleteData,

    saveAudio: saveAudio,

    getAudio: getAudio,

    deleteAudio: deleteAudio,

    saveSetting: saveSetting,

    getSetting: getSetting,

    cacheUrl: cacheUrl,

    isOnline: isOnline,

    isOffline: isOffline,

    registerServiceWorker: registerServiceWorker,

    saveReadingPosition: saveReadingPosition,

    getReadingPosition: getReadingPosition,

    saveBookmark: saveBookmark,

    getBookmarks: getBookmarks,

    removeBookmark: removeBookmark
  };

  /* ---------------------------------------------------------
     Initialize database
     --------------------------------------------------------- */

  if (document.readyState === "loading") {

    document.addEventListener(
      "DOMContentLoaded",
      function () {
        openDatabase().catch(function (error) {
          console.warn(
            "Sakin Quran: Offline database unavailable.",
            error
          );
        });
      }
    );

  } else {

    openDatabase().catch(function (error) {
      console.warn(
        "Sakin Quran: Offline database unavailable.",
        error
      );
    });

  }

})(window);
