require('dotenv').config();
const app = require('./app');
require('./redis/blacklist');
const db = require('./database');
const routes = require('./rotas');

const port = process.env.PORT_SERVER || 3100;
routes(app);

app.listen(port, () => console.log(`App listening on port ${port}`));
