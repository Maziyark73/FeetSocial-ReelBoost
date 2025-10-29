const supabase = require('../../../lib/supabaseClient');


async function createMedia(mediaPayload) {
    try {
        const { data, error } = await supabase
            .from('medias')
            .insert([mediaPayload])
            .select()
            .maybeSingle();
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error creating media:', error);
        throw error;
    }
}



module.exports = {
    createMedia,
};