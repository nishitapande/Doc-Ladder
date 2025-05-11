# Usage Guide

This guide provides detailed information on how to use the Document Management System (DMS) effectively.

## Table of Contents

1. [Logging In](#logging-in)
2. [Dashboard Overview](#dashboard-overview)
3. [Managing Files](#managing-files)
4. [Adding Digital Signatures](#adding-digital-signatures)
5. [Sharing Files](#sharing-files)
6. [Viewing Approved Files](#viewing-approved-files)
7. [Departmental Access](#departmental-access)
8. [API Documentation](#api-documentation)

## Logging In

1. Navigate to the DMS login page.
2. Enter your username and password.
3. Click the "Login" button.

## Dashboard Overview

After logging in, you'll be presented with the main dashboard, which includes:

- Quick access to recent files
- Notifications for pending approvals or shared files
- Overview of your department's document statistics

## Managing Files

### Uploading Files

1. Click the "Upload" button on the dashboard.
2. Select the file(s) you want to upload.
3. Add any necessary metadata or tags.
4. Click "Upload" to complete the process.

### Organizing Files

- Use folders to categorize your files.
- Add tags to make files easily searchable.
- Use the search function to quickly find specific files.

## Adding Digital Signatures

1. Open the file you want to sign.
2. Click the "Add Digital Signature" button.
3. Review the document.
4. Click "Sign" to add your digital signature to the document.

## Sharing Files

1. Select the file(s) you want to share.
2. Click the "Share" button.
3. Enter the recipient's username or select from your organization's directory.
4. Set permissions (view, edit, etc.) for the shared file.
5. Click "Share" to send the file.

## Viewing Approved Files

1. Navigate to the "Approved Files" section in the sidebar.
2. Browse through the list of approved files.
3. Use filters to narrow down the results by date, department, or file type.

## Departmental Access

- Files are automatically categorized based on your department.
- You can only view files that your department has been granted access to.
- To request access to files from other departments, contact your system administrator.

## API Documentation

The Document Management System provides a set of RESTful APIs for backend operations. Below are the main endpoints:

### Authentication

- `POST /api/auth/login`: Authenticate user and receive a JWT token
- `POST /api/auth/logout`: Invalidate the current user's token

### File Management

- `GET /api/files`: Retrieve a list of files (with pagination)
- `POST /api/files`: Upload a new file
- `GET /api/files/:id`: Get details of a specific file
- `PUT /api/files/:id`: Update file metadata
- `DELETE /api/files/:id`: Delete a file

### Digital Signatures

- `POST /api/files/:id/sign`: Add a digital signature to a file

### File Sharing

- `POST /api/files/:id/share`: Share a file with other users
- `GET /api/files/shared`: Get a list of files shared with the current user

### Approved Files

- `GET /api/files/approved`: Retrieve a list of approved files

For detailed information on request/response formats and authentication requirements, please refer to the full API documentation available at `http://your-api-docs-url.com`.

Remember to include the JWT token in the Authorization header for authenticated requests:

```
Authorization: Bearer <your_jwt_token>