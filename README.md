## Overview

This Application enables members to login with their account and draft an email for the admin to approve and send.

It uses clerk for authentication and authorization.
Set clerk keys in .env file

And u need to provide email id and app password in .env

U need to provide these in .env : DATABASE_URL, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY, GMAIL_ID, GMAIL_APP_PASSWORD


( Currently it has restricted access for a particular )
Since i was using clerk, i didn't wanted other users to make their own organisation nd use it.

set the organisation slug to "tuskers", to use the service or modify the main page.tsx according to your needs.

( You can also fetch organisation's admin's details including email id ( in identifier field ))

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

