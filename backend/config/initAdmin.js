import bcrypt from 'bcrypt';
import userModel from '../models/userModel.js';
import logger from '../utils/logger.js';

/**
 * Initialize admin user on server startup
 * Creates admin if not exists, ensures isAdmin flag is set
 */
export const initializeAdmin = async () => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@forever.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

        // Check if admin exists
        let admin = await userModel.findOne({ email: adminEmail });

        if (!admin) {
            // Create admin user
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            
            admin = new userModel({
                name: 'Admin',
                email: adminEmail,
                password: hashedPassword,
                isAdmin: true,
                emailVerified: true,
                twoFactorEnabled: false
            });

            await admin.save();
            logger.info('✅ Admin user created', { email: adminEmail });
        } else {
            // Ensure admin flag is set
            if (!admin.isAdmin) {
                admin.isAdmin = true;
                await admin.save();
                logger.info('✅ Admin flag updated', { email: adminEmail });
            } else {
                logger.info('✅ Admin user already exists', { email: adminEmail });
            }
        }
    } catch (error) {
        logger.error('❌ Failed to initialize admin', { error: error.message });
        // Don't throw - allow server to start even if admin init fails
    }
};
