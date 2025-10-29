const supabase = require('../../../lib/supabaseClient');

const getReport_types = async () => {
    try {
        const { data, error } = await supabase
            .from('report_types')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.log(error);
        throw new Error("Could not retrieve report types");
    }
};

async function getReport_type(reprtTypePayload) {
    let query = supabase.from('report_types').select('*');
    Object.entries(reprtTypePayload || {}).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            query = query.eq(key, value);
        }
    });
    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    return data;
}

async function createReportTypes(reprtTypePayload) {
    try {
        const { data, error } = await supabase
            .from('report_types')
            .insert([reprtTypePayload])
            .select()
            .maybeSingle();
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error creating report type:', error);
        throw error;
    }
}
async function updateReportTypes(reprtTypePayload, condition) {
    try {
        let query = supabase.from('report_types').update(reprtTypePayload);
        Object.entries(condition || {}).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                query = query.eq(key, value);
            }
        });
        const { data, error } = await query.select();
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error updating report type:', error);
        throw error;
    }
}




module.exports = {
    getReport_types,
    getReport_type,
    createReportTypes,
    updateReportTypes
};