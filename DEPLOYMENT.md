# Deployment Guide - E-Donor Hospital Admin Portal

## 🚀 Deployment Options

### Option 1: Vercel (Recommended for React Apps)

#### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

#### Step 2: Login to Vercel
```bash
vercel login
```

#### Step 3: Deploy
```bash
cd "C:\Users\vigit\Desktop\hosptial db"
vercel
```

#### Step 4: Follow Prompts
- Set up and deploy: Yes
- Which scope: Select your account
- Link to existing project: No
- Project name: edonor-hospital-admin
- Directory: ./
- Override settings: No

#### Production Deployment
```bash
vercel --prod
```

### Option 2: Netlify

#### Step 1: Install Netlify CLI
```bash
npm install -g netlify-cli
```

#### Step 2: Login to Netlify
```bash
netlify login
```

#### Step 3: Build the Project
```bash
npm run build
```

#### Step 4: Deploy
```bash
netlify deploy --prod --dir=dist
```

### Option 3: GitHub Pages

#### Step 1: Update vite.config.js
```javascript
export default defineConfig({
  plugins: [react()],
  base: '/edonor-hospital-admin/',
  server: {
    port: 3000,
    open: true
  }
})
```

#### Step 2: Install gh-pages
```bash
npm install --save-dev gh-pages
```

#### Step 3: Update package.json
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

#### Step 4: Deploy
```bash
npm run deploy
```

### Option 4: Docker

#### Create Dockerfile
```dockerfile
# Build stage
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### Create nginx.conf
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

#### Build and Run
```bash
docker build -t edonor-admin .
docker run -p 8080:80 edonor-admin
```

### Option 5: Traditional Web Server

#### Step 1: Build for Production
```bash
npm run build
```

#### Step 2: Upload Files
Upload the contents of the `dist` folder to your web server:
- Apache: `/var/www/html/`
- Nginx: `/usr/share/nginx/html/`
- IIS: `C:\inetpub\wwwroot\`

#### Apache .htaccess (for React Router)
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>
```

#### Nginx Configuration (for React Router)
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

## 🔧 Pre-Deployment Checklist

### 1. Environment Variables
Create `.env.production` file:
```env
VITE_API_URL=https://your-api-domain.com/api
VITE_APP_NAME=E-Donor Hospital Admin
VITE_APP_VERSION=1.0.0
```

### 2. Update API Endpoints
In `src/services/api.js`, update:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://your-api-domain.com/api'
```

### 3. Security Settings
- Remove demo credentials from Login page
- Implement proper authentication
- Enable HTTPS
- Add Content Security Policy
- Configure CORS properly

### 4. Performance Optimization
```bash
# Build with optimizations
npm run build

# Analyze bundle size
npm install --save-dev rollup-plugin-visualizer
```

Update `vite.config.js`:
```javascript
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    visualizer({ open: true })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          api: ['axios']
        }
      }
    }
  }
})
```

### 5. SEO & Meta Tags
Update `index.html`:
```html
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="E-Donor Hospital Admin Portal for managing blood donations" />
  <meta name="keywords" content="blood donation, hospital, admin, healthcare" />
  <meta name="author" content="Your Organization" />
  <title>E-Donor Hospital Admin Portal</title>
</head>
```

## 📊 Monitoring & Analytics

### Google Analytics
Add to `index.html`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Error Tracking (Sentry)
```bash
npm install @sentry/react
```

Add to `src/main.jsx`:
```javascript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: import.meta.env.MODE,
});
```

## 🔒 Security Best Practices

### 1. HTTPS Only
```javascript
// Redirect HTTP to HTTPS
if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
  location.replace(`https:${location.href.substring(location.protocol.length)}`);
}
```

### 2. Content Security Policy
Add to your server configuration:
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;
```

### 3. Environment Variables
Never commit `.env` files with sensitive data:
```gitignore
.env
.env.local
.env.production
```

## 🧪 Testing Before Deployment

### 1. Build Test
```bash
npm run build
npm run preview
```

### 2. Check All Routes
- Visit http://localhost:4173
- Test all navigation links
- Verify forms work
- Check responsive design

### 3. Performance Test
- Lighthouse audit in Chrome DevTools
- Check loading times
- Verify mobile performance

### 4. Browser Compatibility
Test in:
- Chrome
- Firefox
- Safari
- Edge

## 📈 Post-Deployment

### 1. Domain Configuration
Point your domain to deployment:
- Update DNS A records
- Configure SSL certificate
- Set up www redirect

### 2. Monitoring Setup
- Set up uptime monitoring
- Configure error alerts
- Enable performance tracking

### 3. Backup Strategy
- Regular database backups
- Code repository backups
- Configuration backups

## 🔄 CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm install
    
    - name: Build
      run: npm run build
      env:
        VITE_API_URL: ${{ secrets.API_URL }}
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
```

## 📝 Maintenance

### Regular Updates
```bash
# Check for outdated packages
npm outdated

# Update packages
npm update

# Audit security vulnerabilities
npm audit
npm audit fix
```

### Performance Monitoring
- Monitor bundle size
- Check loading times
- Review error logs
- Analyze user behavior

## 🆘 Troubleshooting

### Build Fails
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Routes Not Working
Ensure proper server configuration for SPA routing.

### Environment Variables Not Working
- Check `.env` file location
- Restart dev server after changes
- Verify `VITE_` prefix

## ✅ Deployment Success Checklist

- [ ] Application builds successfully
- [ ] All routes work correctly
- [ ] Forms submit properly
- [ ] Authentication works
- [ ] API endpoints configured
- [ ] HTTPS enabled
- [ ] SEO meta tags added
- [ ] Analytics configured
- [ ] Error tracking setup
- [ ] Mobile responsive
- [ ] Cross-browser tested
- [ ] Performance optimized
- [ ] Security headers configured
- [ ] Monitoring enabled
- [ ] Backup strategy in place

## 🎉 Congratulations!

Your E-Donor Hospital Admin Portal is now deployed and ready to help manage blood donations efficiently!

For support or questions, refer to the documentation or contact your development team.
