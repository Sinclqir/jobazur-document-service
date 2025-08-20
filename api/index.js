// api/index.js - Version de test
module.exports = (req, res) => {
    try {
      res.json({ 
        status: 'OK', 
        message: 'API working',
        path: req.url,
        method: req.method 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };