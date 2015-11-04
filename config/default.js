module.exports = {
  server: {
    host: process.env.HOST || 'localhost',
    port: process.env.PORT || 3001
  },
  hapi: {
    log: ['*']
  },
  mongodb: {
    uri: process.env.MONGOLAB_URI || 'mongodb://localhost/expense-tracker',
  },
};
