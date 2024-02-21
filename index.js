const http = require('http');
const https = require('https');
const express = require('express');
const path = require('path');
const app = express();
const sql = require('sqlite3');
const db = new sql.Database('fruen.db');
const basicAuth = require('express-basic-auth');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const fs = require('fs')
// SSL certs;
const privateKey = fs.readFileSync('path', 'utf8');
const certificate = fs.readFileSync('path', 'utf8');
const credentials = {
	key: privateKey,
	cert: certificate,
};

const hserver = http.createServer(app);
const server = https.createServer(credentials, app);

app.use((req, res, next) => {
    if (req.protocol === 'http') {
        return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }

    next();
});

// admin logins
const adminAuth = basicAuth({
    users: { 'admin': 'pass' },
    challenge: true,
    unauthorizedResponse: 'Unauthorized'
});

function updateData(){
    return new Promise((resolve, reject) => {
        let arr = [];
        db.each("SELECT * FROM noder ORDER BY skuffe, journalnr", (err, row) => {
            if(err){
                console.log(err);
                reject(err);
                return;
            }
            arr.push(row);
        }, () => {
            console.log("updated");
            resolve(arr);
        });
    });
}

app.set('views', path.join(__dirname, '/views'));
app.engine('html', require('ejs').renderFile);
app.use(express.static(__dirname + '/public', {
    extensions: ['html']
}));

app.get("/vorfrue", async function(request, response){
    let data = await updateData();
    response.render("vfarkiv.html", {data} );
});

app.post("/mark", function (request, response){
    const markID = Number(request.body.id);
    db.get("SELECT ude FROM noder WHERE id = ?", [markID], (err, row) => {
        if (err) {
            console.error(err);
            response.status(500).send("Internal Server Error");
            return;
        }
        const newude = (row.ude === 1) ? 0: 1;
        db.run("UPDATE noder SET ude = ? WHERE id = ?", [newude, markID], async (newerr) => {
            if (newerr) {
                console.error(err);
                response.status(500).send("Internal Server Error");
                return;
            }
            response.status(200).json({ude: newude, id: markID});
        });
    });
})

app.post("/del", function (request, response){
    const markID = Number(request.body.id);
    db.get("SELECT ude FROM noder WHERE id = ?", [markID], (err, row) => {
        if (err) {
            console.error(err);
            response.status(500).send("Internal Server Error");
            return;
        }
        db.run("DELETE FROM noder WHERE id = ?", [markID], async (newerr) => {
            if (newerr) {
                console.error(err);
                response.status(500).send("Internal Server Error");
                return;
            }
            response.sendStatus(200);
        });
    });
})

app.get("/edit", adminAuth, async function (request, response) {
    let data = await updateData();
    const itemId = Number(request.query.id);
    const item = data[data.findIndex(e => e.id === itemId)];
    if (!item) {
        response.sendStatus(404); // Item not found
        return;
    }
    response.render("vfedit.html", {item});
});

app.post("/edit", adminAuth, async function (request, response) {
    let data = request.body;
    db.run("UPDATE noder SET skuffe = ?, journalnr = ?, stemmer = ?, komponist = ?, titel = ? WHERE id = ?", [data.skuffe, data.journalnr, data.stemmer, data.komponist, data.titel, data.id], async (newerr) => {
        if (newerr) {
            console.error(err);
            response.status(500).send("Internal Server Error");
            return;
        }
        response.status(200).redirect('/admin');
    });
});

app.get("/add", adminAuth, async function (request, response) {
    response.render("vfadd.html");
});

app.post("/add", adminAuth, async function (request, response) {
    let data = request.body;
    db.run("INSERT INTO noder (skuffe, journalnr, stemmer, komponist, titel) VALUES (?, ?, ?, ?, ?)", [data.skuffe, data.journalnr, data.stemmer, data.komponist, data.titel], async (newerr) => {
        if (newerr) {
            console.error(err);
            response.status(500).send("Internal Server Error");
            return;
        }
        response.status(200).redirect('/admin');
    });
});

app.get("/admin", adminAuth, async function(request, response) {
    let data = await updateData();
    response.render("arkivadmin.html", {data});
});

/*app.get('*', function(req, res){
    res.sendStatus(404);
});*/

hserver.listen(80, () => {
    console.log("http on 80");
})

const PORT = 443;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
