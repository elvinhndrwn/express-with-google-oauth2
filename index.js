const express = require('express');
const passport = require('passport');
require('./auth')
var session = require('express-session')

const app = express();
app.use(session({
    secret: 'cats',
    resave : false,
    saveUninitialized : true,
    cookie : {
        maxAge : 120000
    }
}));
app.use(passport.initialize());
app.use(passport.session());

// set middleware function to check is login or not
function isLoggedIn(req, res, next) {
    req.user ? next() : res.sendStatus(401);
}

// Home page
app.get('/', (req, res) => {
    res.send('<a href="/auth/google">Authenticate with Google</a>')
});


// Sample protected endpoint
app.get('/protected', isLoggedIn, (req, res) => {
    let user = req.user;
    res.json({
        id: user.id,
        name: user.displayName,
        language: user.language,
        emails: user.emails,
        picture: user.picture
    })
});

app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).send('Error logging out');
        }
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).send('Error destroying session');
            }
            res.send('See ya!');
        });
    });
    res.send('See ya')
})

app.get('/auth/google',
    passport.authenticate('google', { scope: ['email', 'profile'] }));


// set redirect after authentication
app.get('/google/callback',
    passport.authenticate('google', {
        successRedirect: '/protected',
        failureRedirect: '/google/failure'
    }));

// set failure redirect
app.get('/google/failure', (req, res) => {
    res.send('Failed login...')
});

app.listen(3000, () => console.log('server started..'));