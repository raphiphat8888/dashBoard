const fs = require('fs');
const Papa = require('papaparse');

const csvText = fs.readFileSync('master_economic_data_2566.csv', 'utf8');
const results = Papa.parse(csvText, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
});

console.log("Errors:", results.errors);
console.log("First item:", results.data[0]);
console.log("Has province:", !!results.data[0].province);
