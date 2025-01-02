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

### Gjer Node JS-serveren tilgjengeleg

Ynskjer du at du kan sjå bileta frå kor som helst i verda? Då er det relativt enkelt å nytte ein dynamisk DNS-tjeneste.
Denne blir brukt for å gjere sida lettare tilgjengeleg for omverda, sidan ein ikkje må vite IP-adressa. Eg nyttar [Duck DNS](https://www.duckdns.org/). 
Denne fungerer slik at ein får ein URL som er lettare å hugse enn ei IP-adresse. DuckDNS oppdaterer IP-adressa til Raspberry PI-en automatisk, slik at ein alltid kan nå sida via URL-en.

1. Lag ei mappe `mkdir duckdns`, og ei fil inne i denne `nano duck.sh`
2. Lim inn instruksjonen frå Duck DNS, som og inneheld din unike URL og token. NB: Hemmeleg!
3. Gjer fila mogleg å køyre: `chmod 700 duck.sh`
4. Test scriptet: `./duck.sh`. Sjekk status: Får du `OK` er alt OK, om det står `KO` er det berre å gje opp. Du kan òg sjekke ved å skrive `cat duck.log`.
5. Legg scriptet til i crontab: `crontab -e`
    - `*/5 * * * * ~/duckdns/duck.sh >/dev/null 2>&1 ` (Quiz: Kor ofte køyrer denne?)
6. Opne routeren din sine innstillingar og slepp gjennom trafikk til porten som applikasjonen køyrer på. I mitt tilfelle kan eg no besøke [hausnes.duckdns.org:3000](http://hausnes.duckdns.org:3000/).

## To-do:
- Betre visning av bileter, både på hovedruta og /alle-ruta.