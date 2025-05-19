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

        // Calculate rotation based on delay
        const rotation = -40 + (parseInt(delay) / 50) * 5; // Gradual rotation from -15 to 15 degrees
        const translateY = parseInt(delay) / 20; // Gradual vertical offset
        const translateX = parseInt(delay) / 10; // Add horizontal offset
        this.style.translate = `${translateX}px, ${translateY}px`;
        this.style.rotate = `${rotation}deg`;
        this.style.setProperty('--rotation', `${rotation}deg`);
        this.style.zIndex = parseInt(delay) / 100; // Higher delay = higher z-index

        console.log(translateX, translateY, rotation)
        console.log(`translate(${translateX-20}px, ${translateY-20}px) rotate(0deg`)

        // Add styles for 3D transforms
        const style = document.createElement('style');
        style.textContent = `
            job-card {
                display: block !important;
                position: absolute;
                bottom: 2rem;
                right: 2rem;
                width: 240px;
                height: 360px;
                transform-origin: bottom right;
                transition: all 0.8s ease;
                z-index: 1;
                cursor: pointer;
            }
            job-card:hover:not(.centered) {
                scale: 1.5;
                translateY: 50% !important;
            }
            job-card.centered {
                bottom: 50%;
                right: 50%;
                transform: translate(50%, 50%) scale(1.5) rotate(0deg) !important;
                rotate: 0deg !important;
                z-index: 100;
            }
            .preserve-3d {
                transform-style: preserve-3d;
            }
            .backface-hidden {
                backface-visibility: hidden;
            }
            .rotate-y-180 {
                transform: rotateY(180deg);
            }
            .flipped .front-face {
                transform: rotateY(180deg);
            }
            .flipped .back-face {
                transform: rotateY(0deg);
            }
            .front-face, .back-face {
                transition: transform 0.6s;
                transform-style: preserve-3d;
            }
        `;
        document.head.appendChild(style);

        // Add HTML content
        this.innerHTML = `
            <div class="w-full h-full relative preserve-3d transition-transform duration-600"
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
                    <div class="relative h-full flex flex-col justify-center items-center p-8 text-center">
                        <div class="w-20 h-20 mb-4 rounded-full overflow-hidden border-2 border-base-300 shadow-lg">
                            <img src="${image}" alt="${company} logo" class="w-full h-full object-cover">
                        </div>
                        <h3 class="text-xl font-bold text-base-content mb-2">${company}</h3>
                        <h4 class="text-base text-base-content/80 mb-1">${job}</h4>
                        <p class="text-sm text-base-content/60">${date}</p>
                    </div>
                </div>

                <!-- Back Face -->
                <div class="back-face absolute w-full h-full backface-hidden rounded-2xl overflow-hidden rotate-y-180 bg-base-100 border-2 border-base-300 rounded-2xl">
                    <div class="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_100%_100%,transparent_0,transparent_8px,var(--b2)_8px,var(--b2)_9px,transparent_9px),radial-gradient(circle_at_0%_0%,transparent_0,transparent_8px,var(--b2)_8px,var(--b2)_9px,transparent_9px),radial-gradient(circle_at_100%_0%,transparent_0,transparent_8px,var(--b2)_8px,var(--b2)_9px,transparent_9px),radial-gradient(circle_at_0%_100%,transparent_0,transparent_8px,var(--b2)_8px,var(--b2)_9px,transparent_9px)] bg-[length:16px_16px]"></div>
                    

                    <!-- Content -->
                    <div class="relative h-full flex flex-col justify-center items-center p-2 text-center">
                        <div class="flex flex-row items-center gap-2">
                            <div class="w-7 h-7 rounded-full overflow-hidden border-2 border-base-300 shadow-lg">
                                <img src="${image}" alt="${company} logo" class="w-full h-full object-cover">
                            </div>
                                <h3 class="text-xl font-bold text-base-content">${company}</h3>
                        </div>
                        <p class="text-sm text-base-content/60 mb-4">${date}</p>
                        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl opacity-5 ${isRed ? 'text-error' : 'text-base-content'}">${suit}</div>
                        <p class="text-xs text-base-content/80 leading-relaxed max-h-[80%] overflow-y-auto">${description}</p>
                    </div>
                </div>
            </div>
        `;
    }
}

// Register the component
if (!customElements.get('job-card')) {
    customElements.define('job-card', JobCard);
}