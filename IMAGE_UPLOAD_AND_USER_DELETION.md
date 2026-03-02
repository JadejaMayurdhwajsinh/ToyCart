# Image Upload & User Management Features

## Overview
This document describes the new image upload functionality using Multer and the user deletion feature in the admin panel.

## Features Implemented

### 1. Product Image Upload (Multer)
- **Location**: Backend image storage in `/backend/uploads/products/`
- **File Types Supported**: JPEG, PNG, GIF, WebP
- **Max File Size**: 5MB per image
- **Previous**: Required external image URLs
- **Now**: Upload images directly through admin panel

#### Backend Changes
- **New Middleware**: `/backend/middleware/upload.js`
  - Configures multer storage and file validation
  - Handles file upload errors gracefully
  - Automatically creates unique filenames with timestamps

- **Server Changes**: `/backend/server.js`
  - Added static file serving for uploaded images
  - Images accessible at: `http://localhost:5000/uploads/products/{filename}`

- **Product Routes**: `/backend/routes/product.js`
  - **CREATE** (`POST /api/products`) - Now accepts file uploads
  - **UPDATE** (`PUT /api/products/:id`) - Replaces old image when new one uploaded
  - **DELETE** (`DELETE /api/products/:id`) - Automatically deletes associated image file

#### Frontend Changes
- **AdminProducts Component**: `/frontend/src/pages/Admin/AdminProducts.jsx`
  - Image URL input → File upload input
  - Live image preview thumbnail
  - Shows file format restrictions and size limits
  - Handles FormData submission for file uploads

#### API Service Update
- **Modified Methods**: `createProduct()` and `updateProduct()`
  - Now support both FormData (with files) and JSON payloads
  - Auto-sets correct headers for multipart/form-data

### 2. Admin User Deletion
- **Location**: Admin dashboard → Customers section
- **Restrictions**: Can only delete customers with no active orders
  - Active orders include: pending, processing, shipped
  - Can delete customers with: delivered or cancelled orders only

#### Backend Changes
- **New Route**: `DELETE /api/admin/customers/:userId`
  - Validates customer exists and has role 'customer'
  - Checks for any active orders
  - Returns helpful error message if deletion is not allowed
  - Located in `/backend/routes/admin.js`

#### Frontend Changes
- **AdminCustomers Component**: `/frontend/src/pages/Admin/AdminCustomers.jsx`
  - Delete button in customer list row
  - Delete button in customer detail modal
  - Delete confirmation dialog with warnings
  - Prevents deletion if customer has active orders

#### API Service Update
- **New Method**: `deleteAdminCustomer(userId, token)`
  - Added to `/frontend/src/services/api.js`
  - Sends DELETE request to admin customer endpoint

## API Endpoints

### Product Image Upload
```
POST /api/products
Content-Type: multipart/form-data

Fields:
- name (string, required)
- price (number, required)
- stock (number, required)
- categoryId (number, required)
- image (file, optional) - The product image
- description (string, optional)
- short_description (string, optional)
- is_featured (boolean, optional)
```

### Update Product with Image
```
PUT /api/products/:id
Content-Type: multipart/form-data

Fields: Same as POST above
```

### Delete Customer
```
DELETE /api/admin/customers/:userId
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Customer deleted successfully"
}
```

## File Structure

```
backend/
├── middleware/
│   └── upload.js              (NEW - Multer configuration)
├── uploads/                   (NEW - Uploaded files directory)
│   └── products/              (Product images stored here)
├── routes/
│   ├── product.js             (Updated - File upload support)
│   └── admin.js               (Updated - Delete customer route)
└── server.js                  (Updated - Static file serving)

frontend/
└── src/
    ├── services/
    │   └── api.js             (Updated - File upload & delete methods)
    └── pages/Admin/
        ├── AdminProducts.jsx   (Updated - File upload UI)
        └── AdminCustomers.jsx  (Updated - Delete user feature)
```

## Usage Guide

### For Admin - Adding/Editing a Product with Image

1. Go to Admin Dashboard → Products
2. Click "+ Add Product" or "Edit" on existing product
3. Fill in product details (name, price, stock, etc.)
4. In "Product Image" field:
   - Click to select an image file from your computer
   - Image preview will appear on the right
   - Supported formats: PNG, JPEG, GIF, WebP
   - Max size: 5MB
5. Click "Add Product" or "Save Changes"
6. Image is automatically uploaded and stored on server

### For Admin - Deleting a Customer

1. Go to Admin Dashboard → Customers
2. Either:
   - Click "Delete" button next to customer name, OR
   - Click "View History" → Click "Delete Customer" button
3. Review the warning message
4. Click "Delete" to confirm
5. If customer has active orders:
   - Deletion will be blocked with error message
   - Complete/cancel active orders first

## Error Handling

### Image Upload Errors
- **File too large**: "File is too large. Maximum size is 5MB"
- **Invalid format**: "Only image files are allowed (jpeg, png, gif, webp)"
- **Upload failed**: Returns specific error message

### Customer Deletion Errors
- **Customer not found**: Returns 404 error
- **Active orders exist**: "Cannot delete customer with pending or active orders. Please cancel/complete all orders first."
- **Unauthorized**: Returns 401 error

## Security Considerations

1. **File Upload Security**
   - File type validation (MIME type check)
   - File size limits (5MB maximum)
   - Unique filenames prevent conflicts
   - Stored outside web root accessibility via /uploads endpoint

2. **Deletion Security**
   - Requires admin authentication
   - Validates customer role (must be 'customer')
   - Checks for dependent orders before deletion
   - Admin-only endpoint with middleware protection

3. **CORS Configuration**
   - Uploaded images accessible to frontend
   - Authentication required for delete operations

## Database Changes

No database schema changes were required. The existing `Product.image_url` field now stores the path to uploaded files instead of external URLs.

### Example image_url values:
- Before: `https://external-cdn.com/image.jpg`
- After: `/uploads/products/product-name-1704067200000.jpg`

## Performance Notes

1. **Image Storage**: Files stored locally on server disk
2. **Cleanup**: Old images are deleted when:
   - Product is deleted
   - Product image is updated with new image
3. **Static Serving**: Images served via Express.static for efficient delivery

## Testing

### Product Image Upload
1. Create a new product with image
2. Verify image appears in product listing
3. Edit product and change image
4. Verify old image is deleted and new one appears
5. Delete product and verify image file is removed

### Customer Deletion
1. Create test customer with delivered orders
2. Attempt to delete - should succeed
3. Create test customer with pending orders
4. Attempt to delete - should fail with appropriate error
5. Cancel pending orders
6. Retry delete - should succeed

## Troubleshooting

### Images not showing
- Check if `/uploads/products/` directory exists and has files
- Verify static file serving is enabled in server.js
- Check browser network tab for 404 errors

### File upload fails
- Verify file size is under 5MB
- Check file format is supported (JPG, PNG, GIF, WebP)
- Check server logs for detailed error messages
- Ensure `/uploads/products/` directory is writable

### Delete customer fails
- Check if customer has any active orders
- Verify you're logged in as admin
- Check server logs for detailed error message

## Dependencies

- **multer**: ^2.1.0 (File upload handling)
- **express**: ^5.2.1 (Static file serving)

No additional packages needed beyond what's already installed.
