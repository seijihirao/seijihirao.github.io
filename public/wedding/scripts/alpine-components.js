document.addEventListener('alpine:init', () => {
    // Main app component
    Alpine.data('weddingApp', () => ({
        envelopeOpen: false,
        flippedCard: null,
        
        init() {
            this.$watch('envelopeOpen', (value) => {
                if (value) {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    window.startMusic();
                    document.getElementById('tsparticles-celebration').classList.add('visible');
                }
            });
        },

        toggleCard(cardId) {
            this.flippedCard = this.flippedCard === cardId ? null : cardId;
        }
    }));
    
    const getRandomRotation = () => Math.floor(Math.random() * 21) - 10; // Random number between -10 and 10

    // Photo section component
    Alpine.data('photoSection', () => ({
        photos: [
            { src: 'assets/together-1.jpg' },
            { src: 'assets/together-2.jpg' },
            { src: 'assets/together-3.jpg' },
            { src: 'assets/together-4.jpg' },
            { src: 'assets/together-5.jpg' },
            { src: 'assets/together-6.jpg' },
            { src: 'assets/together-7.jpg' },
            { src: 'assets/together-8.jpg' }
        ].map(photo => ({
            ...photo,
            rotation: getRandomRotation()
        }))
    }));

    // Trip photos component
    Alpine.data('tripPhotos', () => ({
        trips: [
            { id: 'barcelona', src: 'assets/trip-barcelona.webp', city: 'Barcelona', country: 'es', top: '55%', left: '25%' },
            { id: 'munich', src: 'assets/trip-munich.jpg', city: 'Munique', country: 'de', top: '35%', left: '55%' },
            { id: 'prague', src: 'assets/trip-prague.jpg', city: 'Praga', country: 'cz', top: '30%', left: '60%' },
            { id: 'lisbon', src: 'assets/trip-lisbon.webp', city: 'Lisboa', country: 'pt', top: '60%', left: '15%' },
            { id: 'venice', src: 'assets/trip-venice.webp', city: 'Veneza', country: 'it', top: '50%', left: '45%' },
            { id: 'england', src: 'assets/trip-england.jpg', city: 'Londres', country: 'gb', top: '10%', left: '35%' },
            { id: 'lucerne', src: 'assets/trip-lucerne.jpg', city: 'Lucerna', country: 'ch', top: '35%', left: '50%' },
            { id: 'lucerne2', src: 'assets/trip-lucerne2.jpg', city: 'Lucerna', country: 'ch', top: '38%', left: '52%' },
            { id: 'prague2', src: 'assets/trip-prague2.jpg', city: 'Praga', country: 'cz', top: '33%', left: '62%' },
            { id: 'lisbon2', src: 'assets/trip-lisbon-2.jpg', city: 'Lisboa', country: 'pt', top: '63%', left: '17%' }
        ].map(trip => ({
            ...trip,
            rotation: getRandomRotation()
        }))
    }));
}); 