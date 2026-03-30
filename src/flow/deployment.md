# 🚀 Neighbourly Backend Deployment Guide (Hostinger VPS + Nginx + SSL)

This guide explains how to deploy a Node.js backend (`neighbourly-backend`) on a Hostinger VPS with:

- Subdomain setup
- Nginx reverse proxy
- PM2 process manager
- SSL via Certbot

---

# 📌 1. Prerequisites

- VPS access (SSH)
- Domain hosted on Hostinger
- Backend project ready
- Node.js installed on VPS

---

# 🌐 2. Create Subdomain in Hostinger

### Step 1: Go to DNS Zone
- Open Hostinger Panel
- Go to **Domains → DNS Zone Editor**
- Select your domain: `techforgeinnovations.com`

### Step 2: Add A Record

| Type | Name | Value |
|------|------|-------|
| A    | neighbourly-backend | 76.13.113.82 |

### ⚠️ Important:
- Remove any **AAAA (IPv6)** record for this subdomain
- Otherwise SSL may fail

---

# 🚫 3. Disable CDN (IMPORTANT)

If CDN is enabled, it may block Nginx/Certbot verification.

### Steps:
- Go to Hostinger → Domains
- Find your domain
- Disable:
  - Cloudflare (if enabled)
  - Any proxy/CDN

✅ Make sure DNS is **Direct (DNS Only)**

---

# 🔐 4. Connect to VPS

```bash
ssh root@76.13.113.82
```

# 📁 5. Setup Project Directory
```bash
mkdir -p /var/www/neighbourly-backend
cd /var/www/neighbourly-backend
```

# 📦 6. Upload Backend Code
```bash
git clone <your-repo-url> .
```

# ⚙️ 7. Setup Environment Variables
```bash
nano .env
```

### Update:
```bash
PORT=8001
NODE_ENV=production

ORIGIN=https://neighbourly-backend.techforgeinnovations.com
FRONTEND_URL=https://your-frontend-domain.com
BACKEND_URL=https://neighbourly-backend.techforgeinnovations.com
```

# 📥 8. Install Dependencies
```bash
npm install
```

# ▶️ 9. Run App (Test)
```bash
node ./src/server.js
```

### Test:
```bash
http://76.13.113.82:8001
```

### Stop:
```bash
CTRL + C
```

# 🔁 10. Setup PM2
```bash
npm install -g pm2
```

### Start app:
```bash
pm2 start ./src/server.js --name neighbourly-backend
```

### Enable auto restart:
```bash
pm2 startup
pm2 save
```

# 🌍 11. Install Nginx
```bash
apt update
apt install nginx -y
```

# ⚙️ 12. Configure Nginx
```bash
nano /etc/nginx/sites-available/neighbourly-backend
```

### Paste:
```bash
server {
    listen 80;
    server_name neighbourly-backend.techforgeinnovations.com;

    location / {
        proxy_pass http://localhost:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

# 🔗 13. Enable Nginx Config
```bash
ln -s /etc/nginx/sites-available/neighbourly-backend /etc/nginx/sites-enabled/
```

### Test config:
```bash
nginx -t
```

### Restart: 
```bash
systemctl restart nginx
```

# 🔥 14. Configure Firewall
```bash
ufw allow 80
ufw allow 443
ufw allow 8001
ufw enable
ufw status
```

# 🌐 15. Test Domain

### Open:
```bash
http://neighbourly-backend.techforgeinnovations.com
```

# 🔒 16. Install SSL (Certbot)
```bash
apt install certbot python3-certbot-nginx -y
```

### Run:
```bash
certbot --nginx -d neighbourly-backend.techforgeinnovations.com
```

# 🧾 17. Certbot Prompts

- Enter email
- Agree Terms → Yes
- Redirect HTTP → HTTPS → Choose YES

# ✅ 18. Verify HTTPS

### Open:

```bash
https://neighbourly-backend.techforgeinnovations.com
```

# 🔁 19. Auto Renewal Test
```bash
certbot renew --dry-run
```

# ⚠️ 20. Common Issues & Fixes

- ❌ SSL Fails (Unauthorized / 404)
- Remove AAAA record (IPv6)
- Ensure DNS points to VPS
- Ensure port 80 is open

### ❌ Domain Not Working

### Check:
```bash
nslookup neighbourly-backend.techforgeinnovations.com
```

### Must return:
```bash
76.13.113.82
```

### ❌ Nginx Not Working
```bash
systemctl status nginx
nginx -t
```