const axios = require('axios');
const XLSX = require('xlsx');
const _ = require('lodash');
const fs = require('fs');

let wb = XLSX.readFile("./data.xlsx");
let sheet = wb.Sheets['Data'];

let data = XLSX.utils.sheet_to_json(sheet);

let newData = {};
_.each(data, row => {

    let location = row['Area/City'];
    if (! newData.hasOwnProperty(location)) {
        newData[location] = [];
    }

    let newObject = {
        id: Math.floor(Math.random()*1e16).toString(36),
        category: row['Type of Help'] || '',
        name: row['Point of Contact'] || '',
        description: row['Address/Link'] || '',
        contact: row['Phone'] || ''
    }

    newData[location].push(newObject);

});

fs.writeFileSync('./public/data.json', JSON.stringify(newData, null, 2) , 'utf-8');
console.log('Done');


