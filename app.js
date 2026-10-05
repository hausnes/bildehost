const express = require('express');
const path = require('path');
const fs = require('fs/promises');

const app = express();
const port = 3000;
const imagesDir = path.join(__dirname, 'bileter');
const thumbsDir = path.join(imagesDir, 'thumbs');
const tidssone = 'Europe/Oslo';

const formatTid = new Intl.DateTimeFormat('nn-NO', { dateStyle: 'full', timeStyle: 'short', timeZone: tidssone });
const formatKortTid = new Intl.DateTimeFormat('nn-NO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: tidssone });
const formatManad = new Intl.DateTimeFormat('nn-NO', { month: 'long', year: 'numeric', timeZone: tidssone });
const formatManadId = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', timeZone: tidssone }); // Gir "2026-10"

// Bileta har unike filnamn og blir ikkje endra, så nettlesaren kan cache dei lenge
app.use('/bileter', express.static(imagesDir, { maxAge: '30d' }));

// Serverer statiske filer frå public-mappa
app.use(express.static(path.join(__dirname, 'public')));

// Hentar alle bileta i mappa, sortert med det nyaste først
async function hentBileter() {
    const filer = (await fs.readdir(imagesDir)).filter(fil => /\.(jpg|jpeg|png|gif)$/i.test(fil));
    const miniatyrar = new Set(await fs.readdir(thumbsDir).catch(() => []));

    const bileter = await Promise.all(filer.map(async fil => {
        const { mtime } = await fs.stat(path.join(imagesDir, fil));
        const src = `/bileter/${encodeURIComponent(fil)}`;
        return {
            tid: mtime,
            src,
            // Manglar miniatyren, viser vi heile biletet i staden
            miniatyr: miniatyrar.has(fil) ? `/bileter/thumbs/${encodeURIComponent(fil)}` : src,
        };
    }));

    return bileter.sort((a, b) => b.tid - a.tid);
}

// Les ein HTML-mal frå public-mappa og byter ut {{NAMN}} med verdiane
async function fyllMal(fil, verdiar) {
    const mal = await fs.readFile(path.join(__dirname, 'public', fil), 'utf8');
    return mal.replace(/\{\{(\w+)\}\}/g, (_, namn) => verdiar[namn] ?? '');
}

const storForbokstav = tekst => tekst.charAt(0).toUpperCase() + tekst.slice(1);

// Ruta som viser det siste biletet i mappa
app.get('/', async (req, res) => {
    try {
        const [siste] = await hentBileter();
        if (!siste) {
            return res.status(404).send('Fann ingen bileter');
        }

        res.send(await fyllMal('siste.html', {
            IMAGE_SRC: siste.src,
            IMAGE_ISO: siste.tid.toISOString(),
            IMAGE_TIME: formatTid.format(siste.tid),
        }));
    } catch (err) {
        console.error(err);
        res.status(500).send('Noko gjekk gale ved henting av bileta');
    }
});

// Brukt av siste.html for å sjekke om det har kome eit nytt bilete
app.get('/api/siste', async (req, res) => {
    try {
        const [siste] = await hentBileter();
        if (!siste) {
            return res.status(404).json({ feil: 'Fann ingen bileter' });
        }

        res.set('Cache-Control', 'no-store');
        res.json({ src: siste.src, tid: siste.tid.toISOString() });
    } catch (err) {
        console.error(err);
        res.status(500).json({ feil: 'Noko gjekk gale ved henting av bileta' });
    }
});

// Ruta som viser alle bileta i mappa, gruppert per månad
app.get('/alle', async (req, res) => {
    try {
        const bileter = await hentBileter();
        if (bileter.length === 0) {
            return res.status(404).send('Fann ingen bileter');
        }

        // Bileta er sorterte med det nyaste først, så månadene kjem i rett rekkjefølgje
        const manadar = new Map();
        for (const bilete of bileter) {
            const id = formatManadId.format(bilete.tid);
            if (!manadar.has(id)) {
                manadar.set(id, { namn: storForbokstav(formatManad.format(bilete.tid)), bileter: [] });
            }
            manadar.get(id).bileter.push(bilete);
        }

        const manadslenker = [...manadar].map(([id, manad]) =>
            `<a href="#manad-${id}">${manad.namn}</a>`
        ).join('');

        const galleri = [...manadar].map(([id, manad]) => {
            const bileteTags = manad.bileter.map(bilete => `
                <a class="bilete" href="${bilete.src}">
                    <img src="${bilete.miniatyr}" alt="Bilete tatt ${formatTid.format(bilete.tid)}" loading="lazy" decoding="async" width="480" height="270">
                    <span>${formatKortTid.format(bilete.tid)}</span>
                </a>`).join('');

            return `
            <section id="manad-${id}">
                <h2>${manad.namn} <small>${manad.bileter.length} bileter</small></h2>
                <div class="galleri">${bileteTags}</div>
            </section>`;
        }).join('');

        res.send(await fyllMal('alle.html', {
            MONTH_LINKS: manadslenker,
            IMAGE_GALLERY: galleri,
        }));
    } catch (err) {
        console.error(err);
        res.status(500).send('Noko gjekk gale ved henting av bileta');
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
