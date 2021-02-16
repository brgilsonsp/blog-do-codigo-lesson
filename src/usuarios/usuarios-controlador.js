const jwt = require('jsonwebtoken');
const Usuario = require('./usuarios-modelo');
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
  return jwt.sign(payload, senhaSecretaServer);
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
    const tokenJwt = criaTokenJwt(req.user);
    res.set('Authorization', tokenJwt);
    res.status(204).send();
  },

  lista: async (req, res) => {
    const usuarios = await Usuario.lista();
    res.json(usuarios);
  },

  deleta: async (req, res) => {
    const usuario = await Usuario.buscaPorId(req.params.id);
    try {
      await usuario.deleta();
      res.status(200).send();
    } catch (erro) {
      res.status(500).json({ erro: erro });
    }
  }
};
