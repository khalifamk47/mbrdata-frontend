# MBR Data Customer Frontend

Static customer frontend extracted from the Laravel Blade application. It can be
hosted on GitHub Pages and communicates with the Laravel backend over REST.

## Configure

Edit `assets/js/config.js` and set `API_BASE_URL` to the public Laravel API URL.

## Local preview

```bash
python3 -m http.server 4173 -d mbrfrontend
```

Open `http://127.0.0.1:4173/`.

## Admin interface

The admin frontend is deployed with the user site under `/admin/`:

```text
http://127.0.0.1:4173/admin/
```

In production this becomes `https://your-frontend-domain/admin/`. Both
interfaces communicate with the same backend REST API.

## GitHub Pages

Publish the `mbrfrontend` directory. All links are relative, so it supports both
custom domains and repository paths such as `username.github.io/mbrfrontend/`.
# Shared white-label frontend

This repository contains the user frontend and the admin frontend under
`/admin`. It is designed to be deployed separately for each client while all
deployments continue to use this single source codebase.

## Configure a client

Add or edit the client's profile in
[`assets/js/client-config.js`](assets/js/client-config.js), then map the client's
custom domain in `HOSTNAME_PROFILE`. This one file controls:

- client/app name, logo, favicon, tagline and primary colour;
- the client's independent backend API URL and request timeout;
- support contact details;
- enabled frontend services and features; and
- the technology-company contact information.

`clientKey` is only a frontend deployment label. It is not sent as a
`tenant_id`, and it does not combine client databases.

Do not add secrets to `client-config.js`. Browser configuration is public.
Every client must retain its own backend, database, domain and deployment.

Each profile also has a public PayPlus `license.id`. The corresponding secret
licence key belongs only in that client's backend `.env`; it must never be
placed in this frontend repository.

For production, change `api.baseUrl` from localhost to that client's HTTPS API,
for example `https://api.client-domain.com/api`.

## Nur Data profile

The `nur-data` profile is ready with inherited placeholders. Preview it locally:

```text
http://127.0.0.1:4173/?client=nur-data
```

The selection remains active for that browser tab, including `/admin`. Open
`?client=mbrdata` to switch the tab back. Before production, enter Nur Data's
real API URL and branding details and add its hostname to `HOSTNAME_PROFILE`.
