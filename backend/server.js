/* Import dotenv First */
require('dotenv').config();

/* Package Imports */
const { express } = require('express');
const MongoClient = require('./dbClient');

/* DB Client */
const DB = new MongoClient(process.env.DB_CONN);

/* Port */
const PORT = 3000;

/* Middlewares */
const server = express();

/* endpoint list */
/*
    /login: validates user credentials 

*/

server.post('/login', async (req, res) => {

    await DB.becomeConnected();

    // ensure the login request is correctly formatted
    if (!Validator.login(req)) {
        return res.status(400);
    }

    const username = req.body.username;
    const password = req.body.password;

    // Login is a client that gets a user from the database
    const dbUser = await DB.getUser(username);
    
    // catches user not in db
    if (dbUser == null) {
        return res.status(400).json({msg: 'username not in db'});
    }

    // compares the salted + hashed attempt with the stored value
    try {
        if (await DB.comparePasswords(dbUser, password)) {
            return res.status(200);
        } else {
            return res.status(400).json({msg: 'passwords do not match'});
        }
    } catch(error) {
        return res.status(500).json({msg: 'internal server error. try again'});
    }
});

server.listen(PORT, () => {
    console.log('server is connected on port ' + PORT);
})