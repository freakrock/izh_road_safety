import mongoose from 'mongoose';

const SourceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    type: {
      type: String,
      enum: ['rss', 'telegram', 'vk', 'website'],
      required: true,
      index: true
    },
    url: {
      type: String,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    parserType: {
      type: String,
      default: 'rss'
    },
    lastFetchedAt: {
      type: Date
    },
    fetchIntervalMs: {
      type: Number,
      default: 300_000
    }
  },
  {
    timestamps: true
  }
);

export const SourceModel = mongoose.model('Source', SourceSchema);
