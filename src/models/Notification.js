import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true
    },
    channel: {
      type: String,
      enum: ['telegram'],
      required: true
    },
    recipientId: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed'],
      default: 'pending',
      index: true
    },
    error: {
      type: String
    },
    sentAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

NotificationSchema.index(
  { eventId: 1, recipientId: 1, channel: 1 },
  { unique: true }
);

export const NotificationModel = mongoose.model(
  'Notification',
  NotificationSchema
);
