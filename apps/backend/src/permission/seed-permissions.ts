import mongoose from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
import { defaultPermissions } from './permissions.data';
import { PermissionSchema } from './schema/permission.schema';

// Read .env file manually to avoid requiring 'dotenv' package which might not be installed
const envPath = path.join(process.cwd(), '.env');
let MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI && fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  const uriLine = envFile
    .split('\n')
    .find((line) => line.startsWith('MONGO_URI='));
  if (uriLine) MONGO_URI = uriLine.substring(10).trim();
}

async function seed() {
  if (!MONGO_URI) {
    console.error('MONGO_URI is undefined in .env file!');
    process.exit(1);
  }

  try {
    console.log('⏳ Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected successfully');

    // Initialize Mongoose Model
    const PermissionModel = mongoose.model('Permission', PermissionSchema);

    // Use bulkWrite to upsert permissions (update existing ones without changing their _id, create new ones)
    const bulkOps = defaultPermissions.map((permission) => ({
      updateOne: {
        filter: { name: permission.name },
        update: { $set: permission },
        upsert: true,
      },
    }));

    console.log(`🌱 Upserting ${defaultPermissions.length} permissions...`);
    const result = await PermissionModel.bulkWrite(bulkOps);

    console.log(
      `✅ Seeding completed! (Inserted: ${result.upsertedCount}, Updated: ${result.modifiedCount})`,
    );
  } catch (error) {
    console.error('❌ Error during seeding:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

seed();
