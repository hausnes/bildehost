# Bildehost: Ta bileter og vis dei til verden

Dette er ein samling med kode som har som mål å:
- Kunne ta bileter vha. eit Python-script køyrande på ein Raspberry PI med eit PiCamera. Eg nyttar PiCamera2-biblioteket, som er standard i nyare versjonar av Raspberry PI OS.
- Vise bileta som blir tatt til verden, via ein Node JS-server.

## Innhald

### Python-script

`tabilete.py` (i mappa python-kamera) inneheld kode som tek eit bilete, og lagrar det i mappa bileter. Kvart bilete får eit unikt namn, basert på tidspunktet det blei tatt. Bileta blir lagra som .jpg-filer.

### Node JS-server

`app.js` inneheld kode som startar ein Node JS-server, og opnar ei rute til ei mappe med bilete. Her kan ein sjå bilete som er tatt av PiCamera. Siste bilete er det som blir vist.

## To-do:
- Få ruta som viser til ei HTML-side som viser alle bileta i mappa til å fungere. Per no inneheld `alle.html`, `alle.css` og  'alle'-ruta i `app.js` berre testkode.
- Forklare nærare korleis ein dynamisk DNS-tjeneste blir brukt for å gjere sida lettare tilgjengeleg for omverda. Eg nyttar [Duck DNS](https://www.duckdns.org/). Denne fungerer slik at ein får ein URL som er lettare å hugse enn ein IP-adresse. DuckDNS oppdaterer IP-adressa til Raspberry PI-en automatisk, slik at ein alltid kan nå sida via URL-en.