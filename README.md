# Use Borage landing page

This repository contains only the public Use Borage marketing site.

## Deploy with Vercel

1. Create a private GitHub repository and push this repository to it.
2. Import that repository as a new Vercel project.
3. Leave the root directory as `.`.
4. Leave the framework preset as **Other** and deploy without a build command.
5. Connect `useborage.com` and `www.useborage.com` to this project.

Vercel serves `index.html` and `assets/` directly. The `/sign-in` path redirects to
the AWS-hosted application at `https://app.useborage.com/sign-in`.

The application itself is deployed separately to AWS at `app.useborage.com`.
