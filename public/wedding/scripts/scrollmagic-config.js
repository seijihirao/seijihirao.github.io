document.addEventListener('DOMContentLoaded', function() {
    // Initialize ScrollMagic
    const controller = new ScrollMagic.Controller();

    // Individual photos animation
    const individualPhotosTl = gsap.timeline();
    individualPhotosTl
        .to('.photo-container', {
            duration: 1,
            opacity: 1,
            x: 0,
            ease: "power2.out"
        });

    new ScrollMagic.Scene({
        triggerElement: '.scene:nth-child(2)',
        triggerHook: 0,
        duration: '100%'
    })
    .setPin('.scene:nth-child(2)')
    .setTween(individualPhotosTl)
    .addTo(controller);

    // Together photos animation
    const togetherPhotosTl = gsap.timeline();
    togetherPhotosTl
        .to('.together-photos', {
            duration: 1,
            opacity: 1,
            scale: 1,
            ease: "back.out(1.7)"
        });

    new ScrollMagic.Scene({
        triggerElement: '.scene:nth-child(3)',
        triggerHook: 0,
        duration: '100%'
    })
    .setPin('.scene:nth-child(3)')
    .setTween(togetherPhotosTl)
    .addTo(controller);

    // Trip photos animation
    const tripPhotosTl = gsap.timeline();
    tripPhotosTl
        .to('#trip-photos', {
            duration: 1.5,
            opacity: 1,
            scale: 1,
            ease: "elastic.out(1, 0.3)"
        })
        .from('.flip-card', {
            duration: 0.8,
            scale: 0,
            rotation: 0,
            opacity: 0,
            stagger: 0.1,
            ease: "back.out(1.7)"
        }, "-=1");

    new ScrollMagic.Scene({
        triggerElement: '.scene:nth-child(4)',
        triggerHook: 0,
        duration: '100%'
    })
    .setPin('.scene:nth-child(4)')
    .setTween(tripPhotosTl)
    .addTo(controller);

    // Marriage photos animation
    const marriagePhotosTl = gsap.timeline();
    marriagePhotosTl
        .to('.marriage-photos', {
            duration: 1,
            opacity: 1,
            scale: 1,
            ease: "back.out(1.7)"
        });

    new ScrollMagic.Scene({
        triggerElement: '.scene:nth-child(5)',
        triggerHook: 0,
        duration: '100%'
    })
    .setPin('.scene:nth-child(5)')
    .setTween(marriagePhotosTl)
    .addTo(controller);

    // Ring section animation
    const ringSectionTl = gsap.timeline();
    ringSectionTl
        .to('.ring-section', {
            duration: 1,
            opacity: 1,
            scale: 1,
            ease: "power2.out"
        });

    new ScrollMagic.Scene({
        triggerElement: '.scene:nth-child(6)',
        triggerHook: 0,
        duration: '100%'
    })
    .setPin('.scene:nth-child(6)')
    .setTween(ringSectionTl)
    .addTo(controller);
}); 