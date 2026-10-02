/* =========================================================
   SAKIN QURAN MODULE LOADER
   ========================================================= */

(function () {
    "use strict";

    const FILES = [
        "./quran-mushaf.js",
        "./quran-offline.js",
        "./sakin-quran-api.js",
        "./quran-data-loader.js",
        "./quran-engine.js"
    ];

    function loadScript(src) {
        return new Promise(function (resolve, reject) {

            const script = document.createElement("script");

            script.src = src;
            script.async = false;

            script.onload = function () {
                resolve();
            };

            script.onerror = function () {
                reject(
                    new Error(
                        "SAKIN Quran module could not load: " + src
                    )
                );
            };

            document.head.appendChild(script);
        });
    }

    async function start() {

        try {

            for (const file of FILES) {
                await loadScript(file);
            }

            /*
             * First load the Quran data system.
             */
            if (
                window.SakinQuranDataLoader &&
                typeof window.SakinQuranDataLoader.loadAll === "function"
            ) {
                await window.SakinQuranDataLoader.loadAll();
            }

            /*
             * Then start the Quran Engine.
             */
            if (
                window.SakinQuranEngine &&
                typeof window.SakinQuranEngine.init === "function"
            ) {
                await window.SakinQuranEngine.init();
            }

            window.dispatchEvent(
                new CustomEvent("sakin:quran:modules-ready")
            );

            console.log(
                "SAKIN Quran system loaded successfully."
            );

        } catch (error) {

            console.error(
                "SAKIN Quran system failed:",
                error
            );

            window.dispatchEvent(
                new CustomEvent(
                    "sakin:quran:modules-error",
                    {
                        detail: error
                    }
                )
            );
        }
    }

    if (document.readyState === "loading") {

        document.addEventListener(
            "DOMContentLoaded",
            start,
            { once: true }
        );

    } else {

        start();

    }

})();
