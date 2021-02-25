const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const moment = require('moment');
const Usuario = require('./usuarios-modelo');
const { adicionaToken } = require('../../redis/manipula-blocked-list-refresh-token');

const { InvalidArgumentError, InternalServerError } = require('../erros');

//Precisamos criar apenas o payload pois o cabeçalho é criado pela API
function criaTokenJwt(usuario){
  const payload = {
    id: usuario.id,
    claims: [
      'admin', 'financial', 'developer'
    ]
  };

  const senhaSecretaServer = process.env.CHAVE_JWT;
  const expireLimit = process.env.EXPIRE_TOKEN_TIME || '5m';
  return jwt.sign(payload, senhaSecretaServer, { expiresIn: expireLimit });
}

function criaTokenOpaco(usuario){
  const sizeBytes = parseInt(process.env.SIZE_BYTES_REFRESH_TOKEN || 25);
  const minutosExpiracao = parseInt(process.env.MINUTES_TO_EXPIRE_REFRESH_TOKEN || 7200);
  const dataExpiracao = moment().add(minutosExpiracao, 'm').unix();

  return crypto.randomBytes(sizeBytes).toString('hex');
}

module.exports = {
  adiciona: async (req, res) => {
    const { nome, email, senha } = req.body;

    try {
      const usuario = new Usuario({
        nome,
        email
      });

      await usuario.adicionaSenha(senha);

      await usuario.adiciona();

      res.status(201).json();
    } catch (erro) {
      if (erro instanceof InvalidArgumentError) {
        res.status(422).json({ erro: erro.message });
      } else if (erro instanceof InternalServerError) {
        res.status(500).json({ erro: erro.message });
      } else {
        res.status(500).json({ erro: erro.message });
      }
    }
  },

  login: (req, res) => {
    //O atributo user do objeto req é injetado no final do Passport, no done
    const access_token = criaTokenJwt(req.user);
    const refresh_token = criaTokenOpaco(req.user);
    const bodyResponse = { access_token, refresh_token };
    res.status(201).json(bodyResponse);
  },

  logout: (req, res) => {
    const token = req.token;
    adicionaToken(token);
    res.status(204).send();
  },

  lista: async (req, res) => {
    const usuarios = await Usuario.lista();
    res.json(usuarios);
  },

  deleta: async (req, res) => {
    const usuario = await Usuario.buscaPorId(req.params.id);
    try {
      if(!usuario){
        return res.status(400).json( { erro: 'Usuário não encontrado'})
      }
      await usuario.deleta();
      res.status(200).send();
    } catch (erro) {
      res.status(500).json({ erro: erro.message });
    }
  }
};
