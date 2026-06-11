# Deploying GuardyKids (Railway + Vercel, free tier)

This repo is split into:

- **`backend/`** – Laravel 12 API → deploys to **Railway** (with a MySQL database)
- **`frontend/`** – React app → deploys to **Vercel**

Everything needed (Dockerfile, entrypoint, CORS, env-driven API URL, idempotent
seeders with a bundled demo image) is already configured. Follow the steps below.

> Deploy the **backend first** so you have its URL for the frontend, then come
> back and set `FRONTEND_URL` on the backend.

---

## 1) Backend → Railway

1. Go to <https://railway.app> and sign in with **GitHub**.
2. **New Project → Deploy from GitHub repo** → pick `nabil920-dev/guardykids`.
3. After it creates the service, open **Settings** and set:
   - **Root Directory**: `backend`
   - **Build**: it will auto-detect the `Dockerfile` (no build command needed).
4. **Add the database**: in the project, **New → Database → Add MySQL**.
5. Open the **backend service → Variables** tab and add these
   (the `${{MySQL.*}}` references pull from the MySQL service automatically):

   ```
   APP_NAME=GuardyKids
   APP_ENV=production
   APP_KEY=base64:EP2MbH4mXx9+euc1/NYXAsaP2hklORLzipSN7n/vQzg=
   APP_DEBUG=false
   APP_URL=https://REPLACE_AFTER_DOMAIN.up.railway.app

   DB_CONNECTION=mysql
   DB_HOST=${{MySQL.MYSQLHOST}}
   DB_PORT=${{MySQL.MYSQLPORT}}
   DB_DATABASE=${{MySQL.MYSQLDATABASE}}
   DB_USERNAME=${{MySQL.MYSQLUSER}}
   DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}

   SESSION_DRIVER=file
   CACHE_STORE=file
   QUEUE_CONNECTION=sync
   LOG_CHANNEL=stack

   PORT=8080
   FRONTEND_URL=http://localhost:3000
   ```

   > `APP_KEY` above is your existing local key — fine to reuse, or generate a
   > new one with `php artisan key:generate --show`.

6. **Networking → Generate Domain**. When asked for the port, use **8080**.
   Copy the generated URL (e.g. `https://guardykids-production.up.railway.app`).
7. Put that URL into the **`APP_URL`** variable (replace the placeholder) and
   redeploy. The container will migrate the DB and seed demo data on boot.
8. Verify: open `https://<your-backend-domain>/api/nurseries` — you should get
   JSON with 5 nurseries.

---

## 2) Frontend → Vercel

1. Go to <https://vercel.com> and sign in with **GitHub**.
2. **Add New → Project** → import `nabil920-dev/guardykids`.
3. Set **Root Directory** to `frontend` (Vercel auto-detects Create React App).
4. Under **Environment Variables**, add:

   ```
   REACT_APP_API_URL = https://<your-backend-domain>/api
   ```

   (use the Railway domain from step 1, **including** the `/api` suffix)
5. Click **Deploy**. Copy the resulting URL (e.g. `https://guardykids.vercel.app`).

---

## 3) Connect the two (CORS)

1. Back in **Railway → backend service → Variables**, set:

   ```
   FRONTEND_URL=https://<your-frontend>.vercel.app
   ```

   (multiple origins allowed, comma-separated)
2. Redeploy the backend. Done — the React app can now call the API.

---

## Login accounts (seeded automatically)

| Role          | Email                    | Password   |
|---------------|--------------------------|------------|
| Admin         | admin@guardykids.ma      | admin123   |
| Nursery owner | owner@guardykids.ma      | owner123   |
| Parent        | karim.alami@guardykids.ma| parent123  |

---

## Notes & limitations

- **Railway free trial**: ~$5 one-time credit, then ~$5/month. Not free forever.
- **Uploaded images** (nurseries added through the UI) live on the container's
  ephemeral disk and are lost on redeploy. The *seeded* demo image is rebuilt on
  every boot, so demo data always shows a picture. To persist user uploads,
  attach a Railway **Volume** mounted at `backend/storage/app/public`, or switch
  the `public` disk to S3/Cloudflare R2.
- **Backend cold start**: on the free tier the service may sleep; the first
  request after idle can take ~20–30s.
