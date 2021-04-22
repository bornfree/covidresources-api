### API for covidresources.in

API that reads from Google Sheets, parses and writes a structured JSON for frontend to use.

Typical Express app that can be built and run with:
```
npm install
npm start
```

And `.env` file will be needed with:
```
GOOGLE_SHEET_URL=<GOOGLE SHEET WITH DATA>
```

After server boots, data JSON will be available for frontend at:
```
/data.json
```

