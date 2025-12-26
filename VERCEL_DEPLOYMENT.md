# 🚀 Vercel Deployment Guide

## ✅ Files Configured for Vercel

Your project is now configured for Vercel deployment with:
- `vercel.json` - Vercel configuration
- `server.js` - Modified to work with serverless functions
- `package.json` - Added vercel-build script

## 📝 Environment Variables in Vercel

Go to your Vercel project dashboard and add these environment variables:

### Required Variables:

1. **MONGODB_URI**
   ```
   mongodb+srv://keshav:Keshav1234@cluster0.kldva.mongodb.net/dukanLedger?retryWrites=true&w=majority
   ```
   ⚠️ **IMPORTANT**: Your MongoDB URI must include:
   - The database name after `.mongodb.net/` (e.g., `/dukanLedger`)
   - Query parameters at the end
   
2. **NODE_ENV** (optional but recommended)
   ```
   production
   ```

## 🔧 MongoDB Atlas Configuration

**CRITICAL:** MongoDB Atlas must allow Vercel connections:

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Select your cluster → **Network Access**
3. Click **"Add IP Address"**
4. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
5. Click **"Confirm"**

This allows Vercel's serverless functions to connect.

## 📤 Deploy to Vercel

### Method 1: Through Vercel Dashboard (Recommended)
1. Go to [vercel.com](https://vercel.com/)
2. Import your GitHub repository
3. Add environment variables
4. Click "Deploy"

### Method 2: Through Git Push
```bash
git add .
git commit -m "Configure for Vercel deployment"
git push origin main
```
Vercel will auto-deploy if connected to your GitHub repo.

## 🐛 Troubleshooting

### Issue: "Application Error" on Vercel

**Check Vercel Logs:**
1. Go to your project in Vercel
2. Click on the deployment
3. Click "View Function Logs"

**Common Fixes:**

1. **MongoDB Connection Issues:**
   - Check your MongoDB URI is complete with database name
   - Ensure MongoDB Atlas allows connections from 0.0.0.0/0
   - Verify username and password are correct

2. **Environment Variables Not Set:**
   - Go to Project Settings → Environment Variables
   - Add MONGODB_URI
   - Redeploy

3. **Build Errors:**
   - Make sure all dependencies are in package.json
   - Check build logs in Vercel dashboard

### Issue: "Cannot GET /"

This means the frontend isn't loading. Check that:
- `public/` folder is committed to Git
- `vercel.json` routes are correct

### Issue: API Routes Not Working

Make sure:
- All routes in `server.js` are using correct paths
- CORS is enabled (already set up)

## 🧪 Test Your Deployment

Once deployed, test these:

1. **Homepage loads:** Visit `https://your-app.vercel.app`
2. **Add a user:** Try adding a new user
3. **Search works:** Search for users
4. **Transactions work:** Add credit/debit transactions
5. **Delete works:** Try deleting a user

## 📱 Local Development Still Works

To run locally:
```bash
npm run dev
```

The app will detect it's not in production and start a local server.

## 🔒 Security Notes

⚠️ **NEVER commit your .env file!**

Your `.gitignore` should include:
```
node_modules/
.env
.DS_Store
.vercel
```

## 🆘 Still Having Issues?

1. Check Vercel deployment logs
2. Check MongoDB Atlas network access
3. Verify environment variables are set correctly
4. Make sure your MongoDB URI has the database name

### Example of CORRECT MongoDB URI:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/dukanLedger?retryWrites=true&w=majority
```

### Example of WRONG MongoDB URI (missing database name):
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net
```

---

## ✨ Your App Should Now Work on Vercel!

Visit your Vercel URL to see it live! 🎉

