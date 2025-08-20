const { Document } = require('../models');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const authenticateJwt = require('../middlewares/authJwt');
const s3Client = require('../services/s3Client');
const { PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Get all documents for a user
async function getUserDocuments(req, res) {
  const { userId } = req.params;
  
  try {
    const documents = await Document.findAll({
      where: { userId },
      order: [['uploadedAt', 'DESC']]
    });
    
    res.json(documents);
  } catch (error) {
    console.error('Error getting user documents:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Get user's CV (latest CV document)
async function getUserCV(req, res) {
  const { userId } = req.params;
  
  try {
    const cv = await Document.findOne({
      where: { 
        userId,
        type: 'cv'
      },
      order: [['uploadedAt', 'DESC']]
    });
    
    if (!cv) {
      return res.status(404).json({ error: 'No CV found for this user' });
    }
    
    res.json(cv);
  } catch (error) {
    console.error('Error getting user CV:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Upload a new document (CV) - uploads to S3, stores URL/key in DB
async function uploadDocument(req, res) {
  upload.single('file')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Prefer userId from JWT if available
    const userIdFromToken = req.user?.id;
    const { userId: userIdFromBody, title, type = 'cv' } = req.body;
    const userId = userIdFromToken || userIdFromBody;
    
    if (!userId || !title) {
      return res.status(400).json({ error: 'userId and title are required' });
    }
    
    try {
      // Upload to S3
      const key = `documents/${userId}/${uuidv4()}-${Date.now()}.pdf`;
      await s3Client.send(new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: key,
        Body: req.file.buffer,
        ContentType: 'application/pdf'
      }));

      // If uploading a CV, delete the previous CV entry
      if (type === 'cv') {
        await Document.destroy({
          where: { 
            userId,
            type: 'cv'
          }
        });
      }
      
      const document = await Document.create({
        title,
        fileUrl: key,
        type,
        userId,
        uploadedAt: new Date()
      });
      
      res.status(201).json(document);
    } catch (error) {
      console.error('Error uploading document:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
}

// Delete a document
async function deleteDocument(req, res) {
  const { id } = req.params;
  const { userId } = req.query;
  
  try {
    const document = await Document.findOne({
      where: { id, userId }
    });
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    // Delete the file from filesystem
    if (fs.existsSync(document.fileUrl)) {
      fs.unlinkSync(document.fileUrl);
    }
    
    await document.destroy();
    
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Download a document - returns a short-lived signed URL after ownership check
async function downloadDocument(req, res) {
  const { id } = req.params;
  const userIdFromToken = req.user?.id;
  const { userId: userIdFromQuery } = req.query;
  const userId = userIdFromToken || userIdFromQuery;
  
  try {
    const document = await Document.findOne({
      where: { id, userId }
    });
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const signedUrl = await getSignedUrl(
      s3Client,
      new GetObjectCommand({ Bucket: process.env.S3_BUCKET, Key: document.fileUrl }),
      { expiresIn: 60 }
    );

    res.json({ url: signedUrl });
  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  getUserDocuments,
  getUserCV,
  uploadDocument,
  deleteDocument,
  downloadDocument
}; 