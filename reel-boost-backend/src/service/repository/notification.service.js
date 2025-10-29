const supabase = require('../../../lib/supabaseClient');


const getNotifications = async (
    filterPayload = {},
    pagination = { page: 1, pageSize: 10 },
    attributes = [],
    order = [['createdAt', 'DESC']]
) => {
    try {

        const { page = 1, pageSize = 10 } = pagination;
        const offset = (Number(page) - 1) * Number(pageSize);
        const limit = Number(pageSize);
        if (!filterPayload.view_status?.trim()) {
            delete filterPayload.view_status;
        }

        let query = supabase
            .from('notifications')
            .select(`*,
                notification_sender:sender_id(user_id,user_name,profile_pic,full_name),
                gifts:gift_id(*),
                socials:social_id(*, medias(*))
            `, { count: 'exact' });

        // Apply filters
        Object.entries(filterPayload || {}).forEach(([key, value]) => {
            if (value === undefined || value === null) return;
            if (key === 'view_status' && typeof value === 'string' && !value.trim()) return;
            query = query.eq(key, value);
        });

        // Order (first clause only)
        if (order && Array.isArray(order) && order.length > 0) {
            let [orderBy, dir] = order[0];
            orderBy = orderBy.replace(/([A-Z])/g, '_$1').toLowerCase();
            query = query.order(orderBy, { ascending: dir.toUpperCase() !== 'DESC' });
        }

        // Pagination
        query = query.range(offset, offset + limit - 1);

        const { data: rows, count, error } = await query;
        if (error) throw error;

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
        console.error('Error fetching Notification:', error);
        throw new Error('Could not retrieve Notification');
    }
};



async function createNotification(notificationPayload) {
    try {

        const { data, error } = await supabase
            .from('notifications')
            .insert([notificationPayload])
            .select()
            .maybeSingle();
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
}

async function updateNotification(notificationPayload, condition) {
    try {
        let query = supabase.from('notifications').update(notificationPayload);
        Object.entries(condition || {}).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                query = query.eq(key, value);
            }
        });
        const { data, error } = await query.select();
        if (error) throw error;
        return data;
    } catch (error) {
        // console.error('Error updating Notification:', error);
        return
    }
}

async function deleteNotification(condition = {}) {
    try {
        let query = supabase.from('notifications').delete();
        Object.entries(condition || {}).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                query = query.eq(key, value);
            }
        });
        const { error } = await query;
        if (error) throw error;
        return { deletedCount: 1 };
    } catch (error) {
        console.error('Error deleting notification:', error);
        throw error;
    }
}





module.exports = {
    getNotifications,
    createNotification,
    updateNotification,
    deleteNotification
};