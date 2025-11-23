(function () {
    const API_BASE = 'heylingo.io';

    if (!window.location.hostname) {
        console.error("Translation Script: Missing domain");
        return;
    }

    // -----------------------------
    // LocalStorage helpers
    // -----------------------------
    function getSelectedLanguage() {
        return localStorage.getItem("selectedLanguage");
    }

    function getOriginalLanguage() {
        return localStorage.getItem("originalLanguage");
    }

    function saveSelectedLanguage(lang) {
        localStorage.setItem("selectedLanguage", lang);
    }

    function saveOriginalLanguage(lang) {
        localStorage.setItem("originalLanguage", lang);
    }

    // -----------------------------
    // Helper: hashing + DOM path
    // -----------------------------
    function hashString(str) {
        let hash = 0, i, chr;
        if (str.length === 0) return '0';
        for (i = 0; i < str.length; i++) {
            chr = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return Math.abs(hash).toString(16);
    }

    function getDomPath(el) {
        const stack = [];
        while (el && el.parentElement) {
            const tag = el.tagName.toLowerCase();
            let sibIndex = 1;
            let sibling = el;
            while ((sibling = sibling.previousElementSibling) != null) {
                if (sibling.tagName.toLowerCase() === tag) {
                    sibIndex++;
                }
            }
            stack.unshift(`${tag}:nth-of-type(${sibIndex})`);
            el = el.parentElement;
        }
        return stack.join(">");
    }

    function normalizeText(text) {
        return text.replace(/\s+/g, " ").trim();
    }

    function deriveRole(el) {
        const tag = el.tagName.toLowerCase();
        const inHeader = !!el.closest("header") || !!el.closest("nav");
        const inFooter = !!el.closest("footer");
        const isButtonLike = tag === "button" || (tag === "a" && el.getAttribute("role") === "button");

        if (isButtonLike) return "button";
        if (inHeader) return "nav";
        if (inFooter) return "footer";
        if (/^h[1-6]$/.test(tag)) return "heading";
        return "body";
    }

    function buildSegmentId(el, text) {
        const normalized = normalizeText(text).toLowerCase();
        const role = deriveRole(el);
        const domPath = getDomPath(el);
        const base = [
            window.location.hostname,
            window.location.pathname,
            role,
            domPath,
            normalized
        ].join("|");

        return hashString(base);
    }

    // -----------------------------
    // Segment Extraction
    // -----------------------------
    function extractSegments() {
        const selector = [
            "p",
            "li",
            "button",
            "a",
            "span",
            "h1", "h2", "h3", "h4", "h5", "h6"
        ].join(",");

        const elements = Array.from(document.querySelectorAll(selector))
            .filter(el => !el.closest("#languageSwitcher"));

        const segmentMap = new Map();

        elements.forEach((el) => {
            const text = el.innerText.trim();
            if (!text) return;

            const role = deriveRole(el);
            const segmentId = buildSegmentId(el, text);

            if (!segmentMap.has(segmentId)) {
                segmentMap.set(segmentId, {
                    id: segmentId,
                    text: text,
                    role: role,
                    page_path: window.location.pathname,
                    elements: []
                });
            }

            segmentMap.get(segmentId).elements.push(el);
        });

        return Array.from(segmentMap.values());
    }

    // -----------------------------
    // Apply translations
    // -----------------------------
    function applyTranslations(translations, segments) {
        if (!translations || typeof translations !== "object") {
            return;
        }

        segments.forEach(segment => {
            const tr = translations[segment.id];
            if (!tr || !tr.translated_text) return;

            segment.elements.forEach(el => {
                // Wir nutzen hier innerText, um Struktur beizubehalten
                el.innerText = tr.translated_text;
            });
        });
    }

    // -----------------------------
    // API Calls
    // -----------------------------
    function fetchTranslations() {
        const lang = getSelectedLanguage();

        if (!lang) {
            return;
        }

        if (lang === getOriginalLanguage()) {
            return;
        }

        const segments = extractSegments();

        if (!segments.length) {
            return;
        }

        const payloadSegments = segments.map(s => ({
            id: s.id,
            text: s.text,
            role: s.role,
            page_path: s.page_path
        }));

        fetch(`https://${API_BASE}/api/translate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                domain: window.location.hostname,
                target_lang: lang,
                segments: payloadSegments
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.error("Translation API Error:", data.error);
                    return;
                }
                applyTranslations(data.translations, segments);
            })
            .catch(error => console.error("Error fetching translations:", error));
    }

    function fetchAvailableLanguages() {
        fetch(`https://${API_BASE}/api/languages`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                domain: window.location.hostname
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.error("Language API Error:", data.error);
                    return;
                }

                if (data.original_language && data.original_language.code) {
                    if (!localStorage.getItem("selectedLanguage")) {
                        saveSelectedLanguage(data.original_language.code);
                    }

                    saveOriginalLanguage(data.original_language.code);
                }

                createLanguageSwitcher(data.target_languages);
            })
            .catch(error => console.error("Error fetching languages:", error));
    }

    // -----------------------------
    // UI: Language Switcher
    // -----------------------------
    function createLanguageSwitcher(languages) {
        const switcher = document.createElement("div");
        switcher.id = "languageSwitcher";
        switcher.style.position = "fixed";
        switcher.style.bottom = "20px";
        switcher.style.right = "20px";
        switcher.style.background = "white";
        switcher.style.border = "1px solid #ddd";
        switcher.style.padding = "10px";
        switcher.style.boxShadow = "0px 2px 10px rgba(0,0,0,0.2)";
        switcher.style.zIndex = "9999";
        switcher.style.borderRadius = "5px";
        switcher.style.color = "black";

        const select = document.createElement("select");
        select.style.padding = "5px";
        select.style.fontSize = "14px";
        select.style.border = "none";
        select.style.outline = "none";
        select.style.background = "white";
        select.style.appearance = "none";

        languages.forEach(lang => {
            const option = document.createElement("option");
            option.value = lang.code;
            option.textContent = lang.name;
            select.appendChild(option);
        });

        select.value = getSelectedLanguage();
        select.addEventListener("change", () => {
            saveSelectedLanguage(select.value);
            location.reload();
        });

        switcher.appendChild(select);
        document.body.appendChild(switcher);
    }

    // -----------------------------
    // Init
    // -----------------------------
    document.addEventListener("DOMContentLoaded", async () => {
        if (!getSelectedLanguage()) {
            const lang = navigator.language || "en-US";
            const formattedLang = lang.startsWith('de-') ? 'DE' : lang;
            saveSelectedLanguage(formattedLang);
        }

        await fetchAvailableLanguages();
        await fetchTranslations();

        document.documentElement.lang = getSelectedLanguage();
    });
})();