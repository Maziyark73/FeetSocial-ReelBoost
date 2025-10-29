const supabase = require('../../../lib/supabaseClient');

const getReports = async (
    filterPayload = {},
    pagination = { page: 1, pageSize: 10 },
    include = [], // default to empty array if not provided,
    order = [['createdAt', 'DESC']] // default to empty array if not provided
) => {
    try {
        const { page = 1, pageSize = 10 } = pagination;
        const offset = (page - 1) * pageSize;
        
        let query = supabase
            .from('reports')
            .select('*, report_types:report_type_id(*)', { count: 'exact' });

        // Apply filters
        Object.entries(filterPayload || {}).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                query = query.eq(key, value);
            }
        });

        // Order (first clause only)
        if (order && Array.isArray(order) && order.length > 0) {
            let [orderBy, dir] = order[0];
            orderBy = orderBy.replace(/([A-Z])/g, '_$1').toLowerCase();
            query = query.order(orderBy, { ascending: dir.toUpperCase() !== 'DESC' });
        }

        // Pagination
        query = query.range(offset, offset + pageSize - 1);

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
        console.log(error);
        throw new Error("Could not retrieve reports");
    }
};




async function getReport(reprtPayload) {
    let query = supabase.from('reports').select('*');
    Object.entries(reprtPayload || {}).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            query = query.eq(key, value);
        }
    });
    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    return data;
}

async function createReportUser(reportPayload) {
    try {

        const { data, error } = await supabase
            .from('reports')
            .insert([reportPayload])
            .select()
            .maybeSingle();
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error creating report user:', error);
        throw error;
    }
}
async function updateReportUser(reportPayload, condition) {
    try {
        let query = supabase.from('reports').update(reportPayload);
        Object.entries(condition || {}).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                query = query.eq(key, value);
            }
        });
        const { data, error } = await query.select();
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error updating report User:', error);
        throw error;
    }
}

module.exports = {
    getReports,
    getReport,
    createReportUser,
    updateReportUser,
};