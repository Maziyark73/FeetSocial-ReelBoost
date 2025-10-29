const supabase = require('../../../lib/supabaseClient');


async function createBlock(blockPayload) {
    try {
        const { data, error } = await supabase
            .from('blocks')
            .insert([blockPayload])
            .select()
            .maybeSingle();
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error in blocking:', error);
        throw error;
    }
}

async function getblock(blockPayload, includeOptions = [], pagination = { page: 1, pageSize: 10 } , order = [['createdAt', 'DESC']]) {
    try {
        const { page, pageSize } = pagination;
        const offset = (page - 1) * pageSize;
        const limit = pageSize;

        let query = supabase.from('blocks').select('*', { count: 'exact' });

        Object.entries(blockPayload || {}).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                query = query.eq(key, value);
            }
        });

        if (order && Array.isArray(order) && order.length > 0) {
            let [orderBy, orderDir] = order[0];
            orderBy = orderBy.replace(/([A-Z])/g, '_$1').toLowerCase();
            query = query.order(orderBy, { ascending: orderDir.toUpperCase() !== 'DESC' });
        }

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
        console.error('Error in fetching block list:', error);
        throw error;
    }
}

async function updateblock(blockPayload, blockCondition = {}) {
    try {
        let query = supabase.from('blocks').update(blockPayload);
        Object.entries(blockCondition || {}).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                query = query.eq(key, value);
            }
        });
        const { data, error } = await query.select();
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error in block:', error);
        throw error;
    }
}
async function deleteBlock(blockPayload) {
    try {
        let query = supabase.from('blocks').delete();
        Object.entries(blockPayload || {}).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                query = query.eq(key, value);
            }
        });
        const { error } = await query;
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error in Unblocking:', error);
        throw error;
    }
}

async function isBlocked(blockPayload) {
    try {
        let query = supabase.from('blocks').select('*');
        Object.entries(blockPayload || {}).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                query = query.eq(key, value);
            }
        });
        const { data, error } = await query.maybeSingle();
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error in blocking:', error);
        throw error;
    }
}



module.exports = {
    isBlocked,

    createBlock,
    deleteBlock,
    getblock
};