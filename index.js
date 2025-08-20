const app = require('./src/app');
const serverless = require('serverless-http');

const PORT = process.env.PORT || 3002;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Document service running on port ${PORT}`);
  });
}

module.exports.handler = serverless(app); 