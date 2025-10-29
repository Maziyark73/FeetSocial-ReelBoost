const supabase = require('../../../lib/supabaseClient');

/**
 * Creates a new social record using Supabase.
 */
async function createSocial(socialPayload) {
    try {
        // Insert a new record into socials
        const { data: newSocial, error } = await supabase
            .from('socials')
            .insert([socialPayload])
            .select()
            .maybeSingle();
        if (error) throw error;
        return newSocial;
    } catch (error) {
        console.error('Error creating Social:', error);
        throw error;
    }
}

/**
 * Retrieves social records from Supabase with pagination and basic filtering.
 */
async function getSocial(
    socialPayload,
    pagination = { page: 1, pageSize: 10 },
    excludedUserIds = [],
    order = [['createdAt', 'DESC']],
) {
    try {
        const { page = 1, pageSize = 10 } = pagination;
        const from = (Number(page) - 1) * Number(pageSize);
        const to = from + Number(pageSize) - 1;

        let query = supabase.from('socials').select('*', { count: 'exact' });

        // Apply filters from socialPayload
        if (socialPayload) {
            Object.entries(socialPayload).forEach(([key, value]) => {
                if (value === undefined || value === null) return;
                
                // For user_name -> join with users view/table, need extra
                if (key === 'user_name') {
                    // Can't join directly, need a view/remote join, fallback to not filtering here
                    return;
                }

                // For hashtag search
                if (key === 'hashtag') {
                    // Simulate LIKE search on array
                    // Column 'hashtag' must be text[] and using ilike on any element
                    // This needs a PostgREST custom function or a filter if hashtags are flat text...
                    query = query.contains('hashtag', [value]);
                    return;
                }

                query = query.eq(key, value);
            });
        }

        // Exclude user_ids if provided and no specific user_id search
        if (!socialPayload?.user_id && excludedUserIds && excludedUserIds.length > 0) {
            query = query.not('user_id', 'in', `(${excludedUserIds.join(',')})`);
        }

        // Pagination
        query = query.range(from, to);

        // Ordering (translate [['createdAt', 'DESC']])
        if (order && Array.isArray(order) && order.length > 0) {
            // Only supports one order clause for now
            let [orderBy, orderDir] = order[0];
            // Convert camelCase to snake_case
            orderBy = orderBy.replace(/([A-Z])/g, '_$1').toLowerCase();
            query = query.order(orderBy, { ascending: orderDir.toUpperCase() !== 'DESC' ? true : false });
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
        console.error('Error fetching Social:', error);
        throw error;
    }
}

/**
 * Updates social records in Supabase based on condition.
 */
async function updateSocial(socialPayload, updateData, excludedUserIds = []) {
    try {
        let query = supabase.from('socials').update(updateData);

        if (socialPayload && Object.keys(socialPayload).length > 0) {
            Object.entries(socialPayload).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    query = query.eq(key, value);
                }
            });
        }

        // Exclude user_ids if provided and no user_id is in payload
        if (!socialPayload?.user_id && excludedUserIds && excludedUserIds.length > 0) {
            query = query.not('user_id', 'in', `(${excludedUserIds.join(',')})`);
        }

        const { data, error } = await query.select();
        if (error) throw error;
        const updatedCount = data ? data.length : 0;

        return {
            message: updatedCount > 0 ? 'Update successful' : 'No records updated',
            updated_count: updatedCount,
        };
    } catch (error) {
        console.error('Error updating Social:', error);
        throw error;
    }
}

/**
 * Deletes social records in Supabase matching the specified payload.
 */
async function deleteSocial(socialPayload) {
    try {
        let query = supabase.from('socials').delete();

        Object.keys(socialPayload).forEach((key) => {
            query = query.eq(key, socialPayload[key]);
        });

        const { count, error } = await query;
        if (error) throw error;

        // Note: Supabase delete does not return deleted rows, count may be undefined based on config
        // Default to 1
        const deletedCount = count !== undefined ? count : 1;

        return {
            message: deletedCount > 0 ? 'Delete successful' : 'No records deleted',
            deleted_count: deletedCount,
        };
    } catch (error) {
        console.error('Error deleting Social:', error);
        throw error;
    }
}

/**
 * Counts social records in Supabase that match a payload.
 */
async function getSocialCount(socialPayload) {
    try {
        let query = supabase.from('socials').select('*', { count: 'exact', head: true });

        if (socialPayload) {
            Object.entries(socialPayload).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    query = query.eq(key, value);
                }
            });
        }

        const { count, error } = await query;
        if (error) throw error;
        return count || 0;
    } catch (error) {
        console.error('Error in Social count:', error);
        throw error;
    }
}

/**
 * Retrieves social records belonging to the users followed by a specific user.
 */
async function getFollowerSocials(
    user_id,
    pagination = { page: 1, pageSize: 10 },
    order = [['createdAt', 'DESC']]
) {
    try {
        const { page = 1, pageSize = 10 } = pagination;
        const from = (Number(page) - 1) * Number(pageSize);
        const to = from + Number(pageSize) - 1;

        // This query assumes a view or policy exists to allow joining socials with Follows table via RPC or join
        // As a workaround: filter socials where user_id is in (select user_id from Follows where follower_id = user_id and approved = true)
        // Otherwise, cannot join in vanilla PostgREST – need a custom function or denormalized view!
        // For this code, we use 'in' with a subquery supported by Supabase PostgREST

        // Step 1: Get the list of user_ids the user follows (approved)
        const { data: followees, error: followError } = await supabase
            .from('follows')
            .select('user_id')
            .eq('follower_id', user_id)
            .eq('approved', true);

        if (followError) throw followError;
        const followedUserIds = (followees || []).map(f => f.user_id);
        if (!followedUserIds.length) {
            return {
                Records: [],
                Pagination: {
                    total_pages: 0,
                    total_records: 0,
                    current_page: Number(page),
                    records_per_page: Number(pageSize),
                },
            };
        }

        let query = supabase
            .from('socials')
            .select('*', { count: 'exact' })
            .eq('status', true)
            .eq('deleted_by_user', false)
            .in('user_id', followedUserIds)
            .range(from, to);

        if (order && Array.isArray(order) && order.length > 0) {
            let [orderBy, orderDir] = order[0];
            // Convert camelCase to snake_case
            orderBy = orderBy.replace(/([A-Z])/g, '_$1').toLowerCase();
            query = query.order(orderBy, { ascending: orderDir.toUpperCase() !== 'DESC' ? true : false });
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
        console.error('Error in getFollowerSocials:', error);
        throw error;
    }
}


module.exports = {
    createSocial,
    getSocial,
    updateSocial,
    deleteSocial,
    getSocialCount,
    getFollowerSocials
}