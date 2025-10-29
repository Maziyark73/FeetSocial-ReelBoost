# Complete Sequelize to Supabase Migration Plan

## 📊 Scope
- **Total files to migrate**: 50+ files
- **Estimated time**: 2-3 days
- **Strategy**: Phased migration with testing after each phase

## 📁 Migration Files Created
✅ `lib/supabaseClient.js` - Already created (Supabase client)  
✅ `lib/supabaseHelpers.js` - Helper functions for common queries  
✅ `create_tables.sql` - Database schema (executed successfully)  

## 🗂️ Files That Need Migration

### Priority 1: Core User Operations (Start Here)
1. `src/service/repository/user.service.js` ⭐ START HERE
2. `src/controller/user_controller/auth.controller.js`
3. `src/controller/user_controller/User.Controller.js`
4. `src/controller/user_controller/updateProfile.controller.js`
5. `src/middleware/authMiddleware.js`

### Priority 2: Social/Content Operations  
6. `src/service/repository/SocialMedia.service.js`
7. `src/controller/social_controller/social.controller.js`
8. `src/service/repository/Comment.service.js`
9. `src/controller/comment_controller/comment.controller.js`
10. `src/service/repository/Like.service.js`
11. `src/controller/like_controller/like.controller.js`
12. `src/service/repository/Save.service.js`
13. `src/controller/save_controller/save.controller.js`

### Priority 3: Social Features
14. `src/service/repository/Follow.service.js`
15. `src/controller/follow_controller/follow.controller.js`
16. `src/service/repository/Block.service.js`
17. `src/controller/block_controller/block.controller.js`

### Priority 4: Messaging
18. `src/service/repository/Chat.service.js`
19. `src/service/repository/Message.service.js`
20. `src/service/repository/Participant.service.js`
21. `src/service/repository/Message_seen.service.js`
22. `src/controller/chat_controller/*.js`

### Priority 5: Live & Transactions
23-27. Live services and controllers
28-32. Gift and Transaction services
33-35. Report services

### Priority 6: Admin & Misc
36-50. Admin controllers, music, hashtags, etc.

### Files to DELETE After Migration
- `models/` directory (entire folder)
- Any Sequelize initialization code in `index.js`

### Files to UPDATE
- `.env` - Remove DB_USERNAME, DB_PASSWORD, DB_DATABASE, DB_HOST
- `.env.example` - Remove MySQL credentials
- `package.json` - Remove `sequelize`, `mysql2` dependencies

## 🛠️ Conversion Patterns

### 1. Basic Query
**From**:
```javascript
const users = await User.findAll({ where: { email } });
```
**To**:
```javascript
const { data: users, error } = await supabase
  .from('users')
  .select('*')
  .eq('email', email);
if (error) throw error;
```

### 2. Pagination
**From**:
```javascript
const { rows, count } = await User.findAndCountAll({
  limit: pageSize,
  offset: (page - 1) * pageSize
});
```
**To**:
```javascript
const { data: rows, count, error } = await supabase
  .from('users')
  .select('*', { count: 'exact' })
  .range((page - 1) * pageSize, page * pageSize - 1);
```

### 3. Insert
**From**:
```javascript
const user = await User.create(payload);
```
**To**:
```javascript
const { data: user, error } = await supabase
  .from('users')
  .insert([payload])
  .select()
  .single();
```

### 4. Update
**From**:
```javascript
await User.update(payload, { where: { user_id } });
```
**To**:
```javascript
const { data, error } = await supabase
  .from('users')
  .update(payload)
  .eq('user_id', user_id);
```

### 5. Delete
**From**:
```javascript
await User.destroy({ where: { user_id } });
```
**To**:
```javascript
const { error } = await supabase
  .from('users')
  .delete()
  .eq('user_id', user_id);
```

### 6. Relationships/Joins
**From**:
```javascript
const socials = await Social.findAll({
  where: { user_id },
  include: [{ model: Media }]
});
```
**To**:
```javascript
const { data: socials, error } = await supabase
  .from('socials')
  .select('*, medias(*)')
  .eq('user_id', user_id);
```

## �� Execution Steps

### Step 1: Use Helper Functions
Already created `lib/supabaseHelpers.js` - use these helpers to speed up conversion.

### Step 2: Convert Phase 1 (User Operations)
Take the ChatGPT prompt from the earlier message and focus on:
- `src/service/repository/user.service.js` (226 lines)
- `src/controller/user_controller/auth.controller.js`

### Step 3: Test After Each Phase
Run the app and test each endpoint after converting the phase.

### Step 4: Continue Phase by Phase
Follow the priority list above.

### Step 5: Cleanup
- Delete `models/` folder
- Update `package.json` 
- Update `.env` files
- Remove Sequelize initialization code

## 📝 ChatGPT Prompt Per Phase

For each phase, use this pattern:

```
I need to migrate [SPECIFIC_FILE].js from Sequelize to Supabase.

Current code:
[paste file contents]

Requirements:
1. Replace all Sequelize queries with Supabase client queries
2. Maintain the same function signatures and return formats
3. Handle pagination, filtering, ordering correctly
4. Preserve all error handling
5. Use the helper functions from lib/supabaseHelpers.js where possible

Please provide the fully converted file.
```

## ⚠️ Important Notes

1. **Column Names**: Sequelize uses camelCase (userId), Supabase uses snake_case (user_id)
2. **Auto-increment**: Use `GENERATED ALWAYS AS IDENTITY` (already in schema)
3. **Timestamps**: Sequelize uses `createdAt/updatedAt`, Supabase uses `created_at/updated_at`
4. **Associations**: Convert to explicit joins or multiple queries
5. **Transactions**: Supabase has limited transaction support - may need refactoring

## ✅ Success Criteria

- [ ] All service files converted
- [ ] All controller files converted
- [ ] All routes tested
- [ ] Authentication works
- [ ] File uploads work with Supabase Storage
- [ ] No Sequelize imports remain
- [ ] package.json updated
- [ ] .env updated
- [ ] models/ deleted

## 🎯 Next Action

Start with: `src/service/repository/user.service.js`

Give ChatGPT this file and ask it to convert following the patterns in MIGRATION_EXAMPLE.md
