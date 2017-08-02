[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/kevinjamesus86/udacity-myreads-server)

## Requirements

You'll need [Node.js](https://nodejs.org/en/) `v8.2` [or higher] installed to run this shiz

## Install

`yarn install`

### Development server

`yarn start:dev`

### Linting

`yarn lint`

## Seeding

To import ~6000 books for the terms in  [`terms.json`](https://github.com/kevinjamesus86/udacity-myreads-server/blob/master/src/lib/terms.json) run

`yarn run seed`

To import fewer books for terms of your own run

`yarn run seed -- 'React JS' Science BBQ`

The default seeding via. `terms.json` is a pretty intense operation and requires that you have a Google Books API key, as you'll be downloading around 6000 books. If you don't have an API key you'll max out the quota and the seeding will fail part way through. Head over to https://support.google.com/cloud/answer/6158862 and follow the instructions to grab a key. See the `## ENV` section below for exposing they key to the app

## ENV

For local development you'll need to create a `.env` config file in the root of the project that provides the following environment variables. If you don't feel like [installing mongodb](https://www.mongodb.com/download-center?jmp=nav#community) locally then head on over to https://mlab.com/ and spin up a free tier instance

```
PORT=3000
NODE_ENV=development
API_BASE=http://localhost:3000/api
MONGODB_URI=mongodb://127.0.0.1:27017/udacity-myreads
GAPI_BOOKS_API_KEY=<you'll need it for seeding with terms.json>
```
