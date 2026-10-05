from pathlib import Path
from PIL import Image

# Lagar miniatyrbilete av alle bileta i biletmappa som ikkje har eit frå før.
# Køyr fila éin gong for å lage miniatyrar av bileta du allereie har, og deretter
# etter kvart nye bilete (sjå readme.md). Bilete som allereie har ein miniatyr blir hoppa over.

BILETMAPPE = Path(__file__).resolve().parent.parent / "bileter"
MINIATYRMAPPE = BILETMAPPE / "thumbs"
STORLEIK = (480, 270)  # Maks breidd og høgd. Forholdet mellom sidene blir behalde.
FILTYPAR = {".jpg", ".jpeg", ".png"}

MINIATYRMAPPE.mkdir(exist_ok=True)

for bilete in sorted(BILETMAPPE.iterdir()):
    if bilete.suffix.lower() not in FILTYPAR:
        continue
    miniatyr = MINIATYRMAPPE / bilete.name
    if miniatyr.exists():
        continue
    try:
        with Image.open(bilete) as img:
            img.thumbnail(STORLEIK)
            img.save(miniatyr, quality=75)
        print("Laga miniatyr:", bilete.name)
    except OSError as feil:
        print("Klarte ikkje å lage miniatyr av", bilete.name, "-", feil)
