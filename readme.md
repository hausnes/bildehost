# Bildehost: Ta bileter og vis dei til verden

Dette er ein samling med kode som har som mål å:
- Kunne ta bileter vha. eit Python-script køyrande på ein Raspberry PI med eit PiCamera. Eg nyttar PiCamera2-biblioteket, som er standard i nyare versjonar av Raspberry PI OS.
- Vise bileta som blir tatt til verden, via ein Node JS-server.

## Innhald

### Python-script

`tabilete.py` (i mappa python-kamera) inneheld kode som tek eit bilete, og lagrar det i mappa bileter. Kvart bilete får eit unikt namn, basert på tidspunktet det blei tatt. Bileta blir lagra som .jpg-filer.

### Node JS-server

`app.js` inneheld kode som startar ein Node JS-server, og opnar ei rute til ei mappe med bilete. Her kan ein sjå bilete som er tatt av PiCamera. Siste bilete er det som blir vist på "hovedruta", medan ruta /alle viser alle bileta som ligg inne.

### Om å automatisk køyre Node JS-serveren på ein headless Raspberry PI

Kjelde: [Bogdan Covrig (Dev.to)](https://dev.to/bogdaaamn/run-your-nodejs-application-on-a-headless-raspberry-pi-4jnn) - her står det grundige forklaringar på kortversjonen under.

1. Installer [PM2](https://github.com/Unitech/pm2). PM2 er, for å sitere folka bak, "[] a production process manager for Node.js applications with a built-in load balancer. It allows you to keep applications alive forever, to reload them without downtime and to facilitate common system admin tasks." Kort oppsummert startar du opp Node JS-serveren vha. PM2, og den køyrer "til evig tid" i bakgrunnen. `sudo npm install -g pm2`
2. Start applikasjonen via PM2. `pm2 start app.js`
3. Sjå til at PM2 blir automatisk starta ved boot, samtidig med applikasjonane som du ynskjer. 
    - `pm2 startup systemd` (returnerer 3 linjer med utskrift)
    - Kopier den siste linja frå kommandoen over og køyr den, eksempelvis `sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u pi --hp /home/pi`
    - `pm2 save`
    - Sjekk status ved til dømes `pm2 list` eller `pm2 show app`

## To-do:
- Betre visning av bileter, både på hovedruta og /alle-ruta.
- Forklare nærare korleis ein dynamisk DNS-tjeneste blir brukt for å gjere sida lettare tilgjengeleg for omverda. Eg nyttar [Duck DNS](https://www.duckdns.org/). Denne fungerer slik at ein får ein URL som er lettare å hugse enn ein IP-adresse. DuckDNS oppdaterer IP-adressa til Raspberry PI-en automatisk, slik at ein alltid kan nå sida via URL-en.