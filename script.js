class AwardWinningUI {
    constructor() {
        this.init();
        this.setupEventListeners();
        this.setupParticles();
        this.setupCursorFollower();
        this.setupScrollEffects();
        this.setupTouchInterface();
        this.setupAccessibility();
    }

    init() {
        // Preload animations
        document.addEventListener('DOMContentLoaded', () => {
            this.startLoadingSequence();
        });

        // Performance optimization
        this.lastFrame = 0;
        this.frameCount = 0;
        this.setupPerformanceMonitoring();
    }

    startLoadingSequence() {
        // Stagger animations for dramatic effect
        const elements = document.querySelectorAll('.word');
        elements.forEach((el, index) => {
            el.style.animationDelay = `${0.2 + index * 0.2}s`;
        });

        // Initialize navbar scroll effect
        this.handleNavbarScroll();
    }

    setupEventListeners() {
        // Mobile navigation toggle
        const navToggle = document.querySelector('.nav-toggle');
        const navLinks = document.querySelector('.nav-links');
        
        navToggle?.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Close mobile nav on link click
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navToggle?.classList.remove('active');
                navLinks?.classList.remove('active');
            });
        });

        // Button ripple effects
        document.querySelectorAll('.cta-button').forEach(button => {
            button.addEventListener('click', this.createRipple.bind(this));
        });

        // Smooth scrolling for internal links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Window resize handler
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // Scroll handlers
        window.addEventListener('scroll', this.throttle(this.handleScroll.bind(this), 16));
    }

    setupCursorFollower() {
        const cursor = document.querySelector('.cursor-follower');
        let mouseX = 0, mouseY = 0;
        let cursorX = 0, cursorY = 0;

        // Only enable on non-touch devices
        if (!('ontouchstart' in window)) {
            document.addEventListener('mousemove', (e) => {
                mouseX = e.clientX;
                mouseY = e.clientY;
                cursor.classList.add('active');
            });

            document.addEventListener('mouseleave', () => {
                cursor.classList.remove('active');
            });

            // Smooth cursor follow animation
            const animateCursor = () => {
                const dx = mouseX - cursorX;
                const dy = mouseY - cursorY;
                
                cursorX += dx * 0.1;
                cursorY += dy * 0.1;
                
                cursor.style.transform = `translate(${cursorX - 10}px, ${cursorY - 10}px)`;
                requestAnimationFrame(animateCursor);
            };
            animateCursor();

            // Interactive elements cursor effects
            document.querySelectorAll('a, button, .touch-point').forEach(el => {
                el.addEventListener('mouseenter', () => {
                    cursor.style.transform += ' scale(1.5)';
                });
                el.addEventListener('mouseleave', () => {
                    cursor.style.transform = cursor.style.transform.replace(' scale(1.5)', '');
                });
            });
        }
    }

    setupParticles() {
        const canvas = document.getElementById('particleCanvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let particles = [];
        let mouse = { x: null, y: null, radius: 100 };

        const resizeCanvas = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.radius = Math.random() * 2 + 1;
                this.opacity = Math.random() * 0.5 + 0.2;
                this.originalVx = this.vx;
                this.originalVy = this.vy;
            }

            update() {
                // Mouse interaction
                if (mouse.x !== null && mouse.y !== null) {
                    const dx = this.x - mouse.x;
                    const dy = this.y - mouse.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < mouse.radius) {
                        const force = (mouse.radius - distance) / mouse.radius;
                        const angle = Math.atan2(dy, dx);
                        this.vx += Math.cos(angle) * force * 0.1;
                        this.vy += Math.sin(angle) * force * 0.1;
                    }
                }

                // Gradually return to original velocity
                this.vx += (this.originalVx - this.vx) * 0.01;
                this.vy += (this.originalVy - this.vy) * 0.01;

                this.x += this.vx;
                this.y += this.vy;

                // Wrap around edges
                if (this.x < 0) this.x = canvas.width;
                if (this.x > canvas.width) this.x = 0;
                if (this.y < 0) this.y = canvas.height;
                if (this.y > canvas.height) this.y = 0;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(79, 172, 254, ${this.opacity})`;
                ctx.fill();
            }
        }

        // Create particles
        const particleCount = Math.min(100, Math.floor(canvas.width * canvas.height / 10000));
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        // Mouse tracking
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });

        canvas.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        });

        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Update and draw particles
            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });

            // Draw connections
            particles.forEach((particle, i) => {
                particles.slice(i + 1).forEach(otherParticle => {
                    const dx = particle.x - otherParticle.x;
                    const dy = particle.y - otherParticle.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < 100) {
                        ctx.beginPath();
                        ctx.moveTo(particle.x, particle.y);
                        ctx.lineTo(otherParticle.x, otherParticle.y);
                        ctx.strokeStyle = `rgba(79, 172, 254, ${0.2 * (1 - distance / 100)})`;
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                });
            });

            requestAnimationFrame(animate);
        };

        animate();
    }

    setupScrollEffects() {
        // Parallax effects
        const parallaxElements = document.querySelectorAll('.floating-shape, .hero-visual');
        
        window.addEventListener('scroll', this.throttle(() => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;

            parallaxElements.forEach((el, index) => {
                const speed = (index + 1) * 0.2;
                el.style.transform = `translateY(${rate * speed}px)`;
            });
        }, 16));

        // Intersection Observer for animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.feature-card, .section-title').forEach(el => {
            observer.observe(el);
        });
    }

    setupTouchInterface() {
        const touchPoints = document.querySelectorAll('.touch-point');
        const container = document.querySelector('.touch-interface');

        if (container) {
            touchPoints.forEach((point, index) => {
                const x = parseFloat(point.dataset.x) * 100;
                const y = parseFloat(point.dataset.y) * 100;
                
                point.style.left = `${x}%`;
                point.style.top = `${y}%`;
                point.style.transform = 'translate(-50%, -50%)';

                // Touch/click interactions
                point.addEventListener('click', () => {
                    this.createTouchWave(point);
                    this.playTouchSound(index);
                });

                // Hover effects
                point.addEventListener('mouseenter', () => {
                    this.animateTouchPoint(point, 'enter');
                });

                point.addEventListener('mouseleave', () => {
                    this.animateTouchPoint(point, 'leave');
                });
            });
        }
    }

    setupAccessibility() {
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });

        // Reduced motion support
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.body.classList.add('reduced-motion');
        }

        // High contrast support
        if (window.matchMedia('(prefers-contrast: high)').matches) {
            document.body.classList.add('high-contrast');
        }

        // Screen reader announcements
        this.setupScreenReaderAnnouncements();
    }

    setupScreenReaderAnnouncements() {
        const announcer = document.createElement('div');
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.className = 'sr-only';
        announcer.style.cssText = 'position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;';
        document.body.appendChild(announcer);

        this.announcer = announcer;
    }

    handleNavbarScroll() {
        const navbar = document.querySelector('.navbar');
        let lastScrollY = window.scrollY;

        window.addEventListener('scroll', this.throttle(() => {
            const currentScrollY = window.scrollY;
            
            if (currentScrollY > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }

            // Hide/show navbar on scroll
            if (currentScrollY > lastScrollY && currentScrollY > 200) {
                navbar.style.transform = 'translateY(-100%)';
            } else {
                navbar.style.transform = 'translateY(0)';
            }

            lastScrollY = currentScrollY;
        }, 16));
    }

    createRipple(e) {
        const button = e.currentTarget;
        const ripple = button.querySelector('.button-ripple');
        
        if (ripple) {
            ripple.style.width = '0';
            ripple.style.height = '0';
            
            setTimeout(() => {
                ripple.style.width = '300px';
                ripple.style.height = '300px';
            }, 10);

            setTimeout(() => {
                ripple.style.width = '0';
                ripple.style.height = '0';
            }, 600);
        }

        // Haptic feedback if supported
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    }

    createTouchWave(point) {
        const wave = document.createElement('div');
        wave.className = 'touch-wave';
        wave.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            border: 2px solid rgba(79, 172, 254, 0.6);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            pointer-events: none;
            animation: waveExpand 0.8s ease-out forwards;
        `;

        point.appendChild(wave);

        setTimeout(() => {
            wave.remove();
        }, 800);
    }

    animateTouchPoint(point, type) {
        if (type === 'enter') {
            point.style.animation = 'none';
            point.style.transform = 'translate(-50%, -50%) scale(1.3)';
            point.style.boxShadow = '0 0 20px rgba(79, 172, 254, 0.8)';
        } else {
            point.style.transform = 'translate(-50%, -50%) scale(1)';
            point.style.boxShadow = '';
            point.style.animation = 'touchPulse 2s ease-in-out infinite';
        }
    }

    playTouchSound(index) {
        // Web Audio API for touch sounds
        if (this.audioContext) {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(200 + (index * 100), this.audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.3);
        }
    }

    setupPerformanceMonitoring() {
        // Monitor FPS
        const measureFPS = () => {
            this.frameCount++;
            const now = performance.now();
            
            if (now >= this.lastFrame + 1000) {
                const fps = Math.round((this.frameCount * 1000) / (now - this.lastFrame));
                
                // Reduce effects if FPS is low
                if (fps < 30) {
                    document.body.classList.add('low-performance');
                } else {
                    document.body.classList.remove('low-performance');
                }
                
                this.frameCount = 0;
                this.lastFrame = now;
            }
            
            requestAnimationFrame(measureFPS);
        };
        
        measureFPS();

        // Memory usage monitoring
        if (performance.memory) {
            setInterval(() => {
                const memoryUsage = performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit;
                if (memoryUsage > 0.9) {
                    console.warn('High memory usage detected');
                    this.optimizePerformance();
                }
            }, 5000);
        }
    }

    optimizePerformance() {
        // Reduce particle count
        const canvas = document.getElementById('particleCanvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            // Clear canvas temporarily to free memory
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        // Disable some animations
        document.body.classList.add('performance-mode');
    }

    handleResize() {
        // Debounced resize handler
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            // Recalculate touch points positions
            this.setupTouchInterface();
            
            // Resize particle canvas
            const canvas = document.getElementById('particleCanvas');
            if (canvas) {
                canvas.width = canvas.offsetWidth;
                canvas.height = canvas.offsetHeight;
            }
        }, 250);
    }

    handleScroll() {
        // Update parallax effects
        const scrolled = window.pageYOffset;
        
        // Update progress indicator if it exists
        const progress = Math.min(scrolled / (document.body.scrollHeight - window.innerHeight), 1);
        document.documentElement.style.setProperty('--scroll-progress', progress);
    }

    // Utility functions
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new AwardWinningUI();
});

// Add wave animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes waveExpand {
        0% {
            width: 0;
            height: 0;
            opacity: 1;
        }
        100% {
            width: 100px;
            height: 100px;
            opacity: 0;
        }
    }

    .keyboard-navigation *:focus {
        outline: 2px solid #4facfe !important;
        outline-offset: 4px !important;
    }

    .reduced-motion * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }

    .low-performance .floating-shape,
    .low-performance .orb-ring,
    .performance-mode .floating-shape,
    .performance-mode .orb-ring {
        animation: none !important;
    }

    .low-performance #particleCanvas,
    .performance-mode #particleCanvas {
        display: none;
    }

    /* Loading states */
    .feature-card {
        opacity: 0;
        transform: translateY(50px);
        transition: all 0.6s ease;
    }

    .feature-card.animate-in {
        opacity: 1;
        transform: translateY(0);
    }

    /* High contrast mode */
    .high-contrast {
        filter: contrast(150%);
    }

    .high-contrast .glass-bg {
        background: rgba(255, 255, 255, 0.9) !important;
        color: #000000 !important;
    }
`;
document.head.appendChild(style);