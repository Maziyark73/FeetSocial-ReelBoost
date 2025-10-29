const supabase = require('../../../lib/supabaseClient');


async function createProductMedia(productMediaPayload) {
    try {
        const { data, error } = await supabase
            .from('product_medias')
            .insert([productMediaPayload])
            .select()
            .maybeSingle();
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error creating Product Media:', error);
        throw error;
    }
}

module.exports = {
    createProductMedia,
};