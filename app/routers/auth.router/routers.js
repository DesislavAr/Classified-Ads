const { Router } = require('express');
const passport = require('passport');

const attachTo = (app, data) => {
    const router = new Router();
    const controller = require('./controller').init(data);

    router
        .get('/sign-up', (req, res) => {
            return controller.getSignUpForm(req, res);
        })
        .get('/sign-in', (req, res) => {
            return controller.getSignInForm(req, res);
        })
        .get('/sign-out', (req, res) => {
            controller.signOut(req, res);
        })
        .post('/sign-up', (req, res) => {
            return controller.signUp(req, res);
        })
        .post('/sign-in', passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: '/',
            failureFlash: true,
        }));

    app.use('/auth', router);
};

module.exports = { attachTo };