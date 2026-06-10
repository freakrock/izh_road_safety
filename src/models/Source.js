import mongoose from 'mongoose';

const SourceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['official', 'media', 'telegram', 'vk', 'rss', 'other'],
      required: true
    },
    url: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    trustLevel: {
      type: Number,
      default: 50,
      min: 0,
      max: 100
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

SourceSchema.index({ isActive: 1, type: 1 });

export const SourceModel = mongoose.model('Source', SourceSchema);
