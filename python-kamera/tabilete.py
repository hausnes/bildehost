from picamera2 import Picamera2, Preview
import time
from datetime import datetime
from pathlib import Path

# Bileta blir lagra i bileter-mappa i prosjektet, uansett kvar prosjektet ligg
BILETMAPPE = Path(__file__).resolve().parent.parent / "bileter"

picam2 = Picamera2()
camera_config = picam2.create_still_configuration(main={"size": (3280, 2464)}, lores={"size": (640, 480)}, display="lores")
picam2.configure(camera_config)

picam2.start_preview(Preview.NULL) # Typisk QTGL i staden for NULL. NULL gjer at ingenting vises. Les meir i manualen på 3.2.4: https://datasheets.raspberrypi.com/camera/picamera2-manual.pdf
picam2.start()
time.sleep(2)
filnavn = str(datetime.now()) + ".jpg"
#print(filnavn) # For testing
picam2.capture_file(str(BILETMAPPE / filnavn))

# Legg til at denne fila skal køyre så ofte du ynskjer ved å skrive "crontab -e" i terminalen, og typisk velgje nano som editor.
# Deretter legg du inn denne linja nederst, på ny linje (tek bilete kl. 9, 12 og 16, og lagar miniatyrbilete etterpå):
# 0 9,12,16 * * * python3 /home/hausnes/bildehost/bildehost/python-kamera/tabilete.py && python3 /home/hausnes/bildehost/bildehost/python-kamera/lag_miniatyrar.py
# NB: Les meir om korleis du kan få programmet til å køyre på andre tidspunkt på https://crontab.guru/ (5 stjerner betyr kvart minutt)