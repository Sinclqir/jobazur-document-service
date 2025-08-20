const express = require('express');
const router = express.Router();
const authenticateJwt = require('../middlewares/authJwt');
const {
  getUserDocuments,
  getUserCV,
  uploadDocument,
  deleteDocument,
  downloadDocument
} = require('../controllers/documentController');

// Get all documents for a user
router.get('/user/:userId', authenticateJwt, getUserDocuments);

// Get user's CV
router.get('/user/:userId/cv', authenticateJwt, getUserCV);

// Upload a new document
router.post('/upload', authenticateJwt, uploadDocument);

// Delete a document
router.delete('/:id', authenticateJwt, deleteDocument);

// Download a document
router.get('/:id/download', authenticateJwt, downloadDocument);

module.exports = router; 