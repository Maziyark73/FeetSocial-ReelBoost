const supabase = require('../../../lib/supabaseClient');


async function createGiftCategory(gift_categoryPayload) {
    try {
        const { data, error } = await supabase
            .from('gift_categories')
            .insert([gift_categoryPayload])
            .select()
            .maybeSingle();
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error creating Gift Category:', error);
        throw error;
    }
}
async function getGiftcategory(gift_categoryPayload, pagination = { page: 1, pageSize: 10 }, excludedUserIds = []) {
    try {
        // Destructure and ensure proper types for pagination values
        const { page = 1, pageSize = 10 } = pagination;
        const offset = (Number(page) - 1) * Number(pageSize);
        const limit = Number(pageSize);

        let query = supabase
            .from('gift_categories')
            .select('*', { count: 'exact' })
            .range(offset, offset + limit - 1)
            .order('created_at', { ascending: false });

        Object.entries(gift_categoryPayload || {}).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                query = query.eq(key, value);
            }
        });

        if (!gift_categoryPayload?.user_id && excludedUserIds && excludedUserIds.length > 0) {
            query = query.not('user_id', 'in', `(${excludedUserIds.join(',')})`);
        }

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
        console.error('Error fetching Gift Category:', error);
        throw error;
    }
}
async function updateGiftcategory(gift_categoryPayload, updateData, excludedUserIds = []) {
    try {
        let query = supabase.from('gift_categories').update(updateData);
        Object.entries(gift_categoryPayload || {}).forEach(([key, value]) => {
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

async function deleteGiftcategory(gift_categoryPayload) {
    try {
        let query = supabase.from('gift_categories').delete();
        Object.entries(gift_categoryPayload || {}).forEach(([key, value]) => {
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
        console.error('Error deleting Gift Category:', error);
        throw error;
    }
}


module.exports = {
    createGiftCategory,
    getGiftcategory,
    updateGiftcategory,
    deleteGiftcategory
}