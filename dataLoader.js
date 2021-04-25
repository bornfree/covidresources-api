const axios = require('axios');
const XLSX = require('xlsx');
const _ = require('lodash');
const fs = require('fs');
require('dotenv').config();

function processData() {

    console.log("Processing...");

    let wb = XLSX.readFile("./public/data_master.xlsx");
    
    // Don't pick up crowdsourced sheet
    let sheetNames = _.reject(wb.SheetNames, name => {
        return ["Crowdsourced", "Template"].includes(name.trim());
    });

    let data = _.map(sheetNames, name => {
        return {
            location: name,
            results: XLSX.utils.sheet_to_json(wb.Sheets[name], {raw: false})
        }
    });
    
    let newData = {};
    _.each(data, item => {


        if (! newData.hasOwnProperty(item.location)) {
            newData[item.location] = [];
        }

        _.each(item.results, row => {

            if(! row['Resource'])
                return;

            if (row['Resource'].trim().length < 1)
                return;


            let newResult = {
                id: row['ID'],
                category: row['Resource'] || '',
                name: row['Contact Name'] || '',
                description: row['Detail'] || '',
                contact: row['Contact'] || '',
                verified: true,
                stock: '',
                createdAt: row['Created at'],
                lastVerified: row['Last verified']
            };

            newData[item.location].push(newResult);
        });

        

    });


    fs.writeFileSync('./public/data_master.json', JSON.stringify(newData, null, 2) , 'utf-8');
    console.log('Downloaded to ./public/data_master.json');


}

function download(){

    console.log("Downloading Master Google Sheet...");

    axios({
            url: process.env.GOOGLE_SHEET_MASTER_URL,
            method: 'GET',
            responseType: 'stream'
        })
        .then(res => {
            res.data
                .pipe(fs.createWriteStream("./public/data_master.xlsx"))
                .on('finish', processData);
        })
        .catch(err => {
            console.error(err);
        })
}

module.exports = download;

