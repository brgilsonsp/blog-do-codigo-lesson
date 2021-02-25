const clienList = require('./config-cliente-lista')('blocked-access-token:');
const manipulaLista = require('./manipula-lista');

module.exports = manipulaLista(clienList);