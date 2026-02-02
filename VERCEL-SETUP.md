# 🚀 Vercel Deployment Setup Guide

## 📋 Problem Summary
The current deployment fails because **SQLite doesn't work on Vercel's serverless environment**. We need to switch to a cloud database.

## 🛠️ Solution: PostgreSQL Database Setup

### Option 1: Supabase (Recommended - Free)
1. **Create Supabase Account**
   - Go to [supabase.com](https://supabase.com)
   - Sign up with GitHub
   - Create new project

2. **Get Database URLs**
   - In Supabase Dashboard → Settings → Database
   - Copy **Connection string** (use URI format)
   - Copy **Direct connection string**

3. **Update Vercel Environment Variables**
   ```
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
   DIRECT_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
   NEXTAUTH_SECRET=vidyawebbuilder-secret-key-2024-production-ready
   NEXTAUTH_URL=https://your-app.vercel.app
   NODE_ENV=production
   ```

### Option 2: Neon (Alternative - Free)
1. **Create Neon Account**
   - Go to [neon.tech](https://neon.tech)
   - Sign up and create new project
   - Copy connection string

2. **Update Environment Variables**
   ```
   DATABASE_URL=postgresql://[user]:[password]@[neon-hostname]/[dbname]?sslmode=require
   DIRECT_URL=postgresql://[user]:[password]@[neon-hostname]/[dbname]?sslmode=require
   ```

### Option 3: PlanetScale (MySQL Alternative)
1. **Create PlanetScale Account**
   - Go to [planetscale.com](https://planetscale.com)
   - Create new database
   - Get connection strings

## 🔄 Deployment Steps

### 1. Update Environment Variables in Vercel
```bash
# In Vercel Dashboard → Settings → Environment Variables
DATABASE_URL="your-postgresql-connection-string"
DIRECT_URL="your-postgresql-direct-connection-string"
NEXTAUTH_SECRET="vidyawebbuilder-secret-key-2024-production-ready"
NEXTAUTH_URL="https://your-app.vercel.app"
NODE_ENV="production"
```

### 2. Deploy to Vercel
```bash
git push origin master
# Vercel will auto-deploy
```

### 3. Run Database Migration
After deployment, visit:
```
https://your-app.vercel.app/api/seed-postgresql
```
**Method:** POST request

This will:
- ✅ Create all database tables
- ✅ Seed demo data
- ✅ Create test users

### 4. Test Login
Use these credentials:
- **Admin:** admin@vidyawebbuilder.in / admin123
- **School Admin:** principal@dps.edu.in / principal123
- **Teacher:** teacher@dps.edu.in / teacher123
- **Staff:** staff@dps.edu.in / staff123

## 🔧 Database Migration Commands (Optional)

If you want to run migrations manually:

```bash
# Generate Prisma Client
bun run db:generate

# Push schema to database
bun run db:push

# Seed the database
bun run db:seed-demo
```

## 🎯 Quick Start Checklist

1. **☐ Create Supabase account**
2. **☐ Create new Supabase project**
3. **☐ Copy database connection strings**
4. **☐ Update Vercel environment variables**
5. **☐ Push code to trigger deployment**
6. **☐ Visit /api/seed-postgresql to seed database**
7. **☐ Test login with demo credentials**

## 🚨 Common Issues & Solutions

### Issue: "Unable to open database file"
**Solution:** Switch to PostgreSQL as shown above

### Issue: "Connection refused"
**Solution:** Check DATABASE_URL format and SSL settings

### Issue: "Migration failed"
**Solution:** Use the seed endpoint instead of manual migrations

## 📞 Support

If you need help:
1. Check Vercel deployment logs
2. Verify database connection strings
3. Ensure all environment variables are set
4. Test database connection with /api/test-db endpoint

---

**🎉 Once setup, your VidyaWebBuilder will work perfectly on Vercel!**