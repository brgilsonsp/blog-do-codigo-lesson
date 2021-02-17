const passport = require('passport');

module.exports = {
    local: (req, res, next) => {
        passport.authenticate(
            'local', 
            {session: false},
            (error, usuario, info) => {
                if(error && error.name === 'InvalidArgumentError'){
                    return res.status(401).json( {error: error.message} );
                }
                if(error){
                    return res.status(500).json( {error: 'Ops, ocorreu um erro'});
                }
                if(!usuario){ //requisição mal formatada, por exemplo, sem e-mail e senha
                    return res.status(401).json( {error: 'Verifique as credenciais enviada'})
                }
                
                req.user = usuario;
                return next();
            }
        )(req, res, next);
    },

    bearer: (req, res, next) => {
        passport.authenticate(
            'bearer',
            { session: false },
            (error, usuario, info) => {
                if(error && error.name === 'JsonWebTokenError'){
                    return res.status(401).json( { error: `Token inválido ${error.message}`} );
                }
                if(error && error.name === 'TokenExpiredError'){
                    return res.status(401).json( { error: 'Token expirado' } );
                }
                if(error){
                    return res.status(500).json( { error: 'Ops, aconteeu algo incorreto' } );
                }                
                if(!usuario){
                    return res.status(401).json( { error: 'Token inválido' } );
                }

                req.token = info.token;
                req.user = usuario;
                next();
            }
        )(req, res, next);
    }
};