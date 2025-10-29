# Example Migration: user.service.js to Supabase

## BEFORE (Sequelize)
```javascript
const getUsers = async (filterPayload = {}, pagination = { page: 1, pageSize: 10 }) => {
  const { page = 1, pageSize = 10 } = pagination;
  const offset = (Number(page) - 1) * Number(pageSize);
  
  const { rows, count } = await User.findAndCountAll({
    where: whereCondition,
    limit,
    offset,
    order: [['createdAt', 'DESC']]
  });
  
  return { rows, count };
};
```

## AFTER (Supabase)
```javascript
const supabase = require('../../lib/supabaseClient');

const getUsers = async (filterPayload = {}, pagination = { page: 1, pageSize: 10 }) => {
  const { page = 1, pageSize = 10 } = pagination;
  const offset = (Number(page) - 1) * Number(pageSize);
  const limit = Number(pageSize);
  
  let query = supabase
    .from('users')
    .select('*', { count: 'exact' });
  
  // Apply filters
  if (filterPayload.user_name) {
    query = query.ilike('user_name', `${filterPayload.user_name}%`);
  }
  if (filterPayload.email) {
    query = query.eq('email', filterPayload.email);
  }
  if (excludedUserIds?.length > 0) {
    query = query.not('user_id', 'in', `(${excludedUserIds.join(',')})`);
  }
  
  // Apply pagination
  const { data: rows, count, error } = await query
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return { rows, count };
};
```

## Key Changes
1. `require` changes from `models` to `supabaseClient`
2. `User.findAndCountAll()` becomes Supabase query with count
3. Sequelize operators map to Supabase:
   - `Op.like` → `.ilike()`
   - `Op.notIn` → `.not('in', ...)`
4. Pagination uses `.range()` instead of `limit/offset` in options
5. Ordering uses `.order()` instead of array format

