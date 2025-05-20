class JobCard extends HTMLElement {
    constructor() {
        super();
        this.isFlipped = false;
    }

    connectedCallback() {
        const company = this.getAttribute('company');
        const job = this.getAttribute('job');
        const date = this.getAttribute('date');
        const description = this.getAttribute('description');
        const delay = this.getAttribute('delay') || '0';
        
        // Derive image path from company name
        const image =  `/assets/works/${company?.toLowerCase().replaceAll(' ', '_')}.jpg`;

        // Get a random suit and number for the card
        const suits = ['♠', '♥', '♦', '♣'];
        const numbers = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        const suit = suits[Math.floor(Math.random() * suits.length)];
        const number = numbers[Math.floor(Math.random() * numbers.length)];
        const isRed = suit === '♥' || suit === '♦';

        // Calculate rotation based on delay (only for desktop)
        const rotation = -40 + (parseInt(delay) / 50) * 5; // Gradual rotation from -15 to 15 degrees
        const translateY = parseInt(delay) / 20; // Gradual vertical offset
        const translateX = parseInt(delay) / 10; // Add horizontal offset
        const centeredOffset = parseInt(delay) / 8; // 1rem = 16px, offset based on delay
        const zIndex = parseInt(delay) / 100;
        this.style.setProperty('--rotation', `${rotation}deg`);
        this.style.setProperty('--delay', `${delay}ms`);
        this.style.setProperty('--centered-offset', `${centeredOffset}px`);
        this.style.setProperty('--z-index', zIndex);

        // Add HTML content
        this.innerHTML = `
            <div class="w-full h-full relative preserve-3d transition-transform duration-600 mt-4 animate-fade-in"
                 x-data="{ isFlipped: false, isCentered: false }"
                 x-on:click="isFlipped = !isFlipped; isCentered = !isCentered; $el.closest('job-card').classList.toggle('centered'); $el.classList.toggle('flipped')">
                <!-- Front Face -->
                <div class="front-face absolute w-full h-full backface-hidden rounded-2xl overflow-hidden bg-base-100 border-2 border-base-300 rounded-2xl">
                    <div class="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_100%_100%,transparent_0,transparent_8px,var(--b2)_8px,var(--b2)_9px,transparent_9px),radial-gradient(circle_at_0%_0%,transparent_0,transparent_8px,var(--b2)_8px,var(--b2)_9px,transparent_9px),radial-gradient(circle_at_100%_0%,transparent_0,transparent_8px,var(--b2)_8px,var(--b2)_9px,transparent_9px),radial-gradient(circle_at_0%_100%,transparent_0,transparent_8px,var(--b2)_8px,var(--b2)_9px,transparent_9px)] bg-[length:16px_16px]"></div>
                    
                    <!-- Corners -->
                    <div class="absolute top-4 left-4 flex flex-col items-center gap-1">
                        <div class="text-2xl font-bold ${isRed ? 'text-error' : 'text-base-content'}">${number}</div>
                        <div class="text-xl leading-none ${isRed ? 'text-error' : 'text-base-content'}">${suit}</div>
                    </div>
                    <div class="absolute bottom-4 right-4 flex flex-col items-center gap-1 rotate-180">
                        <div class="text-2xl font-bold ${isRed ? 'text-error' : 'text-base-content'}">${number}</div>
                        <div class="text-xl leading-none ${isRed ? 'text-error' : 'text-base-content'}">${suit}</div>
                    </div>

                    <!-- Center Content -->
                    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl opacity-5 ${isRed ? 'text-error' : 'text-base-content'}">${suit}</div>

                    <!-- Content -->
                    <div class="relative h-full flex flex-col justify-center items-center p-4 md:p-8 text-center">
                        <div class="w-16 h-16 md:w-20 md:h-20 mb-4 rounded-full overflow-hidden border-2 border-base-300 shadow-lg">
                            <img src="${image}" alt="${company} logo" class="w-full h-full object-cover">
                        </div>
                        <h3 class="text-lg md:text-xl font-bold text-base-content mb-2">${company}</h3>
                        <h4 class="text-sm md:text-base text-base-content/80 mb-1">${job}</h4>
                        <p class="text-xs md:text-sm text-base-content/60">${date}</p>
                    </div>
                </div>

                <!-- Back Face -->
                <div class="back-face absolute w-full h-full backface-hidden rounded-2xl overflow-hidden rotate-y-180 bg-base-100 border-2 border-base-300 rounded-2xl">
                    <div class="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_100%_100%,transparent_0,transparent_8px,var(--b2)_8px,var(--b2)_9px,transparent_9px),radial-gradient(circle_at_0%_0%,transparent_0,transparent_8px,var(--b2)_8px,var(--b2)_9px,transparent_9px),radial-gradient(circle_at_100%_0%,transparent_0,transparent_8px,var(--b2)_8px,var(--b2)_9px,transparent_9px),radial-gradient(circle_at_0%_100%,transparent_0,transparent_8px,var(--b2)_8px,var(--b2)_9px,transparent_9px)] bg-[length:16px_16px]"></div>
                    
                    <!-- Content -->
                    <div class="relative h-full flex flex-col justify-center items-center p-4 text-center">
                        <div class="flex flex-row items-center gap-2 mb-2">
                            <div class="w-10 h-10 md:w-7 md:h-7 rounded-full overflow-hidden border-2 border-base-300 shadow-lg">
                                <img src="${image}" alt="${company} logo" class="w-full h-full object-cover">
                            </div>
                            <h3 class="text-xl md:text-m font-bold text-base-content">${company}</h3>
                        </div>
                        <p class="text-m md:text-xs text-base-content/60 mb-4">${date}</p>
                        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl md:text-6xl opacity-5 ${isRed ? 'text-error' : 'text-base-content'}">${suit}</div>
                        <p class="text-lg md:text-xs text-base-content/80 leading-relaxed max-h-[80%] overflow-y-auto px-2">${description}</p>
                    </div>
                </div>
            </div>
        `;

        // Apply desktop-specific styles
        if (window.innerWidth >= 768) {
            this.style.translate = `${translateX}px, ${translateY}px`;
            this.style.rotate = `${rotation}deg`;
            this.style.zIndex = parseInt(delay) / 100;
        }
    }
}

// Register the component
if (!customElements.get('job-card')) {
    customElements.define('job-card', JobCard);
}
