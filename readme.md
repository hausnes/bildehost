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
Lage ei rute som viser til ei side som viser alle bileta i mappa.