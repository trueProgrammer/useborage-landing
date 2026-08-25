# Use Borage landing page

Static, dependency-free marketing site for [useborage.com](https://www.useborage.com). It is designed for Vercel and kept separate from the Borage application deployed at `app.useborage.com`.

## Local preview

```sh
python3 scripts/serve.py
```

Open `http://127.0.0.1:8765/`. The preview server maps clean routes such as `/how-it-works` to their static HTML files in the same way as the Vercel configuration.

## Verification

```sh
python3 -m unittest discover -s tests
python3 -m json.tool vercel.json >/dev/null
```

## Deploy with Vercel

Import `trueProgrammer/useborage-landing` into Vercel as a static project. Leave the root directory as `.`, choose the **Other** framework preset, and leave the build command and output directory empty.

Attach `useborage.com` and `www.useborage.com` to the project. Keep `www.useborage.com` assigned to Production and redirect the apex domain to `www` in Vercel’s domain settings. The repository redirects the default Vercel subdomain to `www` and sends `/sign-in` to the AWS-hosted application at `https://app.useborage.com/sign-in`.

After the production domain is live:

1. Verify `https://www.useborage.com/robots.txt` and `https://www.useborage.com/sitemap.xml`.
2. Add the domain property in Google Search Console and submit `/sitemap.xml`.
3. Add the site in Bing Webmaster Tools and submit the same sitemap.
4. Inspect the home page and each service URL after the first crawl.
