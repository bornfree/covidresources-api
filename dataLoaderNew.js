const axios = require('axios');
const XLSX = require('xlsx');
const _ = require('lodash');
const fs = require('fs');
require('dotenv').config();

function processData() {

    console.log("Processing...");

    let wb = XLSX.readFile("./public/data.xlsx");

    let data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
    
    let newData = {};
    _.each(data, row => {

        let location = row['City/Town'];
        if(!location || location.trim().length < 1)
            return;

        if (! newData.hasOwnProperty(location)) {
            newData[location] = [];
        }

        let newResult = {
            id: Math.floor(Math.random()*1e12).toString(36),
            category: row['What is the lead for?'] || '',
            name: row['Contact Name'] || '',
            description: row['Details (Medicine Name, Bed with or w/o oxygen, Hospital name, Blood group etc)'] || '',
            contact: row['Contact Number'] || '',
            verified: row['Verified by Team'],
            createdAt: row['Timestamp'],
            lastVerified: row['Verification Time Stamp']
        };

        newResult.description += (" " + (row['Locality/ Address'] || '' ));

        if ( newResult.verified && newResult.verified.toLowerCase().includes("yes")) {
            newResult.verified = true;
            newData[location].push(newResult);
        }
        

    });


    console.log("Merging master data");
    let masterData = JSON.parse(fs.readFileSync("./public/data_master.json"));

    let allLocations = _.uniq( [...Object.keys(masterData), ...Object.keys(newData)] );

    _.each(allLocations, location => {

        let masterResults = masterData[location] || [];
        let newResults = newData[location] || [];

        masterData[location] = [...masterResults, ...newResults];

    });

    
    fs.writeFileSync('./public/data.json', JSON.stringify(masterData, null, 2) , 'utf-8');
    console.log('Downloaded to ./public/data.json');


}

function download(){

    console.log("Downloading Lead Form Google Sheet...");

    axios({
            url: process.env.GOOGLE_SHEET_URL,
            method: 'GET',
            responseType: 'stream'
        })
        .then(res => {
            res.data
                .pipe(fs.createWriteStream("./public/data.xlsx"))
                .on('finish', processData);
        })
        .catch(err => {
            console.error(err);
        })
}

module.exports = download;

