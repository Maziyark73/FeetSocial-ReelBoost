const supabase = require('../../../lib/supabaseClient');
const { toJSONWithAssociations } = require("../../helper/json.hleper");

async function createMessage(messagePayload) {
    try {
        const { data, error } = await supabase
            .from('messages')
            .insert([messagePayload])
            .select()
            .maybeSingle();
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error in Creating Message', error);
        throw error;
    }
}

async function getMessages(messagePayload, includeOptions = [], pagination = { page: 1, pageSize: 10 }, foreignKeysConfig = []) {
    try {
        const { page, pageSize } = pagination;

        // Calculate offset and limit for pagination
        const offset = (page - 1) * pageSize;
        const limit = pageSize;

        let query = supabase
            .from('messages')
            .select('*, users:sender_id(*), chats:chat_id(*)', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        Object.entries(messagePayload || {}).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                query = query.eq(key, value);
            }
        });

        const { data: rows, count, error } = await query;
        if (error) throw error;

        const rowsData = await toJSONWithAssociations(rows || [], foreignKeysConfig);

        // Prepare the structured response
        return {
            Records: rowsData,
            Pagination: {
                total_pages: Math.ceil((count || 0) / pageSize),
                total_records: count || 0,
                current_page: page,
                records_per_page: pageSize,
            },
        };
    } catch (error) {
        console.error("Error in fetching Messages:", error);
        throw error;
    }
}


async function updateMessage(filter, updateData) {
    try {
        let query = supabase.from('messages').update(updateData);
        Object.entries(filter || {}).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                query = query.eq(key, value);
            }
        });
        const { data, error } = await query.select();
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error in Updating Message:', error);
        throw error;
    }
}

const getMessage = async (messagePayload) => {
    try {
        let query = supabase.from('messages').select('*');
        Object.entries(messagePayload || {}).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                query = query.eq(key, value);
            }
        });
        const { data, error } = await query.maybeSingle();
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error in fetching Message:', error);
        throw error;
    }
};

module.exports = {
    createMessage,
    getMessages,
    updateMessage,
    getMessage
};
