import { EventModel } from '../models/Event.js';
import { SourceModel } from '../models/Source.js';
import { RawPostModel } from '../models/RawPost.js';
import { classifyEvent } from '../classifier/event-classifier.js';
import {
  canAutoApprove,
  enforceSafePrecision,
  sanitizePublicText
} from '../classifier/safety-policy.js';
import { createHash } from '../utils/hash.js';

export async function ingestManualText(params) {
  const sourceName = params.sourceName || 'Manual Test Source';

  const source = await SourceModel.findOneAndUpdate(
    {
      name: sourceName
    },
    {
      name: sourceName,
      type: 'official',
      url: `manual://${sourceName}`,
      trustLevel: 90,
      isActive: true
    },
    {
      upsert: true,
      new: true
    }
  );

  const hash = createHash(`${source._id}:${params.text}`);

  const existingRawPost = await RawPostModel.findOne({ hash });

  if (existingRawPost) {
    const existingEvent = await EventModel.findOne({
      rawPostId: existingRawPost._id
    });

    return {
      duplicate: true,
      rawPost: existingRawPost,
      event: existingEvent
    };
  }

  const rawPost = await RawPostModel.create({
    sourceId: source._id,
    text: params.text,
    hash,
    fetchedAt: new Date()
  });

  const event = await createEventFromRawPost({
    sourceId: source._id,
    rawPostId: rawPost._id,
    text: params.text
  });

  return {
    duplicate: false,
    rawPost,
    event
  };
}

export async function createEventFromRawPost(params) {
  const source = await SourceModel.findById(params.sourceId);

  if (!source) {
    throw new Error('Source not found');
  }

  const existingEvent = await EventModel.findOne({
    rawPostId: params.rawPostId
  });

  if (existingEvent) {
    return existingEvent;
  }

  const classification = classifyEvent(params.text);

  if (!classification) {
    return null;
  }

  const precisionLevel = enforceSafePrecision(classification.precisionLevel);

  const shouldApprove = canAutoApprove({
    sourceTrustLevel: source.trustLevel,
    confidence: classification.confidence,
    precisionLevel
  });

  const event = await EventModel.create({
    title: classification.title,
    description: sanitizePublicText(classification.description),
    eventType: classification.eventType,

    city: classification.city,
    district: classification.district,
    locationText: classification.locationText,
    precisionLevel,

    confidence: classification.confidence,
    status: shouldApprove ? 'approved' : 'candidate',

    sourceId: params.sourceId,
    rawPostId: params.rawPostId,

    approvedAt: shouldApprove ? new Date() : undefined
  });

  return event;
}

export async function listApprovedEvents() {
  return EventModel.find({ status: 'approved' })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate('sourceId')
    .lean();
}

export async function listCandidateEvents() {
  return EventModel.find({ status: 'candidate' })
    .sort({ createdAt: -1 })
    .limit(100)
    .populate('sourceId')
    .lean();
}

export async function listAllEvents() {
  return EventModel.find()
    .sort({ createdAt: -1 })
    .limit(100)
    .populate('sourceId')
    .lean();
}

export async function approveEvent(eventId) {
  return EventModel.findByIdAndUpdate(
    eventId,
    {
      status: 'approved',
      approvedAt: new Date()
    },
    {
      new: true
    }
  );
}

export async function rejectEvent(eventId) {
  return EventModel.findByIdAndUpdate(
    eventId,
    {
      status: 'rejected'
    },
    {
      new: true
    }
  );
}
