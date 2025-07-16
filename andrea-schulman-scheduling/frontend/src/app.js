// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initNavigation();
    initTestimonialsSlider();
    initFAQ();
    initScrollAnimations();
    initCTAButtons();
    initMobileMenu();
});

// Navigation functionality
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const header = document.querySelector('.header');
    
    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerHeight = header.offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Header background on scroll
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
            header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.boxShadow = 'none';
        }
    });
}

// Mobile menu functionality
function initMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            this.classList.toggle('active');
        });
        
        // Close mobile menu when clicking on a link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                mobileToggle.classList.remove('active');
            });
        });
    }
}

// Testimonials slider functionality
function initTestimonialsSlider() {
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    let currentSlide = 0;
    const totalSlides = testimonialCards.length;
    
    // Function to show specific slide
    function showSlide(index) {
        // Hide all cards
        testimonialCards.forEach(card => {
            card.classList.remove('active');
        });
        
        // Remove active class from all dots
        dots.forEach(dot => {
            dot.classList.remove('active');
        });
        
        // Show current card and activate corresponding dot
        if (testimonialCards[index]) {
            testimonialCards[index].classList.add('active');
        }
        if (dots[index]) {
            dots[index].classList.add('active');
        }
        
        currentSlide = index;
    }
    
    // Next slide function
    function nextSlide() {
        const nextIndex = (currentSlide + 1) % totalSlides;
        showSlide(nextIndex);
    }
    
    // Previous slide function
    function prevSlide() {
        const prevIndex = currentSlide === 0 ? totalSlides - 1 : currentSlide - 1;
        showSlide(prevIndex);
    }
    
    // Event listeners for navigation buttons
    if (nextBtn) {
        nextBtn.addEventListener('click', nextSlide);
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', prevSlide);
    }
    
    // Event listeners for dots
    dots.forEach((dot, index) => {
        dot.addEventListener('click', function() {
            showSlide(index);
        });
    });
    
    // Auto-advance slides every 6 seconds
    setInterval(nextSlide, 6000);
    
    // Initialize first slide
    showSlide(0);
}

// FAQ accordion functionality - FIXED
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        if (question && answer) {
            question.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const isActive = item.classList.contains('active');
                
                // Close all FAQ items first
                faqItems.forEach(faqItem => {
                    faqItem.classList.remove('active');
                    const faqAnswer = faqItem.querySelector('.faq-answer');
                    if (faqAnswer) {
                        faqAnswer.style.maxHeight = '0';
                    }
                });
                
                // If the clicked item wasn't active, open it
                if (!isActive) {
                    item.classList.add('active');
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                }
            });
        }
    });
}

// Scroll animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Elements to animate on scroll
    const animateElements = document.querySelectorAll('.domain-card, .week-item, .inclusion-card, .testimonial-card');
    
    animateElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(element);
    });
}

// CTA button functionality - FIXED
function initCTAButtons() {
    const enrollButtons = document.querySelectorAll('.btn--primary, .nav-cta, .pricing-cta');
    const learnMoreButtons = document.querySelectorAll('.btn--outline');
    
    // Handle Enroll Now buttons
    enrollButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Add click animation
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
            
            // Handle enrollment action
            if (this.textContent.includes('Enroll') || this.classList.contains('nav-cta') || this.classList.contains('pricing-cta')) {
                handleEnrollment();
            }
        });
    });
    
    // Handle Learn More buttons
    learnMoreButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Add click animation
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
            
            // Scroll to overview section
            const overviewSection = document.querySelector('#overview');
            if (overviewSection) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = overviewSection.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Handle enrollment process - FIXED
