const supabase = require('../../../lib/supabaseClient');
const { translateText } = require('../common/translate.service');

async function createLanguage(languagePayload) {
    try {
        const { data, error } = await supabase
            .from('languages')
            .insert([languagePayload])
            .select()
            .maybeSingle();
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error creating Language:', error);
        throw error;
    }
}

async function getLanguages(filter = {}, pagination = { page: 1, pageSize: 10 }, order = [['createdAt', 'DESC']]) {
    try {
        const { page = 1, pageSize = 10 } = pagination;
        const from = (Number(page) - 1) * Number(pageSize);
        const to = from + Number(pageSize) - 1;

        let query = supabase
            .from('languages')
            .select('*', { count: 'exact' })
            .range(from, to);

        Object.entries(filter || {}).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                query = query.eq(key, value);
            }
        });

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
        console.error('Error fetching Language:', error);
        throw error;
    }
}

async function updateLanguage(filter, updateData) {
    try {
        let query = supabase.from('languages').update(updateData);
        Object.entries(filter || {}).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                query = query.eq(key, value);
            }
        });
        const { data, error } = await query.select();
        if (error) throw error;
        return {
            message: (data && data.length) ? 'Update successful' : 'No records updated',
            updated_count: data ? data.length : 0,
        };
    } catch (error) {
        console.error('Error updating Language:', error);
        throw error;
    }
}

// NOTE: These operations require SQL DDL or server-side logic.
// Create a Postgres function (RPC) in Supabase named 'create_language_translation'
// that performs the column creation and initialization.
async function createLanguageTranslation(language_payload) {
    try {
        const { data, error } = await supabase.rpc('create_language_translation', language_payload);
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error creating Language Translation:', error);
        throw error;
    }
}

// TODO: Implement an RPC 'get_language_keywords' in Supabase for dynamic column selection
async function getKeywords(filterPayload, pagination = { page: 1, pageSize: 10 }) {
    try {
        const { data, error } = await supabase.rpc('get_language_keywords', {
            language: filterPayload.language,
            page: pagination.page,
            page_size: pagination.pageSize,
        });
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching Language Keywords:', error);
        throw error;
    }
}

// TODO: Implement an RPC 'get_language_translation' that returns key->translation pairs
async function getLanguageTranslation( target_language ){
    try {
        const { data, error } = await supabase.rpc('get_language_translation', { target_language });
        if (error) throw error;
        // Fallback: If RPC not set up, translate via external service using keys fetched client-side
        if (!data) {
            const { data: keys, error: keysErr } = await supabase
                .from('language_translations')
                .select('key_id,key');
            if (keysErr) throw keysErr;
            const jsonData = (keys || []).reduce((acc, row) => {
                acc[row.key_id] = row.key;
                return acc;
            }, {});
            const requestData = { json_data: jsonData, target_language };
            return await translateText(requestData);
        }
        return data;
    } catch (error) {
        console.error('Error fetching Language Translation:', error);
        throw error;
    }
}


module.exports = {
    createLanguage,
    getLanguages,
    updateLanguage,
    createLanguageTranslation,
    getLanguageTranslation,
    getKeywords
};