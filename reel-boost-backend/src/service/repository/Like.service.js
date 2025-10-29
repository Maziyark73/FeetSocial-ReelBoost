const supabase = require('../../../lib/supabaseClient');


async function createLike(likePayload) {
    try {
        const { data, error } = await supabase
            .from('likes')
            .insert([likePayload])
            .select()
            .maybeSingle();
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error in like', error);
        throw error;
    }
}

async function getLike(likePayload, includeOptions = [], attributesOptions = {} ,pagination = { page: 1, pageSize: 10 }, ) {
    try {
        const { page, pageSize } = pagination;
        
        // Calculate offset and limit for pagination
        const offset = (page - 1) * pageSize;
        const limit = pageSize;

        let query = supabase.from('likes').select('*', { count: 'exact' });

        // Apply filters
        Object.entries(likePayload || {}).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                query = query.eq(key, value);
            }
        });

        query = query.range(offset, offset + limit - 1);

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
        console.error('Error in fetching likes:', error);
        throw error;
    }
}

async function updateLike(likePayload, likeCondition = {}) {
    try {
        let query = supabase.from('likes').update(likePayload);
        Object.entries(likeCondition || {}).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                query = query.eq(key, value);
            }
        });
        const { data, error } = await query.select();
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error in like', error);
        throw error;
    }
}

async function deleteLike(likePayload) {
    try {
        let query = supabase.from('likes').delete();
        Object.entries(likePayload || {}).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                query = query.eq(key, value);
            }
        });
        const { error } = await query;
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error in like', error);
        throw error;
    }
}


module.exports = {
    createLike,
    updateLike,
    deleteLike,
    getLike
};