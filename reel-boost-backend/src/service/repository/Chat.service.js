const supabase = require('../../../lib/supabaseClient');
const { toJSONWithAssociations } = require('../../helper/json.hleper');


async function createChat(chatPayload) {
    try {
        const { data, error } = await supabase
            .from('chats')
            .insert([chatPayload])
            .select()
            .maybeSingle();
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error in Creating chat', error);
        throw error;
    }
}

async function getChats(chatPayload, includeOptions = [], pagination = { page: 1, pageSize: 10 }, foreignKeysConfig) {
    try {
        const { page, pageSize } = pagination;

        // Calculate offset and limit for pagination
        const offset = (page - 1) * pageSize;
        const limit = pageSize;

        let query = supabase
            .from('chats')
            .select('*, messages(*), participants(*), users:created_by(*)', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        Object.entries(chatPayload || {}).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                query = query.eq(key, value);
            }
        });

        const { data: rows, count, error } = await query;
        if (error) throw error;

        const rowsData = await toJSONWithAssociations(rows || [], foreignKeysConfig);

        

        rowsData.map((row) => {
            // Iterate through the Messages array
            row.Messages.forEach((message) => {
                // Check the social_id of each message
                if (message.social_id == 0 || message.social_id === null) {
                    // Set Social to an empty array if social_id is null or 0
                    message.Social = {};
                }
            });
        });
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
        console.error("Error in fetching chats:", error);
        throw error;
    }
}

async function isGroup(chat_id) {
    try {
        const { data, error } = await supabase
            .from('chats')
            .select('*')
            .eq('chat_id', chat_id)
            .eq('chat_type', 'Group')
            .maybeSingle();
        if (error) throw error;
        return data;
    }
    catch (error) {
        console.error("Error in checking group:", error);
        throw error;
    }
}



module.exports = {
    createChat,
    getChats,
    isGroup
};


