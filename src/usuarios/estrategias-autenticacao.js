const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const Usuario = require('./usuarios-modelo');


passport.use(
    new LocalStrategy({
        usernameField: 'email',        
        passwordField: 'senha',
        session: false
    }, async (email, senha, done) => {
        try{
            const usuario = await Usuario.buscaPorEmail(email);
            await Usuario.ehUmUsuarioValido(usuario, senha);

            done(null, usuario);
        }catch(error){
            done(error);
        }
    })
)