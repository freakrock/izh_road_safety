import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    eventType: {
      type: String,
      enum: [
        'sobriety_check',
        'child_safety',
        'motorcycle_control',
        'tinting_control',
        'pedestrian_priority',
        'speed_control',
        'seatbelt_control',
        'phone_driving',
        'license_check',
        'mass_check',
        'accident_risk',
        'road_closure',
        'unknown'
      ],
      default: 'unknown',
      index: true
    },

    city: {
      type: String,
      default: 'Ижевск',
      index: true
    },
    district: {
      type: String,
      index: true
    },
    locationText: {
      type: String
    },
    precisionLevel: {
      type: String,
      enum: ['city', 'district', 'road', 'exact'],
      default: 'city'
    },

    confidence: {
      type: Number,
      default: 0,
      min: 0,
      max: 1
    },
    status: {
      type: String,
      enum: ['candidate', 'approved', 'rejected', 'expired', 'archived'],
      default: 'candidate',
      index: true
    },

    sourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Source'
    },
    rawPostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RawPost',
      index: true
    },

    notifiedAt: {
      type: Date
    },
    approvedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

EventSchema.index({ status: 1, createdAt: -1 });
EventSchema.index({ city: 1, district: 1, status: 1 });
EventSchema.index({ rawPostId: 1, eventType: 1 }, { unique: true, sparse: true });

export const EventModel = mongoose.model('Event', EventSchema);
