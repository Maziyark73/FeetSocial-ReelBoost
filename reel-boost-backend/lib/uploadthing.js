require('dotenv').config();
const { UTApi } = require('@uploadthing/server');

// Initialize UploadThing API client
const utapi = new UTApi({
  apiKey: process.env.UPLOADTHING_SECRET,
});

/**
 * Upload file to UploadThing
 * @param {Buffer|File} file - File to upload
 * @param {string} filename - Original filename
 * @param {object} metadata - Optional metadata
 * @returns {Promise<object>} Upload result with URL and key
 */
async function uploadFile(file, filename, metadata = {}) {
  try {
    if (!process.env.UPLOADTHING_SECRET) {
      throw new Error('UPLOADTHING_SECRET is not configured');
    }

    // Upload file to UploadThing
    const uploadResult = await utapi.uploadFiles(file, {
      metadata,
    });

    return {
      url: uploadResult.url,
      key: uploadResult.key,
      size: uploadResult.size,
    };
  } catch (error) {
    console.error('Error uploading file to UploadThing:', error);
    throw error;
  }
}

/**
 * Delete file from UploadThing
 * @param {string} fileKey - File key to delete
 * @returns {Promise<boolean>} Success status
 */
async function deleteFile(fileKey) {
  try {
    await utapi.deleteFiles(fileKey);
    return true;
  } catch (error) {
    console.error('Error deleting file from UploadThing:', error);
    return false;
  }
}

module.exports = {
  uploadFile,
  deleteFile,
  utapi,
};

// TODO: Replace multer upload middleware with UploadThing
// TODO: Update all file upload routes to use uploadFile() instead of local storage
// TODO: Update file deletion logic to use deleteFile()
// TODO: Handle image resizing/optimization before upload if needed
