import mongoose from 'mongoose';

const RawPostSchema = new mongoose.Schema(
  {
    sourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Source',
      required: true,
      index: true
    },
    externalId: {
      type: String
    },
    url: {
      type: String
    },
    text: {
      type: String,
      required: true
    },
    hash: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    publishedAt: {
      type: Date
    },
    fetchedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

RawPostSchema.index({ sourceId: 1, publishedAt: -1 });

export const RawPostModel = mongoose.model('RawPost', RawPostSchema);
