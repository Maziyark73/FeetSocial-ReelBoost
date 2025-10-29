const supabase = require('../../../lib/supabaseClient');
const { getLike } = require('./Like.service');


async function createComment(commentPayload) {
    try {
        const { data, error } = await supabase
            .from('comments')
            .insert([commentPayload])
            .select()
            .maybeSingle();
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error in comment', error);
        throw error;
    }
}

async function getComment(commentPayload, includeOptions = [], pagination = { page: 1, pageSize: 10 }) {
    try {
        const { page = 1, pageSize = 10 } = pagination;
        const offset = (Number(page) - 1) * Number(pageSize);
        const limit = Number(pageSize);


        // Build Supabase query
        let query = supabase
            .from('comments')
            .select('*, users:comment_by(*)', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        // Apply filters
        Object.entries(commentPayload || {}).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                query = query.eq(key, value);
            }
        });

        const { data: rows, count, error } = await query;
        if (error) throw error;

        const rowsWithReplyCount = await Promise.all(
            (rows || []).map(async (comment) => {
                const { count: replyCount } = await supabase
                    .from('comments')
                    .select('*', { count: 'exact', head: true })
                    .eq('comment_ref_id', comment.comment_id);

                const likes = await getLike({ comment_id: comment.comment_id });

                return {
                    ...comment,
                    reply_count: replyCount || 0,
                    like_count: likes.Pagination.total_records,
                };
            })
        );

        // Prepare the structured response
        return {
            Records: rowsWithReplyCount,
            Pagination: {
                total_pages: Math.ceil(count / pageSize),
                total_records: Number(count),
                current_page: Number(page),
                records_per_page: Number(pageSize),
            },
        };
    } catch (error) {
        console.error("Error in fetching Comments:", error);
        throw error;
    }
}


async function updateComent(commentPayload, condition) {
    try {
        let query = supabase.from('comments').update(commentPayload);
        Object.entries(condition || {}).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                query = query.eq(key, value);
            }
        });
        const { data, error } = await query.select();
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error in update Comment', error);
        throw error;
    }
}

async function deleteComment(commentPayload) {
    try {
        let query = supabase.from('comments').delete();
        Object.entries(commentPayload || {}).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                query = query.eq(key, value);
            }
        });
        const { error } = await query;
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error in Deleting Comment', error);
        throw error;
    }
}


module.exports = {
    createComment,
    updateComent,
    deleteComment,
    getComment
};


