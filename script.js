// Evitar que el navegador restaure la posición de scroll por defecto
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const darkModeToggle = document.getElementById("dark-mode-toggle");
const allNavLinks = document.querySelectorAll(".nav-links a");
const sections = document.querySelectorAll("main, section[id]");

menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");
});

allNavLinks.forEach(link => {
    link.addEventListener("click", () => {
        if (navLinks.classList.contains("active")) {
            navLinks.classList.remove("active");
        }
    });
});

let navIndicator; // element for sliding indicator
function updateNavIndicator() {
    if (!navIndicator) return;
    const activeLink = document.querySelector('.nav-links a.active');
    if (!activeLink) {
        navIndicator.style.opacity = '0';
        return;
    }
    const linkRect = activeLink.getBoundingClientRect();
    const containerRect = navLinks.getBoundingClientRect();
    navIndicator.style.width = `${linkRect.width}px`;
    navIndicator.style.left = `${linkRect.left - containerRect.left}px`;
    navIndicator.style.opacity = '1';
}

const navHighlighter = () => {
    let scrollY = window.pageYOffset;
    let currentSectionId = "";

    sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        if (scrollY >= sectionTop - 150 && scrollY < sectionTop + sectionHeight - 150) {
            currentSectionId = section.getAttribute('id');
        }
    });

    allNavLinks.forEach((link) => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSectionId}`) {
            link.classList.add('active');
        }
    });
    
    const portfolioSections = ['proyectos', 'cuentas', 'videos'];
    const portfolioToggle = document.querySelector('.dropdown-toggle');
    
    if (portfolioSections.includes(currentSectionId)) {
        portfolioToggle.classList.add('active');
    }
    // Move sliding indicator
    updateNavIndicator();
};

window.addEventListener('scroll', navHighlighter);

darkModeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
        localStorage.setItem("theme", "dark");
        } else {
        localStorage.setItem("theme", "light");
        }
});

if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
}

function setupPagination(gridClass, cardClass, paginationClass, itemsPerPage) {
    const grid = document.querySelector(gridClass);
    if (!grid) return;

    const allCards = Array.from(grid.querySelectorAll(cardClass));
    const activeItems = allCards.filter(item => item.dataset.filtered !== 'true');
    const paginationContainer = document.querySelector(paginationClass);
    
    if (!paginationContainer) return;

    // Limpiar paginación anterior
    paginationContainer.innerHTML = '';

    const totalPages = Math.ceil(activeItems.length / itemsPerPage);

    if (totalPages <= 1) {
        // Mostrar todos los elementos activos y ocultar los filtrados
        allCards.forEach(item => {
            if (item.dataset.filtered === 'true') {
                item.style.display = 'none';
            } else {
                item.style.display = '';
                item.classList.add('visible');
            }
        });
        paginationContainer.style.display = 'none';
        return;
    }

    paginationContainer.style.display = 'block';

    function showPage(page) {
        // Re-evaluate items in case other filters or dynamic changes were applied
        const allCardsInGrid = Array.from(grid.querySelectorAll(cardClass));
        // remove any visible class from all cards to reset animations
        allCardsInGrid.forEach(i => i.classList.remove('visible'));

        // Use a dataset flag to exclude items filtered out by other UI (ignoring previous inline display from pagination)
        const paginatableItems = allCardsInGrid.filter(item => item.dataset.filtered !== 'true');

        // hide everything first (inline) to allow CSS to reflow when we clear the inline style
        allCardsInGrid.forEach(item => item.style.display = 'none');

        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        // Clear inline display so CSS controls the card layout (flex/block as defined)
        paginatableItems.slice(startIndex, endIndex).forEach(item => item.style.display = '');

        const buttons = paginationContainer.querySelectorAll('.pagination-btn');
        buttons.forEach((btn, index) => {
            btn.classList.toggle('active', index + 1 === page);
            btn.setAttribute('aria-current', index + 1 === page ? 'page' : 'false');
        });
        
        // Scroll desactivado en paginación para evitar saltos de página en cualquier sección
        // (Si se desea reactivar, usar scrollIntoView aquí de forma condicional)

        // Reveal the newly visible items with the same stagger rule used elsewhere
        const visibleItems = paginatableItems.slice(startIndex, endIndex);
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        visibleItems.forEach((item, i) => {
            if (reduceMotion) {
                item.classList.add('visible');
            } else {
                setTimeout(() => item.classList.add('visible'), i * 90);
            }
        });
        // Update prev/next disabled states and respect the current total pages based on currently paginatable items
        const totalPagesLocal = Math.ceil(paginatableItems.length / itemsPerPage) || 1;
        const prevBtnLocal = paginationContainer.querySelector('.pagination-arrow-btn.prev-btn');
        const nextBtnLocal = paginationContainer.querySelector('.pagination-arrow-btn.next-btn');
        if (prevBtnLocal) prevBtnLocal.disabled = (page === 1);
        if (nextBtnLocal) nextBtnLocal.disabled = (page === totalPagesLocal);
    }

    // Crear botones de navegación
    const navContainer = document.createElement('div');
    navContainer.className = 'pagination-nav';
    
    // Botón anterior
    const prevBtn = document.createElement('button');
    prevBtn.className = 'pagination-arrow-btn prev-btn';
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.setAttribute('aria-label', 'Página anterior');
        prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const currentActive = paginationContainer.querySelector('.pagination-btn.active');
        if (currentActive) {
                const currentPage = parseInt(currentActive.dataset.page || currentActive.textContent);
            if (currentPage > 1) showPage(currentPage - 1);
        }
    });
    navContainer.appendChild(prevBtn);

    // Botones numerados
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.classList.add('pagination-btn');
            btn.textContent = i; // kept for accessibility if visible
            btn.dataset.page = i; // use dataset to track page without relying on textContent
        btn.setAttribute('aria-label', `Página ${i}`);
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            showPage(i);
        });
        navContainer.appendChild(btn);
    }

    // Botón siguiente
    const nextBtn = document.createElement('button');
    nextBtn.className = 'pagination-arrow-btn next-btn';
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.setAttribute('aria-label', 'Página siguiente');
        nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const currentActive = paginationContainer.querySelector('.pagination-btn.active');
        if (currentActive) {
                const currentPage = parseInt(currentActive.dataset.page || currentActive.textContent);
            if (currentPage < totalPages) showPage(currentPage + 1);
        }
    });
    navContainer.appendChild(nextBtn);

    paginationContainer.appendChild(navContainer);
    showPage(1);
}

document.addEventListener('DOMContentLoaded', () => {
    // Si no hay hash en la URL, garantizar que la página empiece desde arriba
    if (!location.hash) {
        window.scrollTo(0, 0);
    }
    navHighlighter();

    const elementsToFadeIn = document.querySelectorAll('.fade-in');
    elementsToFadeIn.forEach(el => fadeInObserver.observe(el));

    // Timeline items: staggered reveal when they enter the viewport
    const timelineItems = document.querySelectorAll('.timeline .timeline-item');
    if (timelineItems.length) {
        const timelineObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const el = entry.target;
                const idx = Array.from(timelineItems).indexOf(el);
                if (entry.isIntersecting) {
                    // apply a staggered delay based on index
                    el.style.transitionDelay = `${Math.min(10, idx) * 80}ms`;
                    el.classList.add('visible');
                } else {
                    el.classList.remove('visible');
                    el.style.transitionDelay = '';
                }
            });
        }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });

        timelineItems.forEach(item => timelineObserver.observe(item));
    }

    // Education grid: stagger reveal of education cards for a refined effect
    const educationGridEl = document.querySelector('.education-grid');
    if (educationGridEl) {
        const eduObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const cards = Array.from(educationGridEl.querySelectorAll('.education-card')).filter(c => getComputedStyle(c).display !== 'none');
                const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                if (entry.isIntersecting) {
                    cards.forEach((card, i) => {
                        if (reduceMotion) {
                            card.classList.add('visible');
                        } else {
                            setTimeout(() => card.classList.add('visible'), i * 90);
                        }
                    });
                } else {
                    cards.forEach(card => card.classList.remove('visible'));
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

        eduObserver.observe(educationGridEl);
    }

    // Filtros eliminados: asegurar que todas las cards de proyectos estén activas para paginación
    const proyectoCards = document.querySelectorAll('.proyecto-card');
    proyectoCards.forEach(card => { card.dataset.filtered = 'false'; });

    // Interceptar enlaces de anclaje para evitar que el hash quede en la URL
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        const href = anchor.getAttribute('href');
        if (!href || href === '#') return; // Ignorar los simples '#'

        const targetEl = document.querySelector(href);
        if (!targetEl) return; // Si el selector no existe, permitir comportamiento por defecto

        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            // Cerrar menú móvil si está abierto
            if (navLinks.classList.contains('active')) navLinks.classList.remove('active');
            // Desplazar suavemente a la sección
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Eliminar hash de la URL para evitar que recargar mantenga la posición
            history.replaceState(null, '', location.pathname + location.search);
            // Actualizar resaltado del nav poco después
            setTimeout(navHighlighter, 300);
        });
    });

    setupPagination('.proyectos-grid', '.proyecto-card', '.proyectos-pagination', 4);
    setupPagination('.cuentas-grid', '.cuenta-card', '.cuentas-pagination', 4);
    setupPagination('.videos-grid', '.video-card', '.videos-pagination', 4);

    // --- Lógica del carrusel de logos ---
    const scroller = document.querySelector('.logos-scroller');
    if (scroller) {
        const scrollerContent = Array.from(scroller.children);
        scrollerContent.forEach(item => {
            const duplicatedItem = item.cloneNode(true);
            scroller.appendChild(duplicatedItem);
        });
    }

    // Crear el indicador deslizable debajo del menu
    if (navLinks) {
        navIndicator = document.createElement('span');
        navIndicator.className = 'nav-indicator';
        navLinks.appendChild(navIndicator);
        updateNavIndicator();
        window.addEventListener('resize', updateNavIndicator);
    }
    // --- Paginación minimalista para Educación ---
    setupPagination('.education-grid', '.education-card', '.education-pagination', 3);
    // showPage(1) will reveal initial cards via the function's own logic


    const videoModal = document.getElementById('video-modal');
    const modalVideoPlayer = document.getElementById('modal-video-player');
    const closeModal = document.querySelector('.close-modal');
    const videoCards = document.querySelectorAll('.video-card');
    const playPauseBtn = document.querySelector('.play-pause-btn');
    const progressBar = document.querySelector('.progress-bar');
    const progressBarFilled = document.querySelector('.progress-bar-filled');
    const currentTimeEl = document.querySelector('.current-time');
    const totalTimeEl = document.querySelector('.total-time');
    const volumeBtn = document.querySelector('.volume-btn');

    videoCards.forEach(card => {
        card.addEventListener('click', () => {
            const videoSrc = card.getAttribute('data-video-src');
            if (videoSrc) {
                modalVideoPlayer.src = videoSrc;
                videoModal.classList.add('active');
                modalVideoPlayer.play();
            }
        });
    });

    const hideModal = () => {
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        videoModal.classList.remove('active');
        modalVideoPlayer.pause();
        modalVideoPlayer.src = "";
    };

    closeModal.addEventListener('click', hideModal);
    videoModal.addEventListener('click', (e) => {
        if (e.target === videoModal) {
            hideModal();
        }
    });

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }

    playPauseBtn.addEventListener('click', () => {
        if (modalVideoPlayer.paused) {
            modalVideoPlayer.play();
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        } else {
            modalVideoPlayer.pause();
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
    });

    modalVideoPlayer.addEventListener('timeupdate', () => {
        const progress = (modalVideoPlayer.currentTime / modalVideoPlayer.duration) * 100;
        progressBarFilled.style.width = `${progress}%`;
        currentTimeEl.textContent = formatTime(modalVideoPlayer.currentTime);
    });

    modalVideoPlayer.addEventListener('loadedmetadata', () => {
        totalTimeEl.textContent = formatTime(modalVideoPlayer.duration);
    });

    progressBar.addEventListener('click', (e) => {
        const progressTime = (e.offsetX / progressBar.offsetWidth) * modalVideoPlayer.duration;
        modalVideoPlayer.currentTime = progressTime;
    });

    volumeBtn.addEventListener('click', () => {
        modalVideoPlayer.muted = !modalVideoPlayer.muted;
        if (modalVideoPlayer.muted) {
            volumeBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
        } else {
            volumeBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
        }
    });
    
    modalVideoPlayer.addEventListener('ended', () => {
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    });
});

const fadeInObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        } else {
            entry.target.classList.remove('visible');
        }
    });
}, {
    rootMargin: '0px',
    threshold: 0.1
});

// También forzar inicio en la parte superior cuando la página se muestra (back/forward restore)
window.addEventListener('pageshow', (event) => {
    if (!location.hash) {
        window.scrollTo(0, 0);
    }
});

// Asegurar que antes de recargar o salir, el scroll esté al inicio para evitar restauraciones indeseadas
window.addEventListener('beforeunload', () => {
    if (!location.hash) {
        window.scrollTo(0, 0);
    }
});