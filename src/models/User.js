import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  chatId: { type: Number, required: true, unique: true },
  username: String,
  firstName: String,
  isAdmin: { type: Boolean, default: false }, // Добавляем это поле
  createdAt: { type: Date, default: Date.now }
});

export const UserModel = mongoose.model('User', userSchema);
