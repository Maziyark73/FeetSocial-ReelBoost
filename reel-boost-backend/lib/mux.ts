import Mux from '@mux/mux-node';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Mux client with credentials from environment
const muxClient = new Mux({
  tokenId: process.env.MUX_TOKEN,
  tokenSecret: process.env.MUX_SECRET,
});

/**
 * Create a live stream
 * @param {object} params - Stream parameters
 * @returns {Promise<object>} Stream details
 */
async function createLiveStream(params = {}) {
  try {
    const stream = await muxClient.Video.LiveStreams.create({
      playback_ids: [{ policy: 'public' }],
      ...params,
    });
    
    return {
      id: stream.id,
      streamKey: stream.stream_key,
      playbackId: stream.playback_ids?.[0]?.id,
      status: stream.status,
    };
  } catch (error) {
    console.error('Error creating Mux live stream:', error);
    throw error;
  }
}

/**
 * Get live stream details
 * @param {string} streamId - Stream ID
 * @returns {Promise<object>} Stream details
 */
async function getLiveStream(streamId: string) {
  try {
    const stream = await muxClient.Video.LiveStreams.retrieve(streamId);
    return stream;
  } catch (error) {
    console.error('Error retrieving Mux live stream:', error);
    throw error;
  }
}

/**
 * Delete a live stream
 * @param {string} streamId - Stream ID
 * @returns {Promise<boolean>} Success status
 */
async function deleteLiveStream(streamId: string) {
  try {
    await muxClient.Video.LiveStreams.del(streamId);
    return true;
  } catch (error) {
    console.error('Error deleting Mux live stream:', error);
    return false;
  }
}

export default muxClient;
export { createLiveStream, getLiveStream, deleteLiveStream };

// TODO: Ensure MUX_TOKEN and MUX_SECRET from .env are being used correctly
// TODO: Update existing live stream creation code to use this module
// TODO: Add webhook handler for stream status changes
