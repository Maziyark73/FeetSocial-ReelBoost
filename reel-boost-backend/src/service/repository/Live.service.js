const { v4: uuidv4 } = require('uuid');
const supabase = require('../../../lib/supabaseClient');


async function createLive(livePayload) {
    try {
        const { data, error } = await supabase
            .from('lives')
            .insert([livePayload])
            .select()
            .maybeSingle();
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error creating Live:', error);
        throw error;
    }
}
async function getLive(livePayload, pagination = { page: 1, pageSize: 10 }, excludedUserIds = [], order = [['createdAt', 'DESC']]) {
    try {
        const { page = 1, pageSize = 10 } = pagination;
        const from = (Number(page) - 1) * Number(pageSize);
        const to = from + Number(pageSize) - 1;

        let query = supabase
            .from('lives')
            .select('*, live_hosts(*), users:user_id(*)', { count: 'exact' })
            .range(from, to);

        // Apply filters
        Object.entries(livePayload || {}).forEach(([key, value]) => {
            if (value === undefined || value === null) return;
            if (key === 'live_status' && value === '') return; // ignore empty
            query = query.eq(key, value);
        });

        // Exclusions
        if (!livePayload?.user_id && excludedUserIds && excludedUserIds.length > 0) {
            query = query.not('user_id', 'in', `(${excludedUserIds.join(',')})`);
        }

        // Order (first clause only)
        if (order && Array.isArray(order) && order.length > 0) {
            let [orderBy, dir] = order[0];
            orderBy = orderBy.replace(/([A-Z])/g, '_$1').toLowerCase();
            query = query.order(orderBy, { ascending: dir.toUpperCase() !== 'DESC' });
        }

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
        console.error('Error fetching Live:', error);
        throw error;
    }
}
async function updateLive(livePayload, updateData, excludedUserIds = []) {
    try {
        let query = supabase.from('lives').update(updateData);
        Object.entries(livePayload || {}).forEach(([key, value]) => {
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
        console.error('Error updating Live:', error);
        throw error;
    }
}

async function deleteLive(livePayload) {
    try {
        let query = supabase.from('lives').update({ live_status: 'stopped' });
        Object.entries(livePayload || {}).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                query = query.eq(key, value);
            }
        });
        const { data, error } = await query.select();
        if (error) throw error;
        return {
            message: (data && data.length) ? 'Delete successful' : 'No records deleted',
            deleted_count: data ? data.length : 0,
        };
    } catch (error) {
        console.error('Error deleting Live:', error);
        throw error;
    }
}

async function getLiveCount(livePayload) {
    try {
        let query = supabase.from('lives').select('*', { count: 'exact', head: true });
        Object.entries(livePayload || {}).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                query = query.eq(key, value);
            }
        });
        const { count, error } = await query;
        if (error) throw error;
        return count || 0;
    } catch (error) {
        console.error('Error in Live count:', error);
    }
}

/**
 * Generate a unique room ID
 * @returns {string} - Unique room ID
 */
const generateRoomId = () => {
    const roomId = uuidv4().replace(/-/g, ''); // Remove dashes for a cleaner ID
    return roomId;
};


module.exports = {
    createLive,
    getLive,
    updateLive,
    deleteLive,
    generateRoomId,
    getLiveCount
}