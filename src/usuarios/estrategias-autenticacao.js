const passport = require('passport');
const jwt = require('jsonwebtoken');
const LocalStrategy = require('passport-local').Strategy;
const BearerStrategy = require('passport-http-bearer').Strategy;

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
);

passport.use(
    new BearerStrategy(
        async (token, done) => {
            try{
                const payload = jwt.verify(token, process.env.CHAVE_JWT);
                const usuario = await Usuario.buscaPorId(payload.id);
                done(null, usuario);
            }catch(error){
                done(error);
            }
        }
    )
)