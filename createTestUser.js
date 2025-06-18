require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function createTestUser() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.URL_BD);
        console.log('Connected to MongoDB');

        // Create test user
        const testUser = new User({
            name: 'Test Admin',
            email: 'admin@test.com',
            password: 'password123',
            role: 'admin'
        });

        await testUser.save();
        console.log('Test user created successfully:', {
            email: testUser.email,
            role: testUser.role
        });

        // Disconnect
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

createTestUser(); 