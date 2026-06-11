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
      type: String,
      index: true
    },
    url: {
      type: String
    },
    title: {
      type: String
    },
    text: {
      type: String,
      required: true
    },
    publishedAt: {
      type: Date,
      index: true
    },
    rawData: {
      type: mongoose.Schema.Types.Mixed
    },
    hash: {
      type: String,
      unique: true,
      index: true
    },
    isProcessed: {
      type: Boolean,
      default: false,
      index: true
    },
metadata: {
  isRelevant: Boolean,
  aiScore: Number,
  extractedLocation: String,
  extractedType: String
}

  },
  {
    timestamps: true
  }
);

RawPostSchema.index({ sourceId: 1, publishedAt: -1 });

export const RawPostModel = mongoose.model('RawPost', RawPostSchema);
