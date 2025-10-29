const supabase = require('../../../lib/supabaseClient');


async function createGift(gift_payload) {
    try {
        const { data, error } = await supabase
            .from('gifts')
            .insert([gift_payload])
            .select()
            .maybeSingle();
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error creating Gift:', error);
        throw error;
    }
}
async function getGift(gift_payload, pagination = { page: 1, pageSize: 10 }, excludedUserIds = [], includeOptions = []) {
    try {
        // Destructure and ensure proper types for pagination values
        const { page = 1, pageSize = 10 } = pagination;
        const offset = (Number(page) - 1) * Number(pageSize);
        const limit = Number(pageSize);

        let query = supabase
            .from('gifts')
            .select('*, gift_categories:gift_category_id(*)', { count: 'exact' })
            .range(offset, offset + limit - 1);

        if (gift_payload?.name) {
            query = query.ilike('name', `%${gift_payload.name}%`);
        }
        Object.entries(gift_payload || {}).forEach(([key, value]) => {
            if (value !== undefined && value !== null && key !== 'name') {
                query = query.eq(key, value);
            }
        });

        if (!gift_payload?.user_id && excludedUserIds && excludedUserIds.length > 0) {
            query = query.not('user_id', 'in', `(${excludedUserIds.join(',')})`);
        }

        query = query.order('created_at', { ascending: false });

        const { data: rows, count, error } = await query;
        if (error) throw error;
        
        // Prepare the structured response
        return {
            Records: rows,
            Pagination: {
                total_pages: Math.ceil(count / pageSize),
                total_records: Number(count),
                current_page: Number(page),
                records_per_page: Number(pageSize),
            },
        };
    } catch (error) {
        console.error('Error fetching Gift:', error);
        throw error;
    }
}
async function updateGift(gift_payload, updateData, excludedUserIds = []) {
    try {
        let query = supabase.from('gifts').update(updateData);
        Object.entries(gift_payload || {}).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                query = query.eq(key, value);
            }
        });
        const { data, error } = await query.select();
        if (error) throw error;
        const updatedCount = data ? data.length : 0;
        return {
            message: updatedCount > 0 ? 'Update successful' : 'No records updated',
            updated_count: updatedCount,
        };
    } catch (error) {
        console.error('Error updating Gift  Category:', error);
        throw error;
    }
}

async function deleteGift(gift_payload) {
    try {
        let query = supabase.from('gifts').delete();
        Object.entries(gift_payload || {}).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                query = query.eq(key, value);
            }
        });
        const { error } = await query;
        if (error) throw error;
        return {
            message: 'Delete successful',
            deleted_count: 1,
        };
    } catch (error) {
        console.error('Error deleting Gift:', error);
        throw error;
    }
}


module.exports = {
    createGift,
    getGift,
    updateGift,
    deleteGift
}