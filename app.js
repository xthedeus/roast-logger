const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json({ extended: true }));
const port = 3000;

const adapter = new FileSync('db.json');
const db = low(adapter);

db.defaults({ roasts: [] })
    .write()

app.post('/roasts', (req, res) => {
    console.log('Got body:', req.body);
    res.sendStatus(200);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))