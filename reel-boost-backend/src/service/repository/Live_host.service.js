const supabase = require('../../../lib/supabaseClient');


async function createLiveHost(livePayload) {
    try {
        const { data, error } = await supabase
            .from('live_hosts')
            .insert([livePayload])
            .select()
            .maybeSingle();
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error creating Live_host:', error);
        throw error;
    }
}
async function getLiveLive_host(livePayload, pagination = { page: 1, pageSize: 10 }, excludedUserIds = []) {
    try {
        const { page = 1, pageSize = 10 } = pagination;
        const from = (Number(page) - 1) * Number(pageSize);
        const to = from + Number(pageSize) - 1;

        let query = supabase
            .from('live_hosts')
            .select('*, users:user_id(*)', { count: 'exact' })
            .range(from, to)
            .order('created_at', { ascending: false });

        Object.entries(livePayload || {}).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                query = query.eq(key, value);
            }
        });

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
async function updateLiveHost(livePayload, updateData, excludedUserIds = []) {
    try {
        let query = supabase.from('live_hosts').update(updateData);
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
        console.error('Error updating Live Host:', error);
        throw error;
    }
}

// async function deleteLive(livePayload) {
//     try {
//         // Use the destroy method to delete the records
        
//         const [deletedCount] = await Live.update({ live_status : "stopped"},{ where: livePayload });

//         // Return a structured response
//         return {
//             message: deletedCount > 0 ? 'Delete successful' : 'No records deleted',
//             deleted_count: deletedCount,
//         };
//     } catch (error) {
//         console.error('Error deleting Live:', error);
//         throw error;
//     }
// }

// async function getLiveCount(livePayload) {
//     try {

//         const count = await Live.count({
//             where: livePayload,
//         });

//         return count;
//     } catch (error) {
//         console.error('Error in Live count:', error);
//     }
// }

// /**
//  * Generate a unique room ID
//  * @returns {string} - Unique room ID
//  */
// const generateRoomId = () => {
//     const roomId = uuidv4().replace(/-/g, ''); // Remove dashes for a cleaner ID
//     return roomId;
// };


module.exports = {
    createLiveHost,
    getLiveLive_host,
    updateLiveHost,
    // deleteLive,
    // generateRoomId,
    // getLiveCount
}