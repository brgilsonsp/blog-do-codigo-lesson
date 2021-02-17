const blacklist = require('./blacklist');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const { createHash } = require('crypto');

//Transforma em uma promise, pois a funcção set e exists aguarda callback
const setTokenAsync = promisify(blacklist.set).bind(blacklist);
const contemTokenAsync = promisify(blacklist.exists).bind(blacklist);

function toHash(token){
    return createHash('sha256').update(token).digest('hex');
}

module.exports = {
    adicionaToken: async token => {
        const payload = jwt.decode(token);
        const dataExpiracao = payload.exp;
        const tokenHash = toHash(token);
        await setTokenAsync(tokenHash, '');
        blacklist.expireat(tokenHash, dataExpiracao);
    },

    contemToken: async token => {
        const tokenHash = toHash(token);
        const resultado = await contemTokenAsync(tokenHash);
        return resultado === 1;

    }
}