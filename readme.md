[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/kevinjamesus86/udacity-myreads-server)

## Requirements

You'll need [Node.js](https://nodejs.org/en/) `v8.2` [or higher] installed to run this shiz

## Install

`yarn install`

### Development server

`yarn start:dev`

### Linting

Get yelled at

`yarn lint`

Don't get yelled at, have prettier fix everything

`yarn lint:fix`

## Seeding

Need ~1200 books? Import books for the terms found in  [`terms.json`](https://github.com/kevinjamesus86/udacity-myreads-server/blob/master/src/lib/terms.json) by running

`yarn run seed`

To import fewer books, import books for terms of your own by running

`yarn run seed -- 'React JS' Science BBQ Whatever`

**Note**: The default seeding via. `terms.json` is a pretty intense operation.. We're not using a Google Books API Key here so it may fail part way through to do quotas and whatnot. No worries though, you'll still end up with a bunch of books

## ENV

For local development you'll need to create a `.env` config file in the root of the project that provides the following environment variables. If you don't feel like [installing mongodb](https://www.mongodb.com/download-center?jmp=nav#community) locally then head on over to https://mlab.com/ and spin up a free tier instance

```
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/udacity-myreads
```
