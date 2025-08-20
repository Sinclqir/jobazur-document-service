# Document Service

A microservice for managing user documents (CVs) in the JobAzur application.

## Features

- Upload PDF documents (CVs)
- Get user's CV
- Get all user documents
- Delete documents
- Download documents
- User-specific document management

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `env.example`:
```bash
cp env.example .env
```

3. Configure your PostgreSQL database in the `.env` file:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=jobazur_db
DB_USER=your_username
DB_PASSWORD=your_password
PORT=3002
NODE_ENV=development
```

4. Run the service:
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Get User Documents
```
GET /api/documents/user/:userId
```

### Get User's CV
```
GET /api/documents/user/:userId/cv
```

### Upload Document
```
POST /api/documents/upload
Content-Type: multipart/form-data

Body:
- file: PDF file
- userId: User ID
- title: Document title
- type: Document type (default: 'cv')
```

### Delete Document
```
DELETE /api/documents/:id?userId=:userId
```

### Download Document
```
GET /api/documents/:id/download?userId=:userId
```

## Database Schema

The service creates a `documents` table with the following structure:

- `id`: UUID (Primary Key)
- `title`: String (Document title)
- `fileUrl`: String (File path on server)
- `type`: String (Document type, default: 'cv')
- `uploadedAt`: Date (Upload timestamp)
- `userId`: UUID (User ID)

## File Storage

Documents are stored in the `uploads/` directory with unique filenames to prevent conflicts. 