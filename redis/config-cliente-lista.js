const redis = require('redis');

module.exports = (prefix) => { 
    return redis.createClient({prefix});
}