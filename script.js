// Card-based horizontal scroll navigation
(function() {
    'use strict';

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scrollBehavior = prefersReducedMotion ? 'auto' : 'smooth';

    // Get DOM elements
    const cardsContainer = document.getElementById('cardsContainer');
    const cards = document.querySelectorAll('.content-card');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (!cardsContainer || cards.length === 0) return;

    // Section data structure
    const sections = Array.from(cards).map((card, index) => ({
        id: card.id,
        element: card,
        index: index
    }));

    let currentIndex = 0;

    // Update active card index and prev/next button states
    function updateActiveCard() {
        const scrollLeft = cardsContainer.scrollLeft;
        const containerWidth = cardsContainer.clientWidth;
        const viewportCenter = scrollLeft + containerWidth / 2;
        
        // Find the card closest to the viewport center
        let closestIndex = 0;
        let closestDistance = Infinity;
        
        cards.forEach((card, index) => {
            const cardLeft = card.offsetLeft;
            const cardWidth = card.offsetWidth;
            const cardCenter = cardLeft + cardWidth / 2;
            const distance = Math.abs(viewportCenter - cardCenter);
            
            if (distance < closestDistance) {
                closestDistance = distance;
                closestIndex = index;
            }
        });

        currentIndex = closestIndex;

        // Update prev/next buttons
        if (prevBtn) {
            prevBtn.disabled = currentIndex === 0;
        }
        if (nextBtn) {
            nextBtn.disabled = currentIndex === cards.length - 1;
        }
    }

    // Scroll to card by index
    function scrollToCard(index) {
        if (index < 0 || index >= cards.length) return;
        
        const targetCard = cards[index];
        // Account for container padding - scroll to card start minus padding
        const containerPadding = window.getComputedStyle(cardsContainer).paddingLeft;
        const paddingValue = parseInt(containerPadding) || 0;
        const targetLeft = targetCard.offsetLeft - paddingValue;
        
        cardsContainer.scrollTo({
            left: targetLeft,
            behavior: scrollBehavior
        });
        
        // Update button states immediately
        if (prevBtn) {
            prevBtn.disabled = index === 0;
        }
        if (nextBtn) {
            nextBtn.disabled = index === cards.length - 1;
        }
    }

    // Scroll to card by ID (for anchor links)
    function scrollToCardById(id) {
        const index = sections.findIndex(section => section.id === id);
        if (index !== -1) {
            scrollToCard(index);
        }
    }

    // Handle anchor link clicks (if any exist)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && href !== '#') {
                e.preventDefault();
                const targetId = href.substring(1);
                scrollToCardById(targetId);
            }
        });
    });

    // Prev/Next button handlers
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex = currentIndex - 1;
                scrollToCard(currentIndex);
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentIndex < cards.length - 1) {
                currentIndex = currentIndex + 1;
                scrollToCard(currentIndex);
            }
        });
    }

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        // Only handle if not typing in an input/textarea
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        // Arrow key navigation (desktop only - horizontal scroll)
        if (window.innerWidth > 768) {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                e.preventDefault();
                
                if (e.key === 'ArrowLeft') {
                    scrollToCard(currentIndex - 1);
                } else if (e.key === 'ArrowRight') {
                    scrollToCard(currentIndex + 1);
                }
            }
        }

        // Tab navigation for accessibility
        if (e.key === 'Tab') {
            // Let browser handle default tab behavior
            // Focus styles are handled by CSS
        }
    });

    // Update on scroll
    let scrollTimeout;
    cardsContainer.addEventListener('scroll', function() {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(updateActiveCard, 50);
    });

    // Initial update
    updateActiveCard();

    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            updateActiveCard();
        }, 100);
    });


    // Accordion behavior for experience boxes (only one open at a time)
    const expBoxes = document.querySelectorAll('.exp-box');
    expBoxes.forEach(box => {
        box.addEventListener('toggle', function() {
            if (this.open) {
                // Close all other boxes
                expBoxes.forEach(otherBox => {
                    if (otherBox !== this && otherBox.open) {
                        otherBox.open = false;
                    }
                });
            }
        });
    });

    // Intersection Observer for fade-in animations (respects reduced motion)
    if (!prefersReducedMotion) {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe cards and inner elements
        document.querySelectorAll(
            '.info-block, .exp-box, .project-card, .learning-item'
        ).forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }

})();
