document.addEventListener('DOMContentLoaded', () => {
    const contentDiv = document.getElementById('content');
    const navLinks = document.querySelectorAll('.nav-link');
    let currentLanguages = {};

    const SONGS_DATA = {
      "hirondelle": {
        title: "Hirondelle",
        spotifyId: "1DYbJq0859bzOpPv6x6jS6",
        album: false,
        folder: "hirondelle",
      },
      "sexe-moi": {
        title: "Sexe-moi",
        spotifyId: "5FON19P0gszDsSz5FZnOcS",
        album: true,
        folder: "sexe-moi",
      },
      "この愛": {
        title: "この愛",
        spotifyId: "317R7XZ3FBTFzxneM5Ck4C",
        album: false,
        folder: "この愛",
      },
    };

    const routes = {
        "#lyrics": "songsList",
        "#song": null,
        "#digital-works": "content/digital-works.txt",
        "#fashion": "content/fashion.txt",
        "#physical-artworks": "content/physical-artworks.txt",
        "#about": "content/about-me.txt",
    };

    function createSpotifyPlayer(isAlbum, trackId) {
        return `<div class="music-player">
            <iframe style="border-radius:12px" 
                src="https://open.spotify.com/embed/${isAlbum === true ? 'album' : 'track'}/${trackId}?utm_source=generator&theme=1" 
                width="100%" height="152" frameBorder="0" allowfullscreen="" 
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                loading="lazy">
            </iframe>
        </div>`;
    }

    async function checkFileExists(path) {
        try {
            const response = await fetch(path, { method: 'HEAD' });
            return response.status === 200;
        } catch {
            return false;
        }
    }
    
    async function getAvailableTranslations(translations) {
        const availableTranslations = {};
        
        // Check each translation file exists before adding to available list
        for (const [lang, data] of Object.entries(translations)) {
            if (await checkFileExists(data.path)) {
                availableTranslations[lang] = data;
            }
            // Skip if file doesn't exist - no error logging needed
        }
        
        return availableTranslations;
    }

    async function createSongSection(songId, data) {
        const allTranslations = {
          original: {
            path: `content/${data.folder}/original.txt`,
            icon: "fa-solid fa-flag",
            label: "Original",
          },
          chinese: {
            path: `content/${data.folder}/translation_zh.txt`,
            icon: "fa-solid fa-flag",
            label: "中文",
          },
          english: {
            path: `content/${data.folder}/translation_en.txt`,
            icon: "fa-solid fa-flag",
            label: "English",
          },
          japanese: {
            path: `content/${data.folder}/translation_ja.txt`,
            icon: "fa-solid fa-flag",
            label: "日本語",
          },
          french: {
            path: `content/${data.folder}/translation_fr.txt`,
            icon: "fa-solid fa-flag",
            label: "Français",
          },
        };
    
        const translations = await getAvailableTranslations(allTranslations);
        if (Object.keys(translations).length === 0) return '';
    
        currentLanguages[songId] = 'original';
        const initialTranslation = await loadTranslation(translations.original);
    
        return `
            <section class="song-section" id="song-${songId}">
                <h2>${data.title}</h2>
                ${createSpotifyPlayer(data.album, data.spotifyId)}
                <button class="show-lyrics-btn" data-song="${songId}">
                    Show Lyrics
                    <i class="fa-solid fa-chevron-down"></i>
                </button>
                <div class="lyrics-content hidden" data-song="${songId}">
                    <div class="language-selector" data-song="${songId}">
                        ${createLanguageButtons(translations, songId)}
                    </div>
                    <div class="translation-content" data-song="${songId}">
                        <pre>${initialTranslation}</pre>
                    </div>
                </div>
            </section>
        `;
    }
    
    // Add after loadLyricsPage function
    function setupLyricsToggle() {
        document.querySelectorAll('.show-lyrics-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const songId = btn.dataset.song;
                const lyricsContent = document.querySelector(`.lyrics-content[data-song="${songId}"]`);
                const isHidden = lyricsContent.classList.contains('hidden');
                
                lyricsContent.classList.toggle('hidden');
                btn.innerHTML = isHidden ? 
                    'Hide Lyrics <i class="fa-solid fa-chevron-up"></i>' : 
                    'Show Lyrics <i class="fa-solid fa-chevron-down"></i>';
            });
        });
    }
    
    // Update loadLyricsPage function
    async function loadLyricsPage() {
        const songSections = await Promise.all(
            Object.entries(SONGS_DATA).map(([id, data]) => 
                createSongSection(id, data)
            )
        );
    
        contentDiv.innerHTML = `
            <div class="lyrics-page">
                ${songSections.join('')}
            </div>`;
    
        setupLyricsToggle();
    
        document.querySelectorAll('.lang-btn').forEach(btn => {
            const songId = btn.closest('.language-selector').dataset.song;
            btn.addEventListener('click', () => 
                switchLanguage(songId, btn.dataset.lang));
        });
    }

    async function loadTranslation(translationData) {
        try {
            const response = await fetch(translationData.path);
            const text = await response.text();
            return text;
        } catch (error) {
            console.error('Error loading translation:', error);
            return 'Error loading lyrics';
        }
    }

    function createLanguageButtons(translations, songId) {
        return Object.entries(translations)
            .map(([lang, data]) => `
                <button class="lang-btn ${lang === currentLanguages[songId] ? 'active' : ''}" 
                        data-lang="${lang}" 
                        title="${data.label}">
                    <i class="${data.icon}"></i>
                    <span class="lang-label">${data.label}</span>
                </button>
            `).join('');
    }

    async function switchLanguage(songId, lang) {
        const contentDiv = document.querySelector(`.translation-content[data-song="${songId}"]`);
        
        contentDiv.classList.add('fade-out');
        await new Promise(resolve => setTimeout(resolve, 300));
        
        currentLanguages[songId] = lang;
        const allTranslations = {
            original: {
                path: `content/${SONGS_DATA[songId].folder}/original.txt`,
                icon: "fa-solid fa-flag",
                label: "Original"
            },
            chinese: {
                path: `content/${SONGS_DATA[songId].folder}/translation_zh.txt`,
                icon: "fa-solid fa-flag",
                label: "中文"
            },
            english: {
                path: `content/${SONGS_DATA[songId].folder}/translation_en.txt`,
                icon: "fa-solid fa-flag",
                label: "English"
            }
        };
        const translations = await getAvailableTranslations(allTranslations);
        const translationContent = await loadTranslation(translations[lang]);
        
        contentDiv.innerHTML = `<pre>${translationContent}</pre>`;
        requestAnimationFrame(() => {
            contentDiv.classList.remove('fade-out');
        });
        
        document.querySelectorAll(`.language-selector[data-song="${songId}"] .lang-btn`)
            .forEach(btn => {
                btn.classList.toggle('active', btn.dataset.lang === lang);
            });
    }

    async function loadContent(hash) {
        if (hash === '#lyrics' || !hash) {
            await loadLyricsPage();
        } else {
            const route = routes[hash];
            if (typeof route === 'string' && route !== 'songsList') {
                try {
                    const response = await fetch(route);
                    const data = await response.text();
                    contentDiv.innerHTML = `<pre>${data}</pre>`;
                } catch (error) {
                    contentDiv.innerHTML = '<h2>Error loading content</h2>';
                }
            } else if (!route) {
                contentDiv.innerHTML = '<h2>Page not found</h2>';
            }
        }

        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === hash);
        });
    }

    window.addEventListener('hashchange', () => {
        loadContent(window.location.hash);
    });

    loadContent(window.location.hash || '#lyrics');
});
