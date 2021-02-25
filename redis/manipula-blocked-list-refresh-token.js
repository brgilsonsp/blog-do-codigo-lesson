const manipulaListaAccessToken = require('./config-blocked-lista-access-token');
const jwt = require('jsonwebtoken');
const { createHash } = require('crypto');


function toHash(token){
    return createHash('sha256').update(token).digest('hex');
}

module.exports = {
    adicionaToken: async token => {
        const payload = jwt.decode(token);
        const dataExpiracao = payload.exp;
        const tokenHash = toHash(token);
        await manipulaListaAccessToken.adiciona(tokenHash, '', dataExpiracao);
    },

    contemToken: async token => {
        const tokenHash = toHash(token);
        return await manipulaListaAccessToken.contemChave(tokenHash);
    }
}