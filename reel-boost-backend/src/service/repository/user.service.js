// lib imports
const supabase = require('../../../lib/supabaseClient');

const getUsers = async (
  filterPayload = {},
  pagination = { page: 1, pageSize: 10 },
  attributes = [],
  excludedUserIds,
  order = [['created_at', 'DESC']],
  include = []
) => {
  try {
    const { page = 1, pageSize = 10 } = pagination;
    const offset = (Number(page) - 1) * Number(pageSize);
    const limit = Number(pageSize);

    let query = supabase.from('users');
    const selectCols = attributes.length ? attributes.join(',') : '*';

    let selectWithRelations = selectCols;
    if (filterPayload.total_social && filterPayload.total_social > 0) {
      selectWithRelations += ', socials(*)';
    }

    query = query.select(selectWithRelations, { count: 'exact' });

    if (filterPayload.user_name) {
      if (filterPayload.user_check) {
        query = query.eq('user_name', filterPayload.user_name);
      } else {
        query = query.ilike('user_name', filterPayload.user_name + '%');
      }
    }

    if (filterPayload.email) query = query.eq('email', filterPayload.email);
    if (filterPayload.mobile_num) query = query.eq('mobile_num', filterPayload.mobile_num);
    if (filterPayload.user_id) query = query.eq('user_id', filterPayload.user_id);

    if (!filterPayload.user_id && excludedUserIds && excludedUserIds.length > 0) {
      const ids = excludedUserIds.join(',');
      query = query.not('user_id', 'in', '(' + ids + ')');
    }

    if (filterPayload.country) {
      query = query.ilike('country', filterPayload.country + '%');
    }

    if (filterPayload.total_social && filterPayload.total_social > 0) {
      query = query.gt('total_socials', filterPayload.total_social);
    }

    if (order && order.length) {
      const [col, dir] = order[0];
      const colSnake = col.replace(/([A-Z])/g, '_$1').toLowerCase();
      query = query.order(colSnake, { ascending: dir.toLowerCase() !== 'desc' });
    }

    const start = offset;
    const end = offset + limit - 1;
    query = query.range(start, end);

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
    console.error('Error fetching Users:', error);
    throw new Error('Could not retrieve users');
  }
};

async function getUser(userPayload, auth = false, deleted = false) {
  try {
    if (auth) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('mobile_num', userPayload.mobile_num)
        .eq('country_code', userPayload.country_code)
        .maybeSingle();

      if (error) throw error;
      return data;
    } else if (deleted) {
      const { data, error } = await supabase.from('users').select('*').match(userPayload).maybeSingle();
      if (error) throw error;
      return data;
    } else {
      const orParts = [];
      
      if (userPayload.mobile_num) orParts.push('mobile_num.eq.' + userPayload.mobile_num);
      if (userPayload.country_code) orParts.push('country_code.eq.' + userPayload.country_code);
      if (userPayload.user_name) orParts.push('user_name.ilike.' + userPayload.user_name + '%');
      if (userPayload.email) orParts.push('email.eq.' + userPayload.email);
      if (userPayload.user_id) orParts.push('user_id.eq.' + userPayload.user_id);
      if (userPayload.country) orParts.push('country.eq.' + userPayload.country);

      if (!orParts.length) return null;

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(orParts.join(','))
        .maybeSingle();

      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}

async function createUser(userPayload) {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([userPayload])
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

async function updateUser(userPayload, condition) {
  try {
    let query = supabase.from('users').update(userPayload);
    Object.keys(condition || {}).forEach((key) => {
      query = query.eq(key, condition[key]);
    });

    const { data, error } = await query.select().maybeSingle();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

async function isPrivate(userPayload) {
  try {
    const user = await getUser(userPayload);
    return !!user && !!user.is_private;
  } catch (error) {
    console.error('Error finding private user:', error);
    throw error;
  }
}

async function isAdmin(userPayload) {
  try {
    const user = await getUser(userPayload);
    return user && user.is_admin ? user : false;
  } catch (error) {
    console.error('Error finding admin user:', error);
    throw error;
  }
}

async function getUserCount(userPayload = {}) {
  try {
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .match(userPayload);

    if (error) throw error;
    return count;
  } catch (error) {
    console.error('Error in getUserCount:', error);
    throw error;
  }
}

async function getUserCountData(userPayload = {}, extraOptions = {}) {
  try {
    const { data, error } = await supabase.from('users').select('*').match(userPayload);
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error in getUserCountData:', error);
    throw error;
  }
}

module.exports = {
  getUser,
  getUsers,
  createUser,
  updateUser,
  isPrivate,
  isAdmin,
  getUserCount,
  getUserCountData,
};
