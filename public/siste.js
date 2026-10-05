const bilete = document.getElementById('bilete');
const tidspunkt = document.getElementById('tidspunkt');
const relativ = document.getElementById('relativ');
const absolutt = document.getElementById('absolutt');

const sprak = ['nn', 'nb', 'no'];
const absoluttFormat = new Intl.DateTimeFormat(sprak, { dateStyle: 'full', timeStyle: 'short' });
const relativFormat = new Intl.RelativeTimeFormat(sprak, { numeric: 'auto' });

// Lengda på kvar eining i sekund, frå største til minste
const einingar = [
    ['year', 365 * 24 * 3600],
    ['month', 30 * 24 * 3600],
    ['week', 7 * 24 * 3600],
    ['day', 24 * 3600],
    ['hour', 3600],
    ['minute', 60],
];

// Gir til dømes "for 3 timar sidan" eller "i går"
function relativTid(dato) {
    const sekund = (dato - Date.now()) / 1000;
    for (const [eining, lengd] of einingar) {
        if (Math.abs(sekund) >= lengd) {
            return relativFormat.format(Math.round(sekund / lengd), eining);
        }
    }
    return 'akkurat no';
}

function visTid() {
    const dato = new Date(tidspunkt.dateTime);
    relativ.textContent = relativTid(dato);
    absolutt.textContent = absoluttFormat.format(dato);
}

// Spør serveren om det har kome eit nytt bilete, og byter det inn utan å laste sida på nytt
async function sjekkNyttBilete() {
    try {
        const svar = await fetch('/api/siste', { cache: 'no-store' });
        if (!svar.ok) return;

        const siste = await svar.json();
        if (siste.tid === tidspunkt.dateTime) return;

        // Last ned det nye biletet i bakgrunnen først, så det ikkje blinkar
        const nytt = new Image();
        nytt.src = siste.src;
        await nytt.decode();

        bilete.classList.add('skjult');
        setTimeout(() => {
            bilete.src = siste.src;
            tidspunkt.dateTime = siste.tid;
            visTid();
            bilete.classList.remove('skjult');
        }, 400);
    } catch {
        // Ingen nettverk akkurat no; vi prøver igjen neste gong
    }
}

visTid();
setInterval(visTid, 30 * 1000);
setInterval(sjekkNyttBilete, 60 * 1000);

// Oppdater med ein gong når nokon kjem tilbake til fana
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        visTid();
        sjekkNyttBilete();
    }
});
