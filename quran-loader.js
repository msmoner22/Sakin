/* =========================================================
   SAKIN QURAN LOADER
   Connects Quran Engine + Mushaf + Offline + API
   ========================================================= */

(function () {
  "use strict";

  const FILES = [
    "./quran-mushaf.js",
    "./quran-offline.js",
    "./sakin-quran-api.js",
    "./quran-engine.js"
  ];

  function loadScript(src) {
    return new Promise((resolve, reject) => {

      /*
       * Don't load the same script twice.
       */
      const existing =
        document.querySelector(
          `script[src="${src}"]`
        );

      if (existing) {
        resolve();
        return;
      }

      const script =
        document.createElement("script");

      script.src = src;
      script.async = false;

      script.onload = () => {
        resolve();
      };

      script.onerror = () => {
        reject(
          new Error(
            "Sakin Quran file could not load: " +
            src
          )
        );
      };

      document.head.appendChild(script);
    });
  }


  async function loadAll() {

    for (const file of FILES) {

      try {

        await loadScript(file);

      } catch (error) {

        console.error(
          "Sakin Quran Loader:",
          error
        );

      }
    }

    /*
     * Start Quran Engine after all modules
     * have been loaded.
     */

    if (
      window.SakinQuranEngine &&
      typeof
        window.SakinQuranEngine.init ===
        "function"
    ) {

      try {

        await window.SakinQuranEngine.init();

      } catch (error) {

        console.error(
          "Sakin Quran Engine initialization failed:",
          error
        );

      }
    }

    /*
     * Tell the page that all Sakin Quran
     * modules are ready.
     */

    window.dispatchEvent(
      new CustomEvent(
        "sakin:quran:modules-ready"
      )
    );
  }


  /*
   * Wait until DOM is available.
   */

  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      loadAll,
      {
        once: true
      }
    );

  } else {

    loadAll();

  }

})();
