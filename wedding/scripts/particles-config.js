const particlesConfig = {
    mask: {
        background: {
            color: {
                value: "#ffffff"
            },
            image: "url('assets/cover.jpg')",
            position: "50% 50%",
            repeat: "no-repeat",
            size: "cover",
            opacity: 1
        },
        backgroundMask: {
            composite: "destination-out",
            cover: {
                opacity: 1,
                color: {
                    value: {
                        r: 255,
                        g: 255,
                        b: 255
                    }
                }
            },
            enable: true
        },
        particles: {
            number: {
                value: 50,
                density: {
                    enable: true,
                    value_area: 800
                }
            },
            color: {
                value: "#FFB6C1"
            },
            shape: {
                type: "circle"
            },
            opacity: {
                value: 0.3,
                random: true
            },
            size: {
                value: 15,
                random: true,
                anim: {
                    enable: true,
                    speed: 2,
                    size_min: 10,
                    sync: false
                }
            },
            move: {
                enable: true,
                speed: 1,
                direction: "none",
                random: true,
                out_mode: "out"
            }
        },
        interactivity: {
            events: {
                onClick: {
                    enable: true,
                    mode: "push"
                },
                onHover: {
                    enable: true,
                    mode: "bubble",
                    parallax: {
                        enable: false,
                        force: 2,
                        smooth: 10
                    }
                },
                resize: true
            },
            modes: {
                bubble: {
                    distance: 400,
                    duration: 2,
                    opacity: 1,
                    size: 100
                },
                push: {
                    quantity: 4
                }
            }
        }
    },
    celebration: {
        particles: {
            number: {
                value: 100,
                density: {
                    enable: true,
                    value_area: 800
                }
            },
            color: {
                value: ["#FF69B4", "#FFB6C1", "#FFC0CB", "#FFE4E1"]
            },
            shape: {
                type: ["circle", "heart"]
            },
            opacity: {
                value: 0.8,
                random: true
            },
            size: {
                value: 5,
                random: true
            },
            move: {
                enable: true,
                speed: 3,
                direction: "top",
                random: true,
                out_mode: "out"
            }
        },
        interactivity: {
            events: {
                onHover: {
                    enable: false
                },
                onClick: {
                    enable: false
                },
                resize: true
            }
        },
        background: {
            color: "transparent"
        }
    }
}; 