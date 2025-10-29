const supabase = require('../../../lib/supabaseClient');


const getHashTags = async (
  filterPayload = {},
  pagination = { page: 1, pageSize: 10 },
  attributes = [],
  order = [['createdAt', 'DESC']]
) => {
  try {
    const { page = 1, pageSize = 10 } = pagination;
    const from = (Number(page) - 1) * Number(pageSize);
    const to = from + Number(pageSize) - 1;

    let query = supabase
      .from('hashtags')
      .select('*', { count: 'exact' })
      .range(from, to);

    Object.entries(filterPayload || {}).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (key === 'hashtag_name') {
        query = query.ilike('hashtag_name', `${value}%`);
      } else {
        query = query.eq(key, value);
      }
    });

    if (order && Array.isArray(order) && order.length > 0) {
      let [orderBy, dir] = order[0];
      orderBy = orderBy.replace(/([A-Z])/g, '_$1').toLowerCase();
      query = query.order(orderBy, { ascending: dir.toUpperCase() !== 'DESC' });
    }

    const { data: rows, count, error } = await query;
    if (error) throw error;

    return {
      Records: rows || [],
      Pagination: {
        total_pages: Math.ceil((count || 0) / pageSize),
        total_records: Number(count) || 0,
        current_page: Number(page),
        records_per_page: Number(pageSize),
      },
    };
  } catch (error) {
    console.error('Error fetching Hashtags:', error);
    throw new Error('Could not retrieve Hashtags');
  }
};



async function createHashtag(hashtagPayload) {
  try {
    const { data, error } = await supabase
      .from('hashtags')
      .insert([hashtagPayload])
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating Hashtag:', error);
    throw error;
  }
}

async function updateHashtag(hashtagPayload, condition) {
  try {
    let query = supabase.from('hashtags').update(hashtagPayload);
    Object.entries(condition || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });
    const { data, error } = await query.select();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating Hashtag:', error);
    throw error;
  }
}

// async function getHashtagsWithMinimumReels({
//   page = 1,
//   pageSize = 10,
//   minReels = 3
// }) {
//   const offset = (page - 1) * pageSize;

//   const countQuery = `
//     WITH extracted AS (
//       SELECT
//         LOWER(REGEXP_REPLACE(match[1], '[^a-zA-Z0-9_]', '', 'g')) AS tag,
//         s."social_id"
//       FROM "Socials" s,
//       regexp_matches(s."social_desc", '#(\\w+)', 'g') AS match
//     ),
//     grouped AS (
//       SELECT tag, COUNT(*) AS total
//       FROM extracted
//       GROUP BY tag
//       HAVING COUNT(*) >= :minReels
//     )
//     SELECT COUNT(*) FROM grouped;
//   `;

//   const dataQuery = `
//     WITH extracted AS (
//   SELECT
//     LOWER(REGEXP_REPLACE(match[1], '[^a-zA-Z0-9_]', '', 'g')) AS tag,
//     s.*
//   FROM "Socials" s,
//   regexp_matches(s."social_desc", '#(\\w+)', 'g') AS match
// ),
// grouped AS (
//   SELECT tag, COUNT(*) AS total
//   FROM extracted
//   GROUP BY tag
//   HAVING COUNT(*) >= :minReels
// ),
// ranked_socials AS (
//   SELECT
//     e.tag,
//     e."social_id",
//     e."social_desc",
//     e."reel_thumbnail",
//     e."createdAt",
//     ROW_NUMBER() OVER (PARTITION BY e.tag ORDER BY e."createdAt" DESC) AS rn
//   FROM extracted e
//   WHERE e.tag IN (SELECT tag FROM grouped)
// ),
// limited_socials AS (
//   SELECT * FROM ranked_socials WHERE rn <= 3
// ),
// latest_socials AS (
//   SELECT
//     tag,
//     json_agg(
//       json_build_object(
//         'social_id', "social_id",
//         'social_desc', "social_desc",
//         'reel_thumbnail', "reel_thumbnail",
//         'createdAt', "createdAt"
//       ) ORDER BY "createdAt" DESC
//     ) AS recent_socials
//   FROM limited_socials
//   GROUP BY tag
// )
// SELECT
//   g.tag AS hashtag_name,
//   g.total AS total_socials,
//   COALESCE(ls.recent_socials, '[]') AS "Social"
// FROM grouped g
// LEFT JOIN latest_socials ls ON g.tag = ls.tag
// ORDER BY g.total DESC
// OFFSET :offset LIMIT :limit;

//   `;

//   const replacements = {
//     minReels: Number(minReels),
//     offset,
//     limit: pageSize
//   };

//   const [countResult] = await sequelize.query(countQuery, {
//     replacements,
//     type: sequelize.QueryTypes.SELECT
//   });

//   const records = await sequelize.query(dataQuery, {
//     replacements,
//     type: sequelize.QueryTypes.SELECT
//   });

//   const total_records = parseInt(countResult.count || '0');

//   return {
//     Records: records,
//     Pagination: {
//       total_records,
//       current_page: Number(page),
//       total_records: Number(pageSize),
//       total_pages: Math.ceil(total_records / pageSize)
//     }
//   };
// }
// TODO: Replace with a Supabase RPC that encapsulates this SQL in Postgres for performance.
async function getHashtagsWithMinimumReels({ page = 1, pageSize = 10, minReels = 3 }) {
  try {
    const { data, error } = await supabase.rpc('get_hashtags_with_minimum_reels', {
      page,
      page_size: pageSize,
      min_reels: minReels,
    });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching Hashtags with minimum reels:', error);
    throw error;
  }
}

module.exports = {
  getHashTags,
  createHashtag,
  updateHashtag,
  extractHashtags,
  getHashtagsWithMinimumReels
};


function extractHashtags(text) {
  // Match hashtags: words starting with # and containing letters, numbers, or underscores
  const regex = /#(\w+)/g;
  const matches = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    matches.push(match[1]); // push without the '#'
  }
  return matches;
}


module.exports = {
  getHashTags,
  createHashtag,
  updateHashtag,
  extractHashtags,
  getHashtagsWithMinimumReels
};