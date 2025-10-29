const supabase = require('../../../lib/supabaseClient');
const { toJSONWithAssociations } = require("../../helper/json.hleper");

async function createMessageSeen(messagePayload) {
    try {
        const { data, error } = await supabase
            .from('message_seens')
            .insert([messagePayload])
            .select()
            .maybeSingle();
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error in Creating MessageSeen', error);
        throw error;
    }
}

async function updateMessageSeen(filter, updateData) {
    try {
        let query = supabase.from('message_seens').update(updateData);
        Object.entries(filter || {}).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                query = query.eq(key, value);
            }
        });
        const { data, error } = await query.select();
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error in Updating MessageSeen:', error);
        throw error;
    }
}

async function getMessageSeen(messagePayload, includeOptions = [], pagination = { page: 1, pageSize: 10 }, foreignKeysConfig = []) {
    try {
        const { page, pageSize } = pagination;

        // Calculate offset and limit for pagination
        const offset = (page - 1) * pageSize;
        const limit = pageSize;

        let query = supabase
            .from('message_seens')
            .select('*, users:user_id(*), messages:message_id(*)', { count: 'exact' })
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
        console.error("Error in fetching MessageSeen:", error);
        throw error;
    }
}

async function getMessageSeenCount({ andConditions = {}, orConditions = {} }) {
    try {
        let query = supabase.from('message_seens').select('*', { count: 'exact', head: true });

        Object.entries(andConditions || {}).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                query = query.eq(key, value);
            }
        });

        // Supabase .or() takes a CSV of conditions
        const orParts = Object.entries(orConditions || {}).map(([key, value]) => `${key}.eq.${value}`);
        if (orParts.length) {
            query = query.or(orParts.join(','));
        }

        const { count, error } = await query;
        if (error) throw error;
        return { count: count || 0 };
    } catch (error) {
        console.error("Error in fetching MessageSeen counts:", error);
        throw error;
    }
}



module.exports = {
    createMessageSeen,
    getMessageSeen,
    getMessageSeenCount,
    updateMessageSeen
};


