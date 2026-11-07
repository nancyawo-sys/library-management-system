\# Library Management System



A full-stack library management system built with React and NestJS.



\## Schema Decisions



\*\*Why Book references Genre instead of embedding it.\*\*

PostgreSQL is a relational database, so relationships are expressed with

foreign keys. Each Book stores a `genreId` pointing at one row in the

`Genre` table, rather than carrying its own copy of the genre's data.



This keeps each genre in exactly one place. Renaming "Sci-Fi" to

"Science Fiction" is a single update, and every book is automatically

correct. The database also enforces integrity: a book can't point at a

genre that doesn't exist. Embedding would duplicate genre data across

many books and risk the copies drifting apart.



\*\*Why `Role` is an enum.\*\* A user is either a PATRON or a LIBRARIAN,

nothing else. An enum makes invalid values impossible at both the

database and TypeScript level.

