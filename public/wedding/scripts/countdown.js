document.addEventListener('alpine:init', () => {
    Alpine.data('countdown', () => ({
        days: 0,
        hours: 0,
        mins: 0,
        secs: 0,

        init() {
            const target = new Date('2026-12-05T00:00:00').getTime();
            const tick = () => {
                const d = target - Date.now();
                if (d < 0) return;
                this.days = Math.floor(d / 86400000);
                this.hours = Math.floor((d % 86400000) / 3600000);
                this.mins = Math.floor((d % 3600000) / 60000);
                this.secs = Math.floor((d % 60000) / 1000);
            };
            tick();
            setInterval(tick, 1000);
        }
    }));
});
