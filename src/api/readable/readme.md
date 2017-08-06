## Schemas

`*` denotes props that can not be mutated directly, nor will they be part of the response objects.

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
  categoryId: String<MongoId> # Category._id
  title: String
  body: String
  author: String
  voteScore: Number
  timestamp: Date
  *deleted: Boolean
}
```

**Comment**

```
Comment {
  _id: String<MongoId>
  parentId: String<MongoId> # Post._id
  title: String
  body: String
  author: String
  voteScore: Number
  timestamp: Date
  *deleted: Boolean
  *parentDeleted: Boolean
}
```

## Workspace

Keep your Categories, Posts, and Comments to yourself by setting an unguessable Authorization header

```js
fetch(url, {
  headers: {
    'Authorization': '<something-unguessable>'
  }
})
```

Share a workspace with others by coordinating the Authorization header

```js
fetch(url, {
  headers: {
    'Authorization': '<something-known>'
  }
})
```

Share your Categories, Posts, and Comments with ALL unauthed users by omitting the Authorization header altogether. This strategy will only pull Categories, Posts, and Comment where the Authorization header has not been set - it will not include private workspaces

```js
fetch(url)
```

# API

**Base URI**

`https://udacity-reactnd-server.herokuapp.com/api/readable`

## Categories

#### `GET /categories`

Get all of the categories available for the app.

**Response**

An array of 0 or more categories

```
[ Category* ]
```

#### `POST /categories`

Create a new category

Param | Type | Notes
----- | ---- | -----
Name | String |

**Response**

The newly created category along with it's generated `_id`, `timestamp`, and `path`

```
Category
```

#### `GET /categories/:_id/posts`

Get all of the posts for a particular category by \_id

**Response**

An array of 0 or more posts for the category

```
[ Post* ]
```

## Posts

#### `GET /posts`

Get all of the posts. Useful for the main page when no category is selected.

**Response**

An array of 0 or more posts

```
[ Post* ]
```

#### `POST /posts`

Add a new post

Param | Type | Notes
----- | ---- | -----
title | String |
body | String |
owner | String |
categoryId | String<MongoId> | must exist in categories

**Response**

```
{
  post: Post,
  category: Category{ _id, numberOfPosts }
}
```

#### `GET /posts/:_id`

Get the details of a single post

**Response**

```
Post
```

#### `PATCH /posts/:_id`

Edit the details of an existing post

Param | Type | Notes
----- | ---- | -----
title | String |
body | String |

**Response**

The updated post

```
Post{ _id, title, body }
```

#### `PATCH /posts/:_id/vote`

Used for voting on a post

Param | Type | Notes
----- | ---- | -----
option | String | Either "upVote" or "downVote"

**Response**

A post with its updated `voteScore`

```
Post{ _id, voteScore }
```

#### `DELETE /posts/:_id`

Sets the deleted flag for a post to `true`. Sets the parentDeleted flag for all child comments to `true`

**Response**

```
{
  post: Post{ _id },
  category: Category{ _id, numberOfPosts }
}
```

#### `GET /posts/:_id/comments`

Get all the comments for a single post

**Response**

An array of 0 or more comments for the post

```
[ Comment* ]
```

## Comments

#### `POST /comments`

Add a comment to a post

Param | Type | Notes
----- | ---- | -----
body | String |
owner | String |
parentId | String<MongoId> | Should match a post id in the database

**Response**

The new post along with it's generated `_id` and `timestamp`

```
Comment
```

#### `GET /comments/:_id`

Get the details for a single comment

**Response**

```
Comment
```

#### `PATCH /comments/:_id`

Edit the details of an existing comment

Param | Type | Notes
----- | ---- | -----
body | String |

**Response**

The updated comment

```
Comment{ _id, body }
```

#### `PATCH /comments/:_id/vote`

Used for voting on a comment.

Param | Type | Notes
----- | ---- | -----
option | String | Either "upVote" or "downVote"

**Response**

A comment with its updated `voteScore`

```
Post{ _id, voteScore }
```

#### `DELETE /comments/:_id`

Sets a comment's deleted flag to `true`

**Response**

The deleted comment

```
Comment{ _id }
```
