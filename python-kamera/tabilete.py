from picamera2 import Picamera2, Preview
import time
from datetime import datetime

picam2 = Picamera2()
camera_config = picam2.create_still_configuration(main={"size": (1920, 1080)}, lores={"size": (640, 480)}, display="lores")
picam2.configure(camera_config)

picam2.start_preview(Preview.NULL) # Typisk QTGL i staden for NULL. NULL gjer at ingenting vises. Les meir i manualen på 3.2.4: https://datasheets.raspberrypi.com/camera/picamera2-manual.pdf
picam2.start()
time.sleep(2)
filnavn = str(datetime.now()) + ".jpg"
#print(filnavn) # For testing
picam2.capture_file("/home/pi/hausnes/bilethost/bileter/" + filnavn) # Endre til riktig sti (og filnavn) for ditt prosjekt

# Legg til at denne fila skal køyre kvart minutt ved å skrive "crontab -e" i terminalen, og typisk velgje nano som editor.
# Deretter legg du inn denne linja nederst, på ny linje: * * * * * sudo python3 /home/pi/hausnes/kamera-tidspunkt.py
# Les meir om korleis du kan få programmet til å køyre på andre tidspunkt på https://crontab.guru/