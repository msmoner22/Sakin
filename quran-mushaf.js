/* =========================================================
   SAKIN QURAN — MUSHAF ENGINE
   File: quran-mushaf.js

   Supported Mushafs:
   1. IndoPak 15-line / Hafizi  = ID 6
   2. Uthmani Hafs              = ID 4
   3. IndoPak                    = ID 3

   This file:
   - Stores Mushaf choices
   - Switches Mushaf preference
   - Remembers user's selection
   - Provides page/line configuration
   - Provides events for the Quran Reader
   ========================================================= */

(function (window) {
  "use strict";

  const STORAGE_KEY = "sakin_quran_mushaf";

  const MUSHAFS = {
    indopak15: {
      id: 6,
      key: "indopak15",
      name: "১৫-লাইন হাফেজি / IndoPak",
      nameEn: "IndoPak 15-Line / Hafizi",
      shortName: "১৫-লাইন",
      linesPerPage: 15,
      totalPages: 610,
      script: "indopak",
      type: "mushaf"
    },

    uthmani: {
      id: 4,
      key: "uthmani",
      name: "উসমানী আরবি",
      nameEn: "Uthmani Hafs",
      shortName: "উসমানী",
      linesPerPage: 15,
      totalPages: 604,
      script: "uthmani",
      type: "mushaf"
    },

    indopak: {
      id: 3,
      key: "indopak",
      name: "ইন্দোপাক আরবি",
      nameEn: "IndoPak",
      shortName: "ইন্দোপাক",
      linesPerPage: 15,
      totalPages: 604,
      script: "indopak",
      type: "mushaf"
    }
  };

  /* ---------------------------------------------------------
     Default
     --------------------------------------------------------- */

  const DEFAULT_MUSHAF = "indopak15";

  /* ---------------------------------------------------------
     Read saved Mushaf
     --------------------------------------------------------- */

  function getSavedMushafKey() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved && MUSHAFS[saved]) {
        return saved;
      }
    } catch (error) {
      console.warn("Sakin Quran: localStorage unavailable.", error);
    }

    return DEFAULT_MUSHAF;
  }

  /* ---------------------------------------------------------
     Get current Mushaf
     --------------------------------------------------------- */

  function getCurrentMushaf() {
    const key = getSavedMushafKey();
    return MUSHAFS[key];
  }

  /* ---------------------------------------------------------
     Get Mushaf by key
     --------------------------------------------------------- */

  function getMushaf(key) {
    if (!MUSHAFS[key]) {
      return MUSHAFS[DEFAULT_MUSHAF];
    }

    return MUSHAFS[key];
  }

  /* ---------------------------------------------------------
     Get all Mushafs
     --------------------------------------------------------- */

  function getAllMushafs() {
    return Object.values(MUSHAFS);
  }

  /* ---------------------------------------------------------
     Save Mushaf
     --------------------------------------------------------- */

  function setMushaf(key, options) {
    if (!MUSHAFS[key]) {
      console.warn("Sakin Quran: Unknown Mushaf:", key);
      return false;
    }

    const previous = getCurrentMushaf();

    try {
      localStorage.setItem(STORAGE_KEY, key);
    } catch (error) {
      console.warn("Sakin Quran: Could not save Mushaf.", error);
    }

    const current = MUSHAFS[key];

    /*
      Tell the rest of Sakin that the Mushaf changed.
      quran-reader.js / quran-engine.js can listen to this.
    */

    try {
      window.dispatchEvent(
        new CustomEvent("sakin:quran:mushafchange", {
          detail: {
            previous: previous,
            current: current,
            options: options || {}
          }
        })
      );
    } catch (error) {
      console.warn("Sakin Quran: Mushaf event failed.", error);
    }

    return true;
  }

  /* ---------------------------------------------------------
     Mushaf selector UI
     --------------------------------------------------------- */

  function createMushafSelector(container) {
    if (!container) {
      return null;
    }

    container.innerHTML = "";

    const wrapper = document.createElement("div");
    wrapper.className = "sakin-mushaf-selector";

    const label = document.createElement("label");
    label.className = "sakin-mushaf-label";
    label.textContent = "কুরআনের ফন্ট / মুসহাফ";

    const select = document.createElement("select");
    select.className = "sakin-mushaf-select";
    select.setAttribute("aria-label", "কুরআনের ফন্ট নির্বাচন করুন");

    const current = getCurrentMushaf();

    getAllMushafs().forEach(function (mushaf) {
      const option = document.createElement("option");

      option.value = mushaf.key;
      option.textContent =
        mushaf.name + " — " + mushaf.nameEn;

      if (mushaf.key === current.key) {
        option.selected = true;
      }

      select.appendChild(option);
    });

    select.addEventListener("change", function () {
      const selectedKey = select.value;

      setMushaf(selectedKey);

      /*
        Ask the Quran reader to reload the current location
        using the newly selected Mushaf.
      */

      try {
        window.dispatchEvent(
          new CustomEvent("sakin:quran:reload", {
            detail: {
              mushaf: getCurrentMushaf()
            }
          })
        );
      } catch (error) {
        console.warn("Sakin Quran: Reload event failed.", error);
      }
    });

    wrapper.appendChild(label);
    wrapper.appendChild(select);

    container.appendChild(wrapper);

    return select;
  }

  /* ---------------------------------------------------------
     Create simple Mushaf buttons
     --------------------------------------------------------- */

  function createMushafButtons(container) {
    if (!container) {
      return null;
    }

    container.innerHTML = "";

    const wrapper = document.createElement("div");
    wrapper.className = "sakin-mushaf-buttons";

    const current = getCurrentMushaf();

    getAllMushafs().forEach(function (mushaf) {
      const button = document.createElement("button");

      button.type = "button";
      button.className = "sakin-mushaf-button";

      button.dataset.mushaf = mushaf.key;

      button.textContent = mushaf.name;

      if (mushaf.key === current.key) {
        button.classList.add("active");
        button.setAttribute("aria-pressed", "true");
      } else {
        button.setAttribute("aria-pressed", "false");
      }

      button.addEventListener("click", function () {
        setMushaf(mushaf.key);

        Array.from(
          wrapper.querySelectorAll(".sakin-mushaf-button")
        ).forEach(function (item) {
          item.classList.remove("active");
          item.setAttribute("aria-pressed", "false");
        });

        button.classList.add("active");
        button.setAttribute("aria-pressed", "true");

        try {
          window.dispatchEvent(
            new CustomEvent("sakin:quran:reload", {
              detail: {
                mushaf: getCurrentMushaf()
              }
            })
          );
        } catch (error) {
          console.warn("Sakin Quran: Reload event failed.", error);
        }
      });

      wrapper.appendChild(button);
    });

    container.appendChild(wrapper);

    return wrapper;
  }

  /* ---------------------------------------------------------
     Mushaf page information
     --------------------------------------------------------- */

  function getPageInfo(pageNumber) {
    const mushaf = getCurrentMushaf();

    let page = Number(pageNumber);

    if (!Number.isFinite(page)) {
      page = 1;
    }

    page = Math.max(1, Math.min(page, mushaf.totalPages));

    return {
      mushafId: mushaf.id,
      mushafKey: mushaf.key,
      page: page,
      totalPages: mushaf.totalPages,
      linesPerPage: mushaf.linesPerPage
    };
  }

  /* ---------------------------------------------------------
     Get API parameters
     --------------------------------------------------------- */

  function getApiParameters() {
    const mushaf = getCurrentMushaf();

    return {
      mushaf: mushaf.id,
      mushafId: mushaf.id,
      linesPerPage: mushaf.linesPerPage,
      totalPages: mushaf.totalPages
    };
  }

  /* ---------------------------------------------------------
     Change font class
     --------------------------------------------------------- */

  function applyMushafClass(element) {
    if (!element) {
      return;
    }

    const mushaf = getCurrentMushaf();

    element.classList.remove(
      "sakin-mushaf-indopak15",
      "sakin-mushaf-uthmani",
      "sakin-mushaf-indopak"
    );

    element.classList.add(
      "sakin-mushaf-" + mushaf.key
    );

    element.dataset.mushafId = String(mushaf.id);
    element.dataset.mushafKey = mushaf.key;
  }

  /* ---------------------------------------------------------
     Initialize
     --------------------------------------------------------- */

  function init(options) {
    options = options || {};

    const root =
      options.root ||
      document.querySelector("[data-sakin-quran-root]") ||
      document.body;

    applyMushafClass(root);

    if (options.selector) {
      createMushafSelector(
        typeof options.selector === "string"
          ? document.querySelector(options.selector)
          : options.selector
      );
    }

    if (options.buttons) {
      createMushafButtons(
        typeof options.buttons === "string"
          ? document.querySelector(options.buttons)
          : options.buttons
      );
    }

    return getCurrentMushaf();
  }

  /* ---------------------------------------------------------
     Public Sakin Quran API
     --------------------------------------------------------- */

  window.SakinQuranMushaf = {
    version: "1.0.0",

    MUSHAFS: MUSHAFS,

    getSavedMushafKey: getSavedMushafKey,

    getCurrentMushaf: getCurrentMushaf,

    getMushaf: getMushaf,

    getAllMushafs: getAllMushafs,

    setMushaf: setMushaf,

    createMushafSelector: createMushafSelector,

    createMushafButtons: createMushafButtons,

    getPageInfo: getPageInfo,

    getApiParameters: getApiParameters,

    applyMushafClass: applyMushafClass,

    init: init
  };

  /* ---------------------------------------------------------
     Auto initialize after DOM is ready
     --------------------------------------------------------- */

  function autoInit() {
    const root =
      document.querySelector("[data-sakin-quran-root]");

    if (root) {
      init({
        root: root
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      autoInit
    );
  } else {
    autoInit();
  }

})(window);
