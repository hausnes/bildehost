const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;
const imagesDir = path.join(__dirname, 'bileter');

// Serverer statiske filer frå biletmappa
app.use('/bileter', express.static(imagesDir));

// Serverer statiske filer frå public-mappa
app.use(express.static(path.join(__dirname, 'public')));

// Ruta som viser det siste biletet i mappa
app.get('/', (req, res) => {
    fs.readdir(imagesDir, (err, files) => {
        if (err) {
            return res.status(500).send('Kunne ikkje scanne mappa');
        }

        const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));
        if (imageFiles.length === 0) {
            return res.status(404).send('Fann ingen bileter');
        }

        const latestImage = imageFiles.sort((a, b) => fs.statSync(path.join(imagesDir, b)).mtime - fs.statSync(path.join(imagesDir, a)).mtime)[0];
        const latestImagePath = `/bileter/${latestImage}`;
        const latestImageTime = fs.statSync(path.join(imagesDir, latestImage)).mtime.toLocaleString('no-NO');

        const htmlFilePath = path.join(__dirname, 'public', 'siste.html');

        fs.readFile(htmlFilePath, 'utf8', (err, data) => {
            if (err) {
                return res.status(500).send('Fekk ikkje tilgang til HTML-fila');
            }

            const updatedHtml = data
                .replace('{{IMAGE_SRC}}', latestImagePath)
                .replace('{{IMAGE_TIME}}', latestImageTime);

            res.send(updatedHtml);
        });
    });
});

// Ruta som viser alle bileter i mappa
app.get('/alle', (req, res) => {
    fs.readdir(imagesDir, (err, files) => {
        if (err) {
            return res.status(500).send('Kunne ikkje scanne mappa');
        }

        const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));
        if (imageFiles.length === 0) {
            return res.status(404).send('Fann ingen bileter');
        }

        const imageTags = imageFiles.map(file => {
            const imagePath = `/bileter/${file}`;
            return `<div class="image-container"><img src="${imagePath}" alt="${file}"></div>`;
        }).join('');

        const htmlFilePath = path.join(__dirname, 'public', 'alle.html');

        fs.readFile(htmlFilePath, 'utf8', (err, data) => {
            if (err) {
                return res.status(500).send('Fekk ikkje tilgang til HTML-fila');
            }

            const updatedHtml = data.replace('{{IMAGE_GALLERY}}', imageTags);

            res.send(updatedHtml);
        });
    });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});