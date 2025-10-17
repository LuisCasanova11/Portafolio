const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const darkModeToggle = document.getElementById("dark-mode-toggle");
const allNavLinks = document.querySelectorAll(".nav-links a");
const sections = document.querySelectorAll("main, section[id]");

// --- Toggle del menú móvil ---
menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");
});

// --- Cierra el menú móvil al hacer clic en un enlace ---
allNavLinks.forEach(link => {
    link.addEventListener("click", () => {
        if (navLinks.classList.contains("active")) {
            navLinks.classList.remove("active");
        }
    });
});

// --- Resaltado de enlace activo al hacer scroll (Método robusto) ---
const navHighlighter = () => {
    // Obtiene la posición actual del scroll
    let scrollY = window.pageYOffset;
    let currentSectionId = "";

    // Itera sobre cada sección para ver cuál está en la vista
    sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;

        // Si la posición del scroll está dentro de los límites de la sección actual...
        // El offset de 150px ayuda a que el cambio sea más natural y no justo en el borde.
        if (scrollY >= sectionTop - 150 && scrollY < sectionTop + sectionHeight - 150) {
            currentSectionId = section.getAttribute('id');
        }
    });

    // Actualiza la clase 'active' en el enlace correspondiente
    allNavLinks.forEach((link) => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSectionId}`) {
            link.classList.add('active');
        }
    });
};

window.addEventListener('scroll', navHighlighter);

// --- Lógica del Modo Oscuro ---
darkModeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");

    // Guardar preferencia en localStorage
    if (document.body.classList.contains("dark-mode")) {
        localStorage.setItem("theme", "dark");
    } else {
        localStorage.setItem("theme", "light");
    }
});

// Comprobar preferencia al cargar la página
if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
}

// --- Lógica de Paginación y Modal de Video ---

// Función reutilizable para configurar la paginación
function setupPagination(gridClass, cardClass, paginationClass, itemsPerPage) {
    const grid = document.querySelector(gridClass);
    if (!grid) return;

    const allItems = Array.from(grid.querySelectorAll(cardClass));
    const paginationContainer = document.querySelector(paginationClass);
    const totalPages = Math.ceil(allItems.length / itemsPerPage);

    if (totalPages <= 1) {
        if (paginationContainer) paginationContainer.style.display = 'none';
        return;
    }

    function showPage(page) {
        allItems.forEach(item => item.style.display = 'none');

        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        allItems.slice(startIndex, endIndex).forEach(item => item.style.display = 'block');

        const dots = paginationContainer.querySelectorAll('.pagination-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index + 1 === page);
        });
    }

    for (let i = 1; i <= totalPages; i++) {
        const dot = document.createElement('span');
        dot.classList.add('pagination-dot');
        dot.addEventListener('click', (e) => {
            e.stopPropagation();
            showPage(i);
        });
        paginationContainer.appendChild(dot);
    }

    showPage(1);
}

document.addEventListener('DOMContentLoaded', () => {
    // Llama a la función una vez al cargar la página para establecer el estado inicial correcto
    navHighlighter();

    // Configura las animaciones de fade-in
    const elementsToFadeIn = document.querySelectorAll('.fade-in');
    elementsToFadeIn.forEach(el => fadeInObserver.observe(el));

    // Configura la paginación para Proyectos
    setupPagination('.proyectos-grid', '.proyecto-card', '.proyectos-pagination', 3);

    // Configura la paginación para Cuentas (ej: 4 por página)
    setupPagination('.cuentas-grid', '.cuenta-card', '.cuentas-pagination', 4);

    // Configura la paginación para Videos
    setupPagination('.videos-grid', '.video-card', '.videos-pagination', 2);

    // --- Lógica del Modal de Video ---
    const videoModal = document.getElementById('video-modal');
    const modalVideoPlayer = document.getElementById('modal-video-player');
    const closeModal = document.querySelector('.close-modal');
    const videoCards = document.querySelectorAll('.video-card');

    videoCards.forEach(card => {
        card.addEventListener('click', () => {
            const videoSrc = card.getAttribute('data-video-src');
            if (videoSrc) {
                modalVideoPlayer.src = videoSrc;
                videoModal.classList.add('active');
                modalVideoPlayer.play(); // Inicia la reproducción automáticamente
            }
        });
    });

    const hideModal = () => {
        videoModal.classList.remove('active');
        modalVideoPlayer.pause();
        modalVideoPlayer.src = ""; // Detiene la descarga del video para liberar recursos
    };

    closeModal.addEventListener('click', hideModal);
    videoModal.addEventListener('click', (e) => {
        // Cierra el modal si se hace clic en el fondo oscuro
        if (e.target === videoModal) {
            hideModal();
        }
    });
});

// --- Lógica para Animaciones al hacer Scroll ---
const fadeInObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        } else {
            // Si el elemento ya no está en la pantalla, quitamos la clase para que se pueda animar de nuevo
            entry.target.classList.remove('visible');
        }
    });
}, {
    rootMargin: '0px',
    threshold: 0.1 // El elemento se animará cuando al menos el 10% sea visible
});