const LocalStrategy = require('passport-local').Strategy;

const User = require('../app/models/user');

module.exports = function(passport){
    passport.serializeUser(function (user, done) { // NOTA: done es el callback
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function ( err, user) {
            done(err, user);
        });
    });

    /*------------- Registro ------------------*/

    passport.use('local-signup', new LocalStrategy ({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
    function(req, email, password, done){
        User.findOne({'local.email': email}, function (err, user) {
            if(err) { return done(err);}
            if(user){
                return done(null, false, req.flash('signupMessage', 'Email ya registrado'));
            }else {
                var newUser = new User();
                newUser.local.email = email;
                newUser.local.password = newUser.generateHash(password);
                newUser.save( function (err) {
                    if(err) {throw err;}
                    return done(null, newUser);
                });
            }
        })
    }));

    /*--------------- Login ------------------*/

    passport.use('local-login', new LocalStrategy ({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
    function(req, email, password, done){
        User.findOne({'local.email': email}, function (err, user) {
            if(err) { return done(err);}
            if(!user){
                return done(null, false, req.flash('loginMessage', 'Usuario no encontrado'));
            }
            if(!user.validatePassword(password)){
                return done(null, false, req.flash('loginMessage', 'Password incorrecto'));
            }
            
            return done(null, user);
            
        })
    }));

}