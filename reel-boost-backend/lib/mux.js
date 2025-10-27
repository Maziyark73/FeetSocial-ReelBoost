require('dotenv').config();
const Mux = require('@mux/mux-node');

// Initialize Mux client with credentials from environment
const muxClient = new Mux({
  tokenId: process.env.MUX_TOKEN_ID || process.env.MUX_TOKEN,
  tokenSecret: process.env.MUX_TOKEN_SECRET || process.env.MUX_SECRET,
});

/**
 * Create a live stream
 * @param {object} params - Stream parameters
 * @returns {Promise<object>} Stream details
 */
async function createLiveStream(params = {}) {
  try {
    if (!process.env.MUX_TOKEN_ID && !process.env.MUX_TOKEN) {
      throw new Error('Mux credentials not configured');
    }

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
async function getLiveStream(streamId) {
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
async function deleteLiveStream(streamId) {
  try {
    await muxClient.Video.LiveStreams.del(streamId);
    return true;
  } catch (error) {
    console.error('Error deleting Mux live stream:', error);
    return false;
  }
}

module.exports = muxClient;
module.exports.createLiveStream = createLiveStream;
module.exports.getLiveStream = getLiveStream;
module.exports.deleteLiveStream = deleteLiveStream;

// Uses MUX_TOKEN_ID and MUX_TOKEN_SECRET from environment variables
