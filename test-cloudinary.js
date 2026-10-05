require('dotenv').config({ path: './backend/.env' });
const cloudinary = require('./backend/config/cloudinary');

async function testCloudinary() {
  try {
    console.log('Testing Cloudinary connection...');
    console.log('Config:', {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not set',
      api_secret: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not set'
    });

    // Test with a simple upload
    const result = await cloudinary.uploader.upload('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', {
      folder: 'test',
      public_id: 'test_upload'
    });
    
    console.log('Cloudinary test successful:', result.secure_url);
    
    // Clean up test image
    await cloudinary.uploader.destroy('test/test_upload');
    console.log('Test image cleaned up');
    
  } catch (error) {
    console.error('Cloudinary test failed:', error);
  }
}

testCloudinary();