// lib imports
const supabase = require('../../../lib/supabaseClient');

/**
 * Fetch users with optional filters, pagination and join info.
 * Supabase doesn’t support eager-loading like Sequelize; if you need
 * related Social records, use the `includeSocial` flag to pull them via a
 * join in the .select() call.
 */
const getUsers = async (
  filterPayload = {},
  pagination = { page: 1, pageSize: 10 },
  attributes = [],
  excludedUserIds,
  order = [['createdAt', 'DESC']],
  include = []
) => {
  try {
    const { page = 1, pageSize = 10 } = pagination;
    const offset = (Number(page) - 1) * Number(pageSize);
    const limit = Number(pageSize);

    // Build filters
    let query = supabase.from('users');

    // Select columns; supabase expects a comma‑separated string or
    // relationship syntax. Fallback to '*' if none provided.
    const selectCols = attributes.length ? attributes.join(',') : '*';

    // Handle Social include; Supabase uses snake_case table names.
    // If filterPayload.total_social is set, fetch that many socials per user.
    let selectWithRelations = selectCols;
    if (filterPayload.total_social && filterPayload.total_social > 0) {
      // assuming the socials table is named "socials" and has user_id FK
      selectWithRelations += `, social:*`; // adjust if your relationship name differs
    }

    query = query.select(selectWithRelations, { count: 'exact' });

    // Name conversions: use snake_case for column names
    if (filterPayload.user_name) {
      if (filterPayload.user_check) {
        query = query.eq('user_name', filterPayload.user_name);
      } else {
        query = query.ilike('user_name', `${filterPayload.user_name}%`);
      }
    }

    if (filterPayload.email) query = query.eq('email', filterPayload.email);
    if (filterPayload.mobile_num) query = query.eq('mobile_num', filterPayload.mobile_num);
    if (filterPayload.user_id) query = query.eq('user_id', filterPayload.user_id);

    if (!filterPayload.user_id && excludedUserIds?.length > 0) {
      // exclude users in the list
      query = query.not('user_id', 'in', `(${excludedUserIds.join(',')})`);
    }

    if (filterPayload.country) {
      query = query.ilike('country', `${filterPayload.country}%`);
    }

    if (filterPayload.total_social && filterPayload.total_social > 0) {
      // filter on total_socials > N
      query = query.gt('total_socials', filterPayload.total_social);
    }

    // Ordering – Supabase expects separate calls for each order clause.
    // Here we only support the first entry.
    if (order && order.length) {
      const [col, dir] = order[0];
      query = query.order(col.replace(/([A-Z])/g, '_$1').toLowerCase(), { ascending: dir.toLowerCase() !== 'desc' });
    }

    // Pagination – Supabase uses .range(start, end)
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

/**
 * Find a single user. If `auth` is true, it only checks mobile_num + country_code.
 * If `deleted` is true, it checks userPayload as‐is.
 * Otherwise it performs an OR search on any provided fields.
 */
async function getUser(userPayload, auth = false, deleted = false) {
  // Build OR clauses for non-auth lookups
  const orParts = [];

  if (userPayload.mobile_num) {
    orParts.push(`mobile_num.eq.${userPayload.mobile_num}`);
  }
  if (userPayload.country_code) {
    orParts.push(`country_code.eq.${userPayload.country_code}`);
  }
  if (userPayload.user_name) {
    orParts.push(`user_name.ilike.${userPayload.user_name}%`);
  }
  if (userPayload.email) {
    orParts.push(`email.eq.${userPayload.email}`);
  }
  if (userPayload.user_id) {
    orParts.push(`user_id.eq.${userPayload.user_id}`);
  }
  if (userPayload.country) {
    orParts.push(`country.eq.${userPayload.country}`);
  }

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

/**
 * Create a new user
 */
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

/**
 * Update a user given a condition (object of equality constraints)
 */
async function updateUser(userPayload, condition) {
  try {
    let query = supabase.from('users').update(userPayload);
    // Apply all condition keys as equality filters
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

/**
 * Check if a user is private
 */
async function isPrivate(userPayload) {
  try {
    const user = await getUser(userPayload);
    return !!user?.is_private;
  } catch (error) {
    console.error('Error finding private user:', error);
    throw error;
  }
}

/**
 * Check if a user is an admin; return the user record or false
 */
async function isAdmin(userPayload) {
  try {
    const user = await getUser(userPayload);
    return user?.is_admin ? user : false;
  } catch (error) {
    console.error('Error finding admin user:', error);
    throw error;
  }
}

/**
 * Count users matching a payload
 */
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

/**
 * Return raw user rows matching a payload (used in original code)
 */
async function getUserCountData(userPayload = {}, extraOptions = {}) {
  try {
    // extraOptions is unused here because Supabase doesn’t support arbitrary Sequelize opts
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
