import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const genres = [
  { name: 'Fantasy', slug: 'fantasy' },
  { name: 'Science Fiction', slug: 'science-fiction' },
  { name: 'Mystery', slug: 'mystery' },
  { name: 'Non-Fiction', slug: 'non-fiction' },
];

const books = [
  { title: 'The Hobbit', author: 'J.R.R. Tolkien', isbn: '9780547928227', genre: 'fantasy', copies: 3 },
  { title: 'A Wizard of Earthsea', author: 'Ursula K. Le Guin', isbn: '9780547773742', genre: 'fantasy', copies: 2 },
  { title: 'The Name of the Wind', author: 'Patrick Rothfuss', isbn: '9780756404741', genre: 'fantasy', copies: 2 },
  { title: 'Mistborn', author: 'Brandon Sanderson', isbn: '9780765311788', genre: 'fantasy', copies: 4 },
  { title: 'Dune', author: 'Frank Herbert', isbn: '9780441172719', genre: 'science-fiction', copies: 3 },
  { title: 'Neuromancer', author: 'William Gibson', isbn: '9780441569595', genre: 'science-fiction', copies: 2 },
  { title: 'The Left Hand of Darkness', author: 'Ursula K. Le Guin', isbn: '9780441478125', genre: 'science-fiction', copies: 2 },
  { title: 'Project Hail Mary', author: 'Andy Weir', isbn: '9780593135204', genre: 'science-fiction', copies: 5 },
  { title: 'The Hound of the Baskervilles', author: 'Arthur Conan Doyle', isbn: '9780486282145', genre: 'mystery', copies: 2 },
  { title: 'Murder on the Orient Express', author: 'Agatha Christie', isbn: '9780062693662', genre: 'mystery', copies: 3 },
  { title: 'The Big Sleep', author: 'Raymond Chandler', isbn: '9780394758282', genre: 'mystery', copies: 1 },
  { title: 'Gone Girl', author: 'Gillian Flynn', isbn: '9780307588371', genre: 'mystery', copies: 3 },
  { title: 'Sapiens', author: 'Yuval Noah Harari', isbn: '9780062316110', genre: 'non-fiction', copies: 4 },
  { title: 'Educated', author: 'Tara Westover', isbn: '9780399590504', genre: 'non-fiction', copies: 2 },
  { title: 'The Soul of a New Machine', author: 'Tracy Kidder', isbn: '9780316491976', genre: 'non-fiction', copies: 1 },
  { title: 'Atomic Habits', author: 'James Clear', isbn: '9780735211292', genre: 'non-fiction', copies: 3 },
];

async function main() {
  const genreIds: Record<string, number> = {};

  for (const g of genres) {
    const row = await prisma.genre.upsert({
      where: { slug: g.slug },
      update: {},
      create: g,
    });
    genreIds[g.slug] = row.id;
  }

  for (const b of books) {
    await prisma.book.upsert({
      where: { isbn: b.isbn },
      update: {},
      create: {
        title: b.title,
        author: b.author,
        isbn: b.isbn,
        totalCopies: b.copies,
        availableCopies: b.copies,
        genreId: genreIds[b.genre],
      },
    });
  }

  console.log(`Seeded ${genres.length} genres and ${books.length} books`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());