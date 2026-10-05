# Bildehost: Ta bileter og vis dei til verden

Dette er ein samling med kode som har som mål å:
- Kunne ta bileter vha. eit Python-script køyrande på ein Raspberry PI med eit PiCamera. Eg nyttar PiCamera2-biblioteket, som er standard i nyare versjonar av Raspberry PI OS.
- Vise bileta som blir tatt til verden, via ein Node JS-server.

## Innhald

### Python-script

`tabilete.py` (i mappa python-kamera) inneheld kode som tek eit bilete, og lagrar det i mappa bileter. Kvart bilete får eit unikt namn, basert på tidspunktet det blei tatt. Bileta blir lagra som .jpg-filer.

`lag_miniatyrar.py` (i same mappe) lagar små miniatyrbilete (480 × 270 pikslar) av bileta, og lagrar dei i `bileter/thumbs`. Miniatyrane blir brukte på /alle-ruta, slik at sida lastar raskt sjølv med dårleg nett. Bilete som allereie har ein miniatyr blir hoppa over, så scriptet kan trygt køyrast så ofte ein vil. Scriptet nyttar Pillow, som vanlegvis er installert på Raspberry PI OS (om ikkje: `sudo apt install python3-pil`).

#### Lage miniatyrar av bileta du allereie har

Har du bileter frå før, køyrer du scriptet éin gong for hand. Det kan ta eit par minutt om det er mange bileter.

```
python3 /home/hausnes/bildehost/python-kamera/lag_miniatyrar.py
```

#### Ta bileter automatisk

Legg inn denne linja i crontab (`crontab -e`) for å ta bilete kl. 9, 12 og 16, og lage miniatyr rett etterpå:

```
0 9,12,16 * * * python3 /home/hausnes/bildehost/python-kamera/tabilete.py && python3 /home/hausnes/bildehost/python-kamera/lag_miniatyrar.py
```

Endre stiane slik at dei passar der du har lagt prosjektet. Sjå [crontab.guru](https://crontab.guru/) for andre tidspunkt.

### Node JS-server

`app.js` inneheld kode som startar ein Node JS-server, og opnar ei rute til ei mappe med bilete. Her kan ein sjå bilete som er tatt av PiCamera.

- `/` viser det siste biletet i fullskjerm, med tidspunktet oppå biletet (til dømes "For 3 timar sidan" og "måndag 5. oktober 2026 kl. 09:00"). Sida sjekkar kvart minutt om det har kome eit nytt bilete, og byter det inn automatisk utan at du treng å laste sida på nytt.
- `/alle` viser alle bileta, gruppert per månad med det nyaste først. Øvst er det snarvegar til kvar månad. Sida viser miniatyrbileta, og bileta blir først lasta når du scrollar ned til dei (lazy loading). Klikk på eit bilete for å sjå det i full storleik. Manglar eit bilete miniatyr, blir heile biletet vist i staden.
- `/api/siste` gir informasjon om det siste biletet som JSON. Denne blir brukt av `/` for å sjå etter nye bilete.

Bileta har unike filnamn, så nettlesaren får beskjed om å cache dei i 30 dagar. Då treng ikkje bilete du har sett før å bli lasta ned på nytt.

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
