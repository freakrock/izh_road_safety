import mongoose from 'mongoose';

const SubscriberSchema = new mongoose.Schema(
  {
    telegramId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    chatId: {
      type: String,
      required: true,
      index: true
    },
    username: String,
    firstName: String,
    lastName: String,
    city: {
      type: String,
      default: 'Ижевск'
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    lastSeenAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

export const SubscriberModel = mongoose.model('Subscriber', SubscriberSchema);
