const fs = require('fs');
const https = require('https');

if (!fs.existsSync('public')) {
    fs.mkdirSync('public');
}
if (!fs.existsSync('public/topojson')) {
    fs.mkdirSync('public/topojson');
}

const url = 'https://raw.githubusercontent.com/deldersveld/topojson/master/countries/thailand/thailand-provinces.json';

const file = fs.createWriteStream('public/topojson/thailand-provinces.topojson');
https.get(url, function (res) {
    res.pipe(file);
    res.on('end', () => console.log('File successfully written!'));
}).on('error', (e) => {
    console.error(e);
});
