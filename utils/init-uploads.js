const fs = require('fs');
const path = require('path');

// Create uploads directory if it doesn't exist
const createUploadsDir = () => {
  const uploadsDir = path.join(__dirname, '../uploads');
  
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('✅ Uploads directory created successfully');
  }

  // Ensure proper permissions (read/write)
  fs.chmodSync(uploadsDir, 0o755);
  console.log('✅ Uploads directory permissions set');

  return uploadsDir;
};

module.exports = { createUploadsDir };
