# 🚀 VidyaWebBuilder Deployment Guide

## 📋 Prerequisites
- GitHub repository: `jitenkr2030/VidyaWebBuilder`
- Vercel account
- Latest code pushed to GitHub

## 🔧 Vercel Deployment Setup

### 1. Connect Repository to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import GitHub repository: `jitenkr2030/VidyaWebBuilder`
4. Vercel will auto-detect it as a Next.js project

### 2. Configure Environment Variables
**Required Environment Variables:**

| Variable | Value | Description |
|----------|--------|-------------|
| `NEXTAUTH_SECRET` | Generate a secure random string | Secret for JWT tokens |
| `NEXTAUTH_URL` | `https://your-app-name.vercel.app` | Your Vercel app URL |
| `DATABASE_URL` | `file:./dev.db` | SQLite database path |
| `NEXT_PUBLIC_APP_URL` | `https://your-app-name.vercel.app` | Public app URL |

**Optional Environment Variables:**
```
RAZORPAY_KEY_ID=rzp_test_your-key-id
RAZORPAY_KEY_SECRET=your-secret-key
```

### 3. Generate NEXTAUTH_SECRET
Run this command to generate a secure secret:
```bash
openssl rand -base64 32
```
Or use an online generator to create a 32+ character random string.

### 4. Deployment Settings
- **Framework Preset**: Next.js (auto-detected)
- **Build Command**: `bun run build` (auto-detected)
- **Output Directory**: `.next/standalone` (auto-detected)
- **Install Command**: `bun install` (auto-detected)

### 5. Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Note your deployment URL

### 6. Post-Deployment Setup
1. **Update Environment Variables** with your actual Vercel URL:
   - `NEXTAUTH_URL=https://your-app-name.vercel.app`
   - `NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app`

2. **Redeploy** to apply environment variable changes

## 🧪 Testing the Deployment

### Demo Accounts
Once deployed, test these accounts:

#### 🎓 School Admin (Full Access)
- **Email**: `principal@dps.edu.in`
- **Password**: `principal123`
- **Access**: Complete school management

#### 👩‍🏫 Teacher/Editor (Content Access)
- **Email**: `teacher@dps.edu.in`
- **Password**: `teacher123`
- **Access**: Content creation and editing

#### 👨‍💼 Staff/Viewer (Read-only)
- **Email**: `staff@dps.edu.in`
- **Password**: `staff123`
- **Access**: View notices, galleries, school information

### Test Checklist
- [ ] Login page loads without errors
- [ ] Demo accounts can login successfully
- [ ] Dashboard displays correctly
- [ ] Website builder works
- [ ] All navigation functions properly

## 🔧 Troubleshooting

### Common Issues

#### 1. "Server Error - Configuration Problem"
**Cause**: Missing `NEXTAUTH_SECRET` or `NEXTAUTH_URL`
**Solution**: Add both environment variables in Vercel dashboard

#### 2. "Invalid Credentials" Error
**Cause**: Database not seeded with demo accounts
**Solution**: Run `bun run db:seed-demo` locally and push the database

#### 3. Build Fails
**Cause**: Dependencies or configuration issues
**Solution**: Check build logs and ensure all dependencies are installed

#### 4. Authentication Not Working
**Cause**: NextAuth configuration issues
**Solution**: Verify `NEXTAUTH_URL` matches your deployment URL exactly

### Debug Mode
Add this to environment variables to enable debug logging:
```
NODE_ENV=development
```

## 📱 Mobile Testing
Test on mobile devices to ensure responsive design works correctly.

## 🔄 CI/CD
Vercel automatically deploys when you push to the `master` branch.

## 📊 Monitoring
Check Vercel Analytics for:
- Page views
- Performance metrics
- Error logs

## 🆘 Support
If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables
3. Test with demo accounts
4. Check this guide for common solutions

---

**🎉 Your VidyaWebBuilder should now be live and fully functional!**