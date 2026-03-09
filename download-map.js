const fs = require('fs');
const https = require('https');

const dir = 'public/topojson';
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

const file = fs.createWriteStream(`${dir}/thailand-provinces.topojson`);
https.get('https://raw.githubusercontent.com/deldersveld/topojson/master/countries/thailand/thailand-provinces.json', function (response) {
    response.pipe(file);
    file.on('finish', () => {
        file.close();
        console.log('Download complete.');
    });
}).on('error', (err) => {
    fs.unlink(`${dir}/thailand-provinces.topojson`);
    console.error('Error:', err.message);
});
