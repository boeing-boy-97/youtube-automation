/**
 * Content domain types shared between API and web client.
 */

export type CanonicalContentState =
  | 'IDEA' | 'DRAFT' | 'SCRIPT_GENERATING' | 'SCRIPT_READY'
  | 'VOICE_GENERATING' | 'VOICE_READY' | 'VISUALS_GENERATING' | 'VISUALS_READY'
  | 'RENDERING' | 'RENDERED' | 'QUALITY_CHECKING' | 'REVIEW'
  | 'APPROVED' | 'SCHEDULED' | 'PUBLISHING' | 'PUBLISHED'
  | 'FAILED' | 'ARCHIVED' | 'CANCELLED';

export interface ContentMetadata {
  title: string;
  hook?: string;
  description?: string;
  tags?: string[];
  durationSeconds?: number;
  aspectRatio?: '9:16' | '16:9' | '1:1';
}
