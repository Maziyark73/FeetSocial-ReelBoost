const supabase = require('../../../lib/supabaseClient');


async function createSave(savePayload) {
    try {
        const { data, error } = await supabase
            .from('saves')
            .insert([savePayload])
            .select()
            .maybeSingle();
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error in save', error);
        throw error;
    }
}

async function getSave(savePayload, includeOptions = [], attributesOptions = {} ,pagination = { page: 1, pageSize: 10 }, ) {
    try {
        
        const { page, pageSize } = pagination;
        
        // Calculate offset and limit for pagination
        const offset = (page - 1) * pageSize;
        const limit = pageSize;

        let query = supabase.from('saves').select('*', { count: 'exact' });

        Object.entries(savePayload || {}).forEach(([key, value]) => {
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
        console.error('Error in fetching save:', error);
        throw error;
    }
}

async function updateSave(savePayload, condition = {}) {
    try {
        let query = supabase.from('saves').update(savePayload);
        Object.entries(condition || {}).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                query = query.eq(key, value);
            }
        });
        const { data, error } = await query.select();
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error in save', error);
        throw error;
    }
}

async function deleteSave(savePayload) {
    try {
        let query = supabase.from('saves').delete();
        Object.entries(savePayload || {}).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                query = query.eq(key, value);
            }
        });
        const { error } = await query;
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error in save', error);
        throw error;
    }
}


module.exports = {
    createSave,
    updateSave,
    deleteSave,
    getSave
};