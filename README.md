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

## GitHub Pages

Publish the `mbrfrontend` directory. All links are relative, so it supports both
custom domains and repository paths such as `username.github.io/mbrfrontend/`.