function handleEnrollment() {
    // Remove any existing modals
    const existingModal = document.querySelector('.enrollment-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'enrollment-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Ready to Transform Your Life?</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <p>You're about to join the <strong>Building Emotional Maturity</strong> program.</p>
                <div class="enrollment-summary">
                    <h4>Program Includes:</h4>
                    <ul>
                        <li>✓ Six weekly recorded sessions (6 months access)</li>
                        <li>✓ Weekly reflective writing exercises</li>
                        <li>✓ Supportive materials and exercises</li>
                        <li>✓ Centering meditations</li>
                        <li>✓ Inner child guided meditations</li>
                    </ul>
                    <div class="price-summary">
                        <span class="original">Regular Price: <strike>$735</strike></span>
                        <span class="current">Your Price: $387</span>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn btn--primary btn--full-width modal-enroll-btn">Complete Enrollment - $387</button>
                    <p class="enrollment-note">Secure payment processed through our partner platform</p>
                </div>
            </div>
        </div>
    `;
    
    // Add modal styles
    const modalStyles = `
        .enrollment-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s ease-out;
            padding: 20px;
        }
        
        .enrollment-modal.show {
            opacity: 1;
        }
        
        .modal-content {
            background: white;
            border-radius: 12px;
            max-width: 500px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            transform: translateY(30px);
            transition: transform 0.3s ease-out;
        }
        
        .enrollment-modal.show .modal-content {
            transform: translateY(0);
        }
        
        .modal-header {
            padding: 24px 24px 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .modal-header h3 {
            margin: 0;
            color: var(--color-text);
        }
        
        .modal-close {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: var(--color-text-secondary);
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background-color 0.2s ease;
        }
        
        .modal-close:hover {
            background-color: var(--color-secondary);
        }
        
        .modal-body {
            padding: 24px;
        }
        
        .enrollment-summary {
            background: var(--color-warm-gray);
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        
        .enrollment-summary h4 {
            margin: 0 0 12px 0;
            color: var(--color-text);
        }
        
        .enrollment-summary ul {
            list-style: none;
            padding: 0;
            margin: 0 0 20px 0;
        }
        
        .enrollment-summary li {
            padding: 4px 0;
            color: var(--color-text-secondary);
        }
        
        .price-summary {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 16px;
            border-top: 1px solid var(--color-border);
        }
        
        .price-summary .original {
            color: var(--color-text-secondary);
            font-size: 14px;
        }
        
        .price-summary .current {
            font-size: 20px;
            font-weight: 600;
            color: var(--color-primary);
        }
        
        .modal-actions {
            margin-top: 20px;
        }
        
        .enrollment-note {
            text-align: center;
            font-size: 12px;
            color: var(--color-text-secondary);
            margin-top: 12px;
            margin-bottom: 0;
        }
        
        .modal-enroll-btn {
            background: var(--color-primary) !important;
            color: white !important;
            border: none !important;
            padding: 12px 24px !important;
            border-radius: 8px !important;
            font-size: 16px !important;
            font-weight: 600 !important;
            cursor: pointer !important;
            transition: all 0.3s ease !important;
        }
        
        .modal-enroll-btn:hover {
            background: var(--color-primary-hover) !important;
            transform: translateY(-2px) !important;
        }
    `;
    
    // Add styles to head if not already added
    if (!document.querySelector('#modal-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'modal-styles';
        styleSheet.textContent = modalStyles;
        document.head.appendChild(styleSheet);
    }
    
    // Add modal to DOM
    document.body.appendChild(modal);
    
    // Show modal with animation
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
    
    // Close modal functionality
    const closeModal = () => {
        modal.classList.remove('show');
        setTimeout(() => {
            if (modal.parentNode) {
                document.body.removeChild(modal);
            }
        }, 300);
    };
    
    // Event listeners for modal
    const closeButton = modal.querySelector('.modal-close');
    if (closeButton) {
        closeButton.addEventListener('click', closeModal);
    }
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Handle final enrollment button
    const enrollButton = modal.querySelector('.modal-enroll-btn');
    if (enrollButton) {
        enrollButton.addEventListener('click', function() {
            alert('Thank you for your interest! In a real implementation, this would redirect to a secure payment processor.');
            closeModal();
        });
    }
    
    // Escape key to close
    const escapeHandler = (e) => {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);
}

// Utility function for smooth scrolling
function smoothScrollTo(target, duration = 800) {
    const targetElement = document.querySelector(target);
    if (!targetElement) return;
    
    const headerHeight = document.querySelector('.header').offsetHeight;
    const targetPosition = targetElement.offsetTop - headerHeight - 20;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;
    
    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const run = ease(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) requestAnimationFrame(animation);
    }
    
    function ease(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }
    
    requestAnimationFrame(animation);
}

// Add hover effects to interactive elements
document.addEventListener('DOMContentLoaded', function() {
    // Add ripple effect to buttons
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => {
                if (ripple.parentNode) {
                    ripple.remove();
                }
            }, 600);
        });
    });
    
    // Add CSS for ripple animation
    const rippleStyles = `
        @keyframes ripple {
            to {
                transform: scale(2);
                opacity: 0;
            }
        }
    `;
    
    if (!document.querySelector('#ripple-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'ripple-styles';
        styleSheet.textContent = rippleStyles;
        document.head.appendChild(styleSheet);
    }
});

// Parallax effect for hero section
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    const heroBackground = document.querySelector('.hero-background');
    
    if (hero && heroBackground) {
        const rate = scrolled * -0.5;
        heroBackground.style.transform = `translateY(${rate}px)`;
    }
});

// Loading animation
window.addEventListener('load', function() {
    document.body.classList.add('loaded');
    
    // Animate hero content on load
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.style.animation = 'fadeInUp 1s ease-out';
    }
});