document.addEventListener('alpine:init', () => {
    function loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }

    Alpine.magic('screenshot', (el) => {
        return async function() {
            const component = Alpine.$data(el);
            component.capturing = true;
            await Alpine.nextTick();

            try {
                const postcard = el.closest('.postcard');
                const rect = postcard.getBoundingClientRect();
                const scale = 2;
                const w = rect.width * scale;
                const h = rect.height * scale;

                const canvas = document.createElement('canvas');
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d');
                ctx.scale(scale, scale);

                // Background color
                ctx.fillStyle = '#f5f3ed';
                ctx.fillRect(0, 0, rect.width, rect.height);

                // Draw aquarela background
                try {
                    const aquarela = await loadImage('assets/aquarela.png');
                    const aw = aquarela.naturalWidth;
                    const ah = aquarela.naturalHeight;
                    // contain: fit inside rect keeping aspect ratio, centered at bottom
                    const aratio = aw / ah;
                    const rratio = rect.width / rect.height;
                    let dw, dh;
                    if (aratio > rratio) {
                        dw = rect.width;
                        dh = rect.width / aratio;
                    } else {
                        dh = rect.height;
                        dw = rect.height * aratio;
                    }
                    const dx = (rect.width - dw) / 2;
                    const dy = rect.height - dh; // center bottom
                    ctx.globalAlpha = 1;
                    ctx.drawImage(aquarela, dx, dy, dw, dh);
                } catch(e) { /* skip if fails */ }

                // Semi-transparent overlay (matches the CSS gradient)
                const grad = ctx.createLinearGradient(0, 0, rect.width, rect.height);
                grad.addColorStop(0, 'rgba(254,254,254,0.85)');
                grad.addColorStop(0.5, 'rgba(250,248,245,0.8)');
                grad.addColorStop(1, 'rgba(245,243,237,0.85)');
                ctx.globalAlpha = 1;
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, rect.width, rect.height);

                // Outer border (simulates box-shadow edge)
                ctx.strokeStyle = 'rgba(0,0,0,0.12)';
                ctx.lineWidth = 1;
                ctx.strokeRect(0.5, 0.5, rect.width - 1, rect.height - 1);

                // Inner border (matches ::before)
                ctx.strokeStyle = 'rgba(0,0,0,0.06)';
                ctx.lineWidth = 1;
                ctx.strokeRect(8, 8, rect.width - 16, rect.height - 16);

                // Draw all SVG elements (stamp + postmark) by serializing to images
                async function drawSvgElement(svgEl, container) {
                    const cr = container.getBoundingClientRect();
                    const ox = cr.left - rect.left;
                    const oy = cr.top - rect.top;

                    const clone = svgEl.cloneNode(true);
                    const images = clone.querySelectorAll('image');
                    for (const img of images) {
                        const href = img.getAttribute('href');
                        if (href) {
                            try {
                                const loaded = await loadImage(href);
                                const c = document.createElement('canvas');
                                c.width = loaded.naturalWidth;
                                c.height = loaded.naturalHeight;
                                c.getContext('2d').drawImage(loaded, 0, 0);
                                img.setAttribute('href', c.toDataURL('image/png'));
                            } catch(e) { /* skip */ }
                        }
                    }

                    const svgData = new XMLSerializer().serializeToString(clone);
                    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
                    const url = URL.createObjectURL(svgBlob);
                    try {
                        const svgImg = await loadImage(url);
                        const rotation = container.style.transform || getComputedStyle(container).transform;
                        ctx.save();
                        ctx.translate(ox + cr.width / 2, oy + cr.height / 2);
                        // Extract rotation from computed style
                        const match = rotation.match(/rotate\(([^)]+)\)/);
                        if (match) {
                            const deg = parseFloat(match[1]);
                            ctx.rotate(deg * Math.PI / 180);
                        } else {
                            // Parse matrix transform for rotation
                            const matMatch = rotation.match(/matrix\(([^)]+)\)/);
                            if (matMatch) {
                                const vals = matMatch[1].split(',').map(Number);
                                const angle = Math.atan2(vals[1], vals[0]);
                                ctx.rotate(angle);
                            }
                        }
                        ctx.drawImage(svgImg, -cr.width / 2, -cr.height / 2, cr.width, cr.height);
                        ctx.restore();
                    } finally {
                        URL.revokeObjectURL(url);
                    }
                }

                // Draw stamp SVG
                const stampDiv = postcard.querySelector('.stamp');
                if (stampDiv) {
                    const stampSvg = stampDiv.querySelector('svg');
                    if (stampSvg) await drawSvgElement(stampSvg, stampDiv);
                }

                // Draw postmark (img element)
                const postmarkImg = postcard.querySelector('img[src*="postmark"]');
                if (postmarkImg) {
                    const pmDiv = postmarkImg.closest('div');
                    const pmr = pmDiv.getBoundingClientRect();
                    const pmx = pmr.left - rect.left;
                    const pmy = pmr.top - rect.top;
                    try {
                        const pmLoaded = await loadImage(postmarkImg.src);
                        ctx.save();
                        ctx.translate(pmx + pmr.width / 2, pmy + pmr.height / 2);
                        ctx.rotate(-15 * Math.PI / 180);
                        ctx.drawImage(pmLoaded, -pmr.width / 2, -pmr.height / 2, pmr.width, pmr.height);
                        ctx.restore();
                    } catch(e) { /* skip */ }
                }

                // Draw monogram using mask technique on a temp canvas
                try {
                    const monoImg = await loadImage('assets/monograma.png');
                    const monoEl = postcard.querySelector('[aria-label="F & S Monogram"]');
                    const mr = monoEl.getBoundingClientRect();
                    const mx = mr.left - rect.left;
                    const my = mr.top - rect.top;

                    const tmpCanvas = document.createElement('canvas');
                    tmpCanvas.width = mr.width * scale;
                    tmpCanvas.height = mr.height * scale;
                    const tmpCtx = tmpCanvas.getContext('2d');
                    tmpCtx.scale(scale, scale);
                    // Draw the monogram image preserving aspect ratio (contain)
                    const imgRatio = monoImg.naturalWidth / monoImg.naturalHeight;
                    const elRatio = mr.width / mr.height;
                    let mw, mh, mox, moy;
                    if (imgRatio > elRatio) {
                        mw = mr.width;
                        mh = mr.width / imgRatio;
                        mox = 0;
                        moy = (mr.height - mh) / 2;
                    } else {
                        mh = mr.height;
                        mw = mr.height * imgRatio;
                        mox = (mr.width - mw) / 2;
                        moy = 0;
                    }
                    tmpCtx.drawImage(monoImg, mox, moy, mw, mh);
                    // Apply color using source-in composite
                    tmpCtx.globalCompositeOperation = 'source-in';
                    tmpCtx.fillStyle = '#c45a42';
                    tmpCtx.fillRect(0, 0, mr.width, mr.height);

                    ctx.drawImage(tmpCanvas, 0, 0, tmpCanvas.width, tmpCanvas.height, mx, my, mr.width, mr.height);
                } catch(e) { /* skip if fails */ }

                // Draw all visible text content
                const allText = postcard.querySelectorAll(':scope > div:not(.stamp):not([x-show]) p');
                if (allText.length) {
                    allText.forEach(textEl => {
                        const computed = getComputedStyle(textEl);
                        const tr = textEl.getBoundingClientRect();
                        const tx = tr.left - rect.left + tr.width / 2;
                        const ty = tr.top - rect.top;

                        ctx.textAlign = 'center';
                        ctx.fillStyle = computed.color;
                        const fontSize = parseFloat(computed.fontSize);
                        const fontWeight = computed.fontWeight;
                        const fontFamily = computed.fontFamily;
                        const fontStyle = computed.fontStyle === 'italic' ? 'italic ' : '';
                        ctx.font = `${fontStyle}${fontWeight} ${fontSize}px ${fontFamily}`;

                        if (computed.textTransform === 'uppercase') {
                            ctx.letterSpacing = computed.letterSpacing;
                        }

                        const lines = textEl.innerHTML.split(/<br\s*\/?>/i);
                        if (lines.length > 1) {
                            const lineHeight = parseFloat(computed.lineHeight) || fontSize * 1.5;
                            lines.forEach((line, i) => {
                                ctx.fillText(line.trim(), tx, ty + fontSize + (i * lineHeight));
                            });
                        } else {
                            ctx.fillText(textEl.textContent.trim(), tx, ty + fontSize);
                        }
                    });
                }

                // Download
                const dataUrl = canvas.toDataURL('image/png');
                const a = document.createElement('a');
                a.href = dataUrl;
                a.download = 'save-the-date-fla-seiji.png';
                a.click();
            } catch (err) {
                console.error('Screenshot failed:', err);
            } finally {
                component.capturing = false;
            }
        };
    });
});
