const supabase = require('../../../lib/supabaseClient');


async function createCountry(countryPayload) {
    try {
        const countryName = countryPayload.country || countryPayload.country_name;
        // Try to fetch existing
        let { data: existing, error: fetchErr } = await supabase
            .from('countries')
            .select('*')
            .eq('country_name', countryName)
            .maybeSingle();
        if (fetchErr) throw fetchErr;

        if (existing) {
            const newCount = (existing.country_user || 0) + 1;
            const { data, error } = await supabase
                .from('countries')
                .update({ country_user: newCount })
                .eq('country_name', countryName)
                .select()
                .maybeSingle();
            if (error) throw error;
            return { newCountry: data, created: false };
        }

        const insertPayload = {
            country_name: countryName,
            country_user: 1,
            country_code: countryPayload.country_code || null,
            country_flag: countryPayload.country_flag || null,
        };
        const { data, error } = await supabase
            .from('countries')
            .insert([insertPayload])
            .select()
            .maybeSingle();
        if (error) throw error;
        return { newCountry: data, created: true };
    } catch (error) {
        console.error('Error creating or updating country:', error);
        throw error;
    }
}


async function getcountry(countryPayload, pagination = { page: 1, pageSize: 10 }) {
    try {
        const { page, pageSize } = pagination;
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        let query = supabase.from('countries').select('*', { count: 'exact' }).range(from, to);

        Object.entries(countryPayload || {}).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                query = query.eq(key, value);
            }
        });

        const { data: rows, count, error } = await query;
        if (error) throw error;

        return {
            Records: rows || [],
            Pagination: {
                total_pages: Math.ceil((count || 0) / pageSize),
                total_records: count || 0,
                current_page: page,
                records_per_page: pageSize,
            },
        };
    } catch (error) {
        console.error('Error fetching countries:', error);
        throw error;
    }
}

async function deleteCountry(countryName) {
    try {
        const { data: country, error } = await supabase
            .from('countries')
            .select('*')
            .eq('country_name', countryName)
            .maybeSingle();
        if (error) throw error;
        if (!country) throw new Error(`Country with name "${countryName}" not found.`);

        if ((country.country_user || 0) > 1) {
            const { error: updErr } = await supabase
                .from('countries')
                .update({ country_user: (country.country_user || 1) - 1 })
                .eq('country_name', countryName);
            if (updErr) throw updErr;
        } else {
            const { error: delErr } = await supabase
                .from('countries')
                .delete()
                .eq('country_name', countryName);
            if (delErr) throw delErr;
        }

        return { success: true, message: 'Operation completed successfully.' };
    } catch (error) {
        console.error('Error deleting or decrementing country:', error);
        throw error;
    }
}

module.exports = {
    createCountry,
    getcountry,
    deleteCountry
}