require('dotenv').config();
const bcrypt = require('bcrypt');
const { User, Role } = require('../models');

async function createTestAdmin() {
  try {
    console.log('🔄 Creating test admin user...');

    // Find admin role
    const adminRole = await Role.findOne({ where: { name: 'admin' } });
    if (!adminRole) {
      throw new Error('Admin role not found. Please run seed-permissions.js first.');
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    const [admin, created] = await User.findOrCreate({
      where: { phone: '+966500000000' },
      defaults: {
        name: 'Test Admin',
        email: 'admin@example.com',
        password: hashedPassword,
        phone: '+966500000000',
        language: 'en',
        token: '',
        roleId: adminRole.id,
        isActive: true
      }
    });

    if (created) {
      console.log('✅ Test admin user created successfully');
      console.log('📱 Phone: +966500000000');
      console.log('🔑 Password: admin123');
    } else {
      console.log('⏩ Test admin user already exists');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  createTestAdmin()
    .then(() => {
      console.log('🏁 Done');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Failed:', error);
      process.exit(1);
    });
}
