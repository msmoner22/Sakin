/* =========================================================
   SAKIN QURAN DATA LOADER
   Loads Quran data from the generated quran-data folder
   and provides one simple interface for the Quran reader.
   ========================================================= */

(function () {
    "use strict";

    const DATA_ROOT = "./quran-data/";

    const state = {
        manifest: null,
        files: {},
        loaded: false
    };

    async function fetchJSON(file) {
        const response = await fetch(DATA_ROOT + file, {
            cache: "default"
        });

        if (!response.ok) {
            throw new Error(
                "Quran data file not found: " + file
            );
        }

        return await response.json();
    }

    async function loadManifest() {
        if (state.manifest) {
            return state.manifest;
        }

        state.manifest = await fetchJSON("manifest.json");
        return state.manifest;
    }

    function getResourceFiles(prefix) {
        if (!state.manifest) {
            return [];
        }

        const resources = Array.isArray(state.manifest.resources)
            ? state.manifest.resources
            : [];

        return resources.filter(function (name) {
            return name.startsWith(prefix);
        });
    }

    async function loadResourceGroup(prefix) {
        const files = getResourceFiles(prefix);

        const results = [];

        for (const file of files) {
            try {
                const data = await fetchJSON(file + ".json");

                state.files[file] = data;

                results.push({
                    file: file,
                    data: data
                });
            } catch (error) {
                console.warn(
                    "Could not load Quran resource:",
                    file,
                    error
                );
            }
        }

        return results;
    }

    async function loadCore() {
        const manifest = await loadManifest();

        const resources = Array.isArray(manifest.resources)
            ? manifest.resources
            : [];

        const coreResources = resources.filter(function (name) {
            return (
                name === "quran_core_1" ||
                name === "mushafs_1"
            );
        });

        for (const resource of coreResources) {
            try {
                state.files[resource] =
                    await fetchJSON(resource + ".json");
            } catch (error) {
                console.warn(
                    "Could not load core resource:",
                    resource,
                    error
                );
            }
        }

        state.loaded = true;

        return {
            manifest: state.manifest,
            core: state.files
        };
    }

    async function loadAll() {
        await loadCore();

        await loadResourceGroup("translations_");
        await loadResourceGroup("word_by_word_translations_");
        await loadResourceGroup("tafsirs_");
        await loadResourceGroup("recitations_");
        await loadResourceGroup("chapter_recitations_");

        return state;
    }

    function get(file) {
        return state.files[file] || null;
    }

    function getManifest() {
        return state.manifest;
    }

    function isLoaded() {
        return state.loaded;
    }

    /*
     * Offline support
     *
     * Every successfully loaded JSON file is also saved
     * through SakinQuranOffline when that module exists.
     */

    async function saveOffline(file, data) {
        if (
            window.SakinQuranOffline &&
            typeof window.SakinQuranOffline.saveData === "function"
        ) {
            try {
                await window.SakinQuranOffline.saveData(
                    "quran-data/" + file + ".json",
                    data
                );
            } catch (error) {
                console.warn(
                    "Offline save failed:",
                    file,
                    error
                );
            }
        }
    }

    async function loadWithOffline(file) {
        try {
            const data = await fetchJSON(file + ".json");

            state.files[file] = data;

            await saveOffline(file, data);

            return data;

        } catch (networkError) {

            if (
                window.SakinQuranOffline &&
                typeof window.SakinQuranOffline.getData === "function"
            ) {
                try {
                    const offlineData =
                        await window.SakinQuranOffline.getData(
                            "quran-data/" + file + ".json"
                        );

                    if (offlineData) {
                        state.files[file] = offlineData;
                        return offlineData;
                    }
                } catch (offlineError) {
                    console.warn(
                        "Offline Quran data unavailable:",
                        file,
                        offlineError
                    );
                }
            }

            throw networkError;
        }
    }

    async function downloadForOffline() {
        const manifest = await loadManifest();

        const resources = Array.isArray(manifest.resources)
            ? manifest.resources
            : [];

        let downloaded = 0;

        for (const resource of resources) {
            try {
                await loadWithOffline(resource);
                downloaded++;
            } catch (error) {
                console.warn(
                    "Could not download:",
                    resource
                );
            }
        }

        return {
            total: resources.length,
            downloaded: downloaded
        };
    }

    window.SakinQuranDataLoader = {

        loadManifest,
        loadCore,
        loadAll,
        loadWithOffline,
        downloadForOffline,

        get,
        getManifest,
        getResourceFiles,

        isLoaded,

        state
    };

})();
