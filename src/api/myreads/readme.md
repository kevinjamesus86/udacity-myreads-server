## API

**Book result schema**

`*` denotes optional fields

```
{
  id: String
  term: String
  title: String
  shelf: String
* subtitle: String
* pageCount: Number
  authors: String[]
* categories: String[]
* publisher: String
  publishedDate: String
  description: String
  thumbnailHref: String
}
```

**Endpoints**

TODO

## Searchability

There's a text index on `Book{term, title, authors}`, so those are the things you can query against. The db has been seeded with books that match the following terms:

```json
[
  "Angular JS",
  "Android",
  "Art",
  "Artificial Intelligence",
  "Astronomy",
  "Algorithms",
  "Baseball",
  "Basketball",
  "Business",
  "BBQ",
  "Cook",
  "Comics",
  "Computer Science",
  "Cycling",
  "Design",
  "Development",
  "Digital Marketing",
  "Drama",
  "Drawing",
  "Dumas",
  "ES6",
  "ES7",
  "Education",
  "Fantasy",
  "Film",
  "Finance",
  "Fitness",
  "Football",
  "Future",
  "Games",
  "Gandhi",
  "History",
  "Homer",
  "Horror",
  "Hugo",
  "Journey",
  "Kafka",
  "King",
  "Larsson",
  "Learn",
  "Literary Fiction",
  "Make",
  "Manage",
  "Money",
  "Mystery",
  "Negotiate",
  "Painting",
  "Philosophy",
  "Photography",
  "Poetry",
  "Production",
  "Program Javascript",
  "Programming",
  "React JS",
  "Redux",
  "River",
  "Robotics",
  "Rowling",
  "Satire",
  "Science Fiction",
  "Shakespeare",
  "Swimming",
  "Tale",
  "Time",
  "Tolstoy",
  "Travel",
  "Ultimate",
  "Virtual Reality",
  "Web Development",
  "iOS"
]
```

## Seeding

Need ~1200 books? Import books for the terms found in  [`terms.json`](https://github.com/kevinjamesus86/udacity-myreads-server/blob/master/src/lib/terms.json) by running

`yarn run seed:myreads`

Alternatively, you can import books for terms of your own choosing by running

`yarn run seed:myreads -- 'React JS' Science BBQ Whatever`

**Note**: The default seeding via. `terms.json` is a pretty intense operation.. We're not using a Google Books API Key here so it may fail part way through to do quotas and whatnot. No worries though, you'll still end up with a bunch of books

## ENV

Add `GOOGLE_BOOKS_API_KEY=<your api key>` to your `.env` file to get around the quota you'll likely hit when seeding the database. This is optional.

```
# other env vars
# ...
GOOGLE_BOOKS_API_KEY=<your api key>
```
