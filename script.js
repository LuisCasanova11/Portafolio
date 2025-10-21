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
    navHighlighter();

    const elementsToFadeIn = document.querySelectorAll('.fade-in');
    elementsToFadeIn.forEach(el => fadeInObserver.observe(el));

    setupPagination('.proyectos-grid', '.proyecto-card', '.proyectos-pagination', 3);
    setupPagination('.cuentas-grid', '.cuenta-card', '.cuentas-pagination', 4);
    setupPagination('.videos-grid', '.video-card', '.videos-pagination', 2);

    // --- Lógica del botón "Ver más" para Cursos ---
    const toggleCoursesBtn = document.getElementById('toggle-courses-btn');
    const educationGrid = document.querySelector('.education-grid');

    if (toggleCoursesBtn && educationGrid) {
        toggleCoursesBtn.addEventListener('click', () => {
            educationGrid.classList.toggle('show-all');
            if (educationGrid.classList.contains('show-all')) {
                toggleCoursesBtn.textContent = 'Ver menos';
            } else {
                toggleCoursesBtn.textContent = 'Ver más';
            }
        });
    }


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