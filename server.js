const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const session = require('express-session');
const crypto = require("crypto");
const port = 3000;

const key = crypto.randomBytes(32).toString("hex");
const app = express();

app.set("view engine", "ejs");
app.set("views");

app.use(
    session({
      secret: key, // Clé secrète utilisée pour signer le cookie de session
      saveUninitialized: false, // Ne pas sauvegarder les sessions non initialisées
      resave: false, // Ne pas réenregistrer la session si elle n'a pas été modifiée
    })
);

app.use((req, res, next) => {
    // Vérifier si le compteur existe dans la session
    if (!req.session.visite) {
      // Initialiser le compteur à 0
    req.session.visite = 0;
    }
    // Incrémenter le compteur
    req.session.visite++;
    next();
});

app.use(bodyParser.urlencoded({ extended: true }));

const connection = mysql.createConnection({
    host: 'localhost', 
    port: 3306,
    user: 'ifragt',
    password: '',
    database: 'sitesql',
});

connection.connect((err) => {
    if(err){
        console.error("Error connecting to Erreur de connexion a la bdd");
        return;
    }
    console.log("Connexion reussi a la base de donnée ");
    
});

app.get("/", (req, res) => {
    console.log("Accès à la route /home");
    res.sendFile("index.html", { root: "public" });
});


app.get("/add", (req, res) => {
    console.log("Accès à la route /INscription");
    res.sendFile("add.html", { root: "public" });
});

app.post('/add', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const Age = req.body.Age;

    const query = 'INSERT INTO utilisateurs (username, mot_de_passe, Age) VALUES (?, ?, ?)';
    


    connection.query(query, [username, password, Age], (err, results) => {
        if (err) {
            console.error("Erreur lors de l'ajout des informations d\'identification :", err);
            res.send("Erreur lors de l'ajout des informations d\'identification :");
            return;
        }

        if (results.length > 0) {
            const visite = req.session.visite;
            console.log(key);
            res.render("index.html", {root : public });
            console.log(`Inscription pour l\'utilisateur ${username}`);
        } else {
            res.send("Bienvenu  sur le site !");
        }
    });
});


app.get("/login", (req, res) => {
    console.log("Accès à la route /login");
    res.sendFile("login.html", { root: "public" });
});


app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const query = 'SELECT * FROM utilisateurs WHERE username = ? AND mot_de_passe = ?';


    connection.query(query, [username, password], (err, results) => {
        if (err) {
            console.error('Erreur lors de la vérification des informations d\'identification :', err);
            res.send('Erreur lors de la vérification des informations d\'identification.');
            return;
        }

        if (results.length > 0) {
            const visite = req.session.visite;
            console.log(key);
            res.render("index_ejs.ejs", { visite });
            console.log(`Connexion réussie pour l\'utilisateur ${username}`);
        } else {
            res.send('Nom d\'utilisateur ou mot de passe incorrect.');
        }
    });
});


app.listen(port, () => {
    console.log(`Serveur en ligne`);
    });
    