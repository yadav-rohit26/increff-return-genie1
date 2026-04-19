import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

import User from './models/User.js';

// Define data locally to seed
const CLIENTS = [
  { id: 1, username: 'adidas', password: 'password123', clientName: 'Adidas', themeColor: '#000000', role: 'client' },
  { id: 2, username: 'puma', password: 'password123', clientName: 'Puma', themeColor: '#d60000', role: 'client' },
  { id: 3, username: 'bata', password: 'password123', clientName: 'Bata', themeColor: '#4ab75cff', role: 'client' },
  { id: 4, username: 'agilitas', password: 'password123', clientName: 'Agilitas', themeColor: '#5c54a4', role: 'client' },
  { id: 5, username: 'xtep', password: 'password123', clientName: 'Xtep', themeColor: '#88d11bff', role: 'client' },
  { id: 6, username: 'thck', password: 'password123', clientName: 'THCK', themeColor: '#c5b358', role: 'client' },
  { id: 7, username: 'damensch', password: 'password123', clientName: 'Damensch', themeColor: '#002554', role: 'client' },
  { id: 8, username: 'indianterrain', password: 'password123', clientName: 'Indian Terrain', themeColor: '#2b2a29', role: 'client' },
  { id: 9, username: 'kisah', password: 'password123', clientName: 'Kisah', themeColor: '#0b3d60', role: 'client' },
  { id: 10, username: 'cantabil', password: 'password123', clientName: 'Cantabil', themeColor: '#004785', role: 'client' },
  { id: 11, username: 'celio', password: 'password123', clientName: 'Celio', themeColor: '#4A4A4A', role: 'client' },
  { id: 12, username: 'baccarose', password: 'password123', clientName: 'Baccarose', themeColor: '#A85A32', role: 'client' },
  { id: 13, username: 'whattheflex', password: 'password123', clientName: 'What The Flex', themeColor: '#2563EB', role: 'client' },
  { id: 14, username: 'birkenstock', password: 'password123', clientName: 'Birkenstock', themeColor: '#004D40', role: 'client' },
  { id: 15, username: 'miniklub', password: 'password123', clientName: 'Miniklub', themeColor: '#D81B60', role: 'client' },
  { id: 16, username: 'fknits', password: 'password123', clientName: 'Fknits', themeColor: '#6D28D9', role: 'client' },
  { id: 17, username: 'landmarkindia', password: 'password123', clientName: 'Landmark India', themeColor: '#B91C1C', role: 'client' },
  { id: 18, username: 'piqit', password: 'password123', clientName: 'Piqit', themeColor: '#059669', role: 'client' },
  { id: 19, username: 'eccoshoes', password: 'password123', clientName: 'Eccoshoes', themeColor: '#1E3A8A', role: 'client' }
];

const ADMIN = {
  id: 0,
  username: 'admin',
  password: 'password123',
  clientName: 'Increff Admin',
  role: 'admin'
};

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/return-genie';

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for seeding');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    const usersToInsert = [...CLIENTS, ADMIN];

    // Using create so pre-save hooks are triggered
    await User.create(usersToInsert);
    console.log('Database seeded successfully!');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
