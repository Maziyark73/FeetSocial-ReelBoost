/**
 * Supabase Helper Functions for ReelBoost Backend
 * These functions provide common query patterns for migrating from Sequelize
 */

const supabase = require('./supabaseClient');

/**
 * Common helper: Find one record by primary key or unique field
 */
const findOne = async (tableName, field, value) => {
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .eq(field, value)
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Common helper: Find many records with optional pagination
 */
const findMany = async (tableName, options = {}) => {
  const {
    where = {},
    orderBy = 'created_at',
    ascending = false,
    limit = null,
    offset = null,
    select = '*'
  } = options;

  let query = supabase.from(tableName).select(select);

  // Apply where conditions
  Object.entries(where).forEach(([key, value]) => {
    if (typeof value === 'object' && value.operator) {
      // Handle complex operators like { operator: 'gt', value: 10 }
      if (value.operator === 'gt') query = query.gt(key, value.value);
      else if (value.operator === 'lt') query = query.lt(key, value.value);
      else if (value.operator === 'gte') query = query.gte(key, value.value);
      else if (value.operator === 'lte') query = query.lte(key, value.value);
      else if (value.operator === 'neq') query = query.neq(key, value.value);
      else if (value.operator === 'like') query = query.ilike(key, `%${value.value}%`);
      else if (value.operator === 'notIn') {
        const ids = value.value;
        if (ids.length > 0) query = query.not('in', `(${ids.join(',')})`);
      }
    } else if (Array.isArray(value)) {
      query = query.in(key, value);
    } else {
      query = query.eq(key, value);
    }
  });

  // Apply ordering
  query = query.order(orderBy, { ascending });

  // Apply pagination
  if (limit) {
    query = query.limit(limit);
  }
  if (offset) {
    query = query.range(offset, offset + (limit || 10) - 1);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

/**
 * Common helper: Find and count (for pagination)
 */
const findAndCountAll = async (tableName, options = {}) => {
  const data = await findMany(tableName, options);
  const { count, error } = await supabase
    .from(tableName)
    .select('*', { count: 'exact', head: true });
  
  if (error) throw error;
  return { rows: data, count };
};

/**
 * Common helper: Insert one record
 */
const create = async (tableName, payload) => {
  const { data, error } = await supabase
    .from(tableName)
    .insert([payload])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Common helper: Insert multiple records
 */
const bulkCreate = async (tableName, payloads) => {
  const { data, error } = await supabase
    .from(tableName)
    .insert(payloads)
    .select();
  
  if (error) throw error;
  return data;
};

/**
 * Common helper: Update by primary key
 */
const update = async (tableName, field, value, updates) => {
  const { data, error } = await supabase
    .from(tableName)
    .update(updates)
    .eq(field, value)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Common helper: Delete by primary key
 */
const destroy = async (tableName, field, value) => {
  const { error } = await supabase
    .from(tableName)
    .delete()
    .eq(field, value);
  
  if (error) throw error;
  return true;
};

/**
 * Helper: Transform Sequelize where clause to Supabase
 */
const buildWhereClause = (whereConditions = {}) => {
  // This is a simplified version - more complex conditions would need expansion
  const result = {};
  
  Object.entries(whereConditions).forEach(([key, value]) => {
    result[key] = value;
  });
  
  return result;
};

/**
 * Helper: Include eager loading (joins)
 * Supabase handles joins differently - use multiple queries or select nested
 */
const includeRelations = async (mainTable, mainData, includes = []) => {
  // This is a simplified approach - actual implementation depends on relationship types
  if (!includes.length) return mainData;
  
  // For now, return data as-is and let specific services handle joins
  return mainData;
};

module.exports = {
  findOne,
  findMany,
  findAndCountAll,
  create,
  bulkCreate,
  update,
  destroy,
  buildWhereClause,
  includeRelations
};
