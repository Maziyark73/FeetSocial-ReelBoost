const supabase = require('../../../lib/supabaseClient');


async function createFollow(followPayload) {
    try {
        const { data, error } = await supabase
            .from('follows')
            .insert([followPayload])
            .select()
            .maybeSingle();
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error in following:', error);
        throw error;
    }
}
async function getFollow(followPayload, includeOptions = [], pagination = { page: 1, pageSize: 10 }) {
    try {
        let { page, pageSize } = pagination;
        page = Number(page);
        pageSize = Number(pageSize);
        const offset = (page - 1) * pageSize;
        const limit = pageSize;

        let query = supabase.from('follows').select('*', { count: 'exact' });

        Object.entries(followPayload || {}).forEach(([key, value]) => {
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
                total_records: Number(count) || 0,
                current_page: Number(page),
                records_per_page: Number(pageSize),
            },
        };
    } catch (error) {
        console.error('Error in fetching follows:', error);
        throw error;
    }
}

async function updateFollow(followPayload , followCondition = {}) {
    try {
        let query = supabase.from('follows').update(followPayload);
        Object.entries(followCondition || {}).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                query = query.eq(key, value);
            }
        });
        const { data, error } = await query.select();
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error in following:', error);
        throw error;
    }
}
async function deleteFollow(followPayload ) {
    try {
        let query = supabase.from('follows').delete();
        Object.entries(followPayload || {}).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                query = query.eq(key, value);
            }
        });
        const { error } = await query;
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error in unfollowing following:', error);
        throw error;
    }
}

async function isFollow(followPayload) {
    try {
        let query = supabase.from('follows').select('*');
        Object.entries(followPayload || {}).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                query = query.eq(key, value);
            }
        });
        const { data, error } = await query.maybeSingle();
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error in following:', error);
        throw error;
    }
}



module.exports = {
    isFollow,
    createFollow,
    updateFollow,
    deleteFollow,
    getFollow
};