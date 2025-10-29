const supabase = require('../../../lib/supabaseClient');
const chat_service = require('./Chat.service');
const { toJSONWithAssociations } = require('../../helper/json.hleper');


async function createParticipant(participantPayload) {
  try {
    const { data, error } = await supabase
      .from('participants')
      .insert([participantPayload])
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error in Creating Participant', error);
    throw error;
  }
}

async function getParticipant(participantPayload, includeOptions = [], pagination = { page: 1, pageSize: 10 }) {
  try {
    const { page, pageSize } = pagination;

    // Calculate offset and limit for pagination
    const offset = (page - 1) * pageSize;
    const limit = pageSize;

    let query = supabase
      .from('participants')
      .select('*, users:user_id(*), chats:chat_id(*)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    Object.entries(participantPayload || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });

    const { data: rows, count, error } = await query;
    if (error) throw error;

    return {
      Records: rows || [],
      Pagination: {
        total_pages: Math.ceil((count || 0) / pageSize),
        total_records: count || 0,
        current_page: page,
        records_per_page: pageSize,
      },
    };
  } catch (error) {
    console.error("Error in fetching Participant:", error);
    throw error;
  }
}

async function getParticipantWithoutPagenation(participantPayload, includeOptions = []) {
  try {
    let query = supabase
      .from('participants')
      .select('*, users:user_id(*), chats:chat_id(*)')
      .order('updated_at', { ascending: false });

    Object.entries(participantPayload || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });

    const { data: rows, error } = await query;
    if (error) throw error;

    const Jsoned_Rows = await toJSONWithAssociations(rows || [])
    return {
      Records: Jsoned_Rows,
    };
  } catch (error) {
    console.error("Error in fetching Participant:", error);
    throw error;
  }
}


async function alreadyParticipantIndividual(user1, user2) {
  try {
    // Find all participations for user1
    const { data: user1_participations, error: p1err } = await supabase
      .from('participants')
      .select('chat_id')
      .eq('user_id', user1);
    if (p1err) throw p1err;

    // Extract chat IDs
    const user_1_chats = (user1_participations || []).map((p) => p.chat_id);

    // Find common chats where user2 is also a participant
    const { data: commonchats, error: cmnErr } = await supabase
      .from('participants')
      .select('*')
      .eq('user_id', user2)
      .in('chat_id', user_1_chats);
    if (cmnErr) throw cmnErr;

    for (const commonchat of (commonchats || [])) {
      const isGroup = await chat_service.isGroup(commonchat.dataValues.chat_id);
      if (isGroup) {
        return false;
      }

      // ✅ **Update the `updated_at` field**
      const { error: updErr } = await supabase
        .from('participants')
        .update({ update_counter: true })
        .eq('chat_id', commonchat.dataValues.chat_id)
        .in('user_id', [user1, user2]);
      if (updErr) throw updErr;

      return commonchat.dataValues?.chat_id ?? commonchat.chat_id;
    }

    return false; // No existing individual chat found
  } catch (error) {
    console.error("Error in checking chat:", error);
    throw error;
  }
}




module.exports = {
  createParticipant,
  getParticipant,
  alreadyParticipantIndividual,
  getParticipantWithoutPagenation
};


