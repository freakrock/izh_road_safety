import mongoose from 'mongoose';

const SubscriberSchema = new mongoose.Schema(
  {
    telegramId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    city: {
      type: String,
      default: 'Ижевск'
    },
    districts: {
      type: [String],
      default: []
    },
    eventTypes: {
      type: [String],
      default: []
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

export const SubscriberModel = mongoose.model('Subscriber', SubscriberSchema);
