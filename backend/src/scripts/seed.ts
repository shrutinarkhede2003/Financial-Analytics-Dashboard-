import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { Transaction } from '../models/Transaction';
import { User } from '../models/User';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/financial_analytics';

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB at:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully.');

    // 1. Seed Demo User
    const demoEmail = 'analyst@loopr.ai';
    const existingUser = await User.findOne({ email: demoEmail });

    if (!existingUser) {
      const demoUser = new User({
        email: demoEmail,
        password: 'password123',
        name: 'Shruti Narkhede',
        role: 'Lead Financial Analyst',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      });
      await demoUser.save();
      console.log(`Created demo user: ${demoEmail} / password123`);
    } else {
      console.log(`Demo user already exists: ${demoEmail}`);
    }

    // 2. Load dataset/sample-data.json
    const sampleDataPath = path.join(__dirname, '../../../dataset/sample-data.json');
    if (!fs.existsSync(sampleDataPath)) {
      throw new Error(`Sample data file not found at: ${sampleDataPath}`);
    }

    const rawData = fs.readFileSync(sampleDataPath, 'utf-8');
    const records = JSON.parse(rawData);

    console.log(`Found ${records.length} records in sample-data.json.`);

    // Clear old transactions
    await Transaction.deleteMany({});
    console.log('Cleared existing transactions.');

    // Format and insert records
    const formattedRecords = records.map((item: any) => ({
      id: item.id,
      date: new Date(item.date),
      amount: item.amount,
      category: item.category,
      status: item.status,
      user_id: item.user_id,
      user_profile: item.user_profile,
    }));

    const result = await Transaction.insertMany(formattedRecords);
    console.log(`Successfully seeded ${result.length} transactions into MongoDB!`);

    await mongoose.disconnect();
    console.log('MongoDB connection closed. Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error during database seeding:', error);
    process.exit(1);
  }
};

seedDatabase();
