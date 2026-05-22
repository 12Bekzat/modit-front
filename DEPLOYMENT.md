# Deployment security checklist

Frontend environment variables are public after build. Use them only for public URLs and feature flags.

Set this on the frontend host:

```properties
REACT_APP_API_URL=https://your-backend-domain.com
```

Do not put database passwords, JWT secrets, admin passwords, API access tokens, GitHub tokens, or hosting provider tokens in React code or `REACT_APP_*` variables.

If the frontend and backend are served from the same domain behind a reverse proxy, `REACT_APP_API_URL` can be omitted and requests will use same-origin `/api/...`.
