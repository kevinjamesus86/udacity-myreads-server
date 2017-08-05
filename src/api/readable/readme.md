## Schemas

**Category**

```
Category {
  _id: String<MongoId>
  name: String
  path: String
  numberOfPosts: Number
}
```

**Post**

```
Post {
  _id: String<MongoId>
  title: String
  body: String
  author: String
  category: String
  voteScore: Number
  timestamp: Date
}
```

**Comment**

```
Post {
  _id: String<MongoId>
  parentId: String<MongoId>
  title: String
  body: String
  author: String
  category: String
  voteScore: Number
  timestamp: Date
}
```

## Workspace

Use an Authorization header to work with your own data. If you want to share data with all the other fine folks in this course, feel free to leave out the authorization header.

_Keep your Categories, Posts, and Comments to yourself_

```js
fetch(url, {
  headers: {
    'Authorization': 'whatever-you-want'
  }
})
```

_Share your Categories, Posts, and Comments with all unauthed users_

```js
fetch(url)
```

# API

Base URI

`https://udacity-reactnd-server.herokuapp.com/api/readable`

#### `GET /categories`

Get all of the categories available for the app.

#### `POST /categories`

Create a new category

#### `GET /categories/:category/posts`

Get all of the posts for a particular category

#### `GET /posts`

Get all of the posts. Useful for the main page when no category is selected.

#### `POST /posts`

Add a new post

Param | Type | Notes
----- | ---- | -----
title | String |
body | String |
owner | String |
category | String | must exist in categories

#### `GET /posts/:_id`

Get the details of a single post

#### `PATCH /posts/:_id`

Edit the details of an existing post

Param | Type | Notes
----- | ---- | -----
title | String |
body | String |

#### `PATCH /posts/:_id/vote`

Used for voting on a post

Param | Type | Notes
----- | ---- |
option | String | Either "upVote" or "downVote"

#### `DELETE /posts/:_id`

Sets the deleted flag for a post to `true`. Sets the parentDeleted flag for all child comments to `true`

#### `GET /posts/:_id/comments`

Get all the comments for a single post

#### `POST /comments`

Add a comment to a post

Param | Type | Notes
----- | ---- | -----
body | String |
owner | String |
parentId | String<MongoId> | Should match a post id in the database

#### `GET /comments/:_id`

Get the details for a single comment

#### `PATCH /comments/:_id`

Edit the details of an existing comment

Param | Type | Notes
----- | ---- | -----
body | String |

#### `PATCH /comments/:_id/vote`

Used for voting on a comment.

Param | Type | Notes
----- | ---- | -----
option | String | Either "upVote" or "downVote"

#### `DELETE /comments/:_id`

Sets a comment's deleted flag to `true`
