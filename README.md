# H-Wiki

Frontend code for H-Wiki, see [h-wiki-back](https://github.com/eyss/h-wiki-back) for DNA code.

H-Wiki is a hApp (holochain application) that allows groups and communities to create their own wiki-like repositories of information.

Each wiki is created with an initial administrator, that can grant `administrator` or `editor` roles to any other user that joins the hApp.

Design: https://hackmd.io/HQ0wjyjjTpK4yJ9FcAx0Iw

## Running

Start the holochain backend first, see https://github.com/eyss/h-wiki-back#getting-started.

Run this:

```
yarn
yarn start
```

You will be automatically redirected to `https://localhost:3000`. This hApp uses the Progenitor pattern, which expects an admin user. If you've used the sample conductor config in the `h-wiki-back` repo, you should already be the progenitor.

When the UI starts up, you'll be asked for your username. Once you enter it, you're ready to start creating pages!
