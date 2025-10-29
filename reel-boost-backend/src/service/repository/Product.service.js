const supabase = require('../../../lib/supabaseClient');


async function createProduct(productPayload) {
    try {
        const { data, error } = await supabase
            .from('products')
            .insert([productPayload])
            .select()
            .maybeSingle();
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error creating Product:', error);
        throw error;
    }
}

async function getProduct(productPayload, pagination = { page: 1, pageSize: 10 }, excludedUserIds = []) {
    try {
        // Destructure and ensure proper types for pagination values
        const { page = 1, pageSize = 10 } = pagination;
        const offset = (Number(page) - 1) * Number(pageSize);
        const limit = Number(pageSize);

        // Build Supabase query with joins
        let query = supabase
            .from('products')
            .select('*, product_medias:product_id(*), users:user_id(*)', { count: 'exact' })
            .range(offset, offset + limit - 1);

        // Filters
        Object.entries(productPayload || {}).forEach(([key, value]) => {
            if (value === undefined || value === null) return;
            if (key === 'product_title') {
                query = query.ilike('product_title', `${value}%`);
            } else {
                query = query.eq(key, value);
            }
        });

        if (!productPayload?.user_id && excludedUserIds && excludedUserIds.length > 0) {
            query = query.not('user_id', 'in', `(${excludedUserIds.join(',')})`);
        }

        // Order
        query = query.order('created_at', { ascending: false });

        const { data: rows, count, error } = await query;
        if (error) throw error;

        // Return the structured response with pagination
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
        console.error('Error fetching Products:', error);
        throw error;
    }
}

async function updateProduct(productPayload, updateData) {
    try {
        let query = supabase.from('products').update(updateData);
        Object.entries(productPayload || {}).forEach(([key, value]) => {
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
        console.error('Error updating Product:', error);
        throw error;
    }
}

async function deleteProduct(productPayload) {
    try {
        let query = supabase.from('products').delete();
        Object.entries(productPayload || {}).forEach(([key, value]) => {
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
        console.error('Error deleting Product:', error);
        throw error;
    }
}




module.exports = {
    createProduct,
    getProduct,
    updateProduct,
    deleteProduct
}