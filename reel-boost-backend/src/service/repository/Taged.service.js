const supabase = require('../../../lib/supabaseClient');



async function createTagUsers(tagedPayload) {
    try {
        const { data, error } = await supabase
            .from('taged_users')
            .insert([tagedPayload])
            .select()
            .maybeSingle();
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error taging user:', error);
        throw error;
    }
}



module.exports = {
    createTagUsers,
};