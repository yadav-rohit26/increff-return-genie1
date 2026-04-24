import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  clientId: {
    type: String,
    default: 'ADIDAS_INDIA'
  },
  dbId: {
    type: String
  },
  clientName: {
    type: String,
    required: true
  },
  themeColor: {
    type: String,
    default: '#000000'
  },
  role: {
    type: String,
    enum: ['admin', 'client'],
    default: 'client'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  pod: {
    type: String,
    enum: ['POD 1', 'POD 2', 'POD 3', 'POD 4'],
    default: 'POD 2'
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);
export default User;
