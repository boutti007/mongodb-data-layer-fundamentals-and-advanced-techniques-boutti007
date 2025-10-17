/**
 * queries.js
 *
 * This file is organized to match the assignment questions/tasks.
 * Run with:
 *   MONGODB_URI="mongodb://localhost:27017" node queries.js
 *
 * Sections:
 * - Task 2: Basic CRUD Operations
 * - Task 3: Advanced Queries (filtering, projection, sorting, pagination)
 * - Task 4: Aggregation Pipelines
 * - Task 5: Indexing and explain()
 */

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'plp_bookstore';
const COLLECTION = 'books';

async function run() {
  const client = new MongoClient(MONGODB_URI, { useUnifiedTopology: true });

  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const col = db.collection(COLLECTION);
    console.log(`Connected to ${DB_NAME}.${COLLECTION}`);

    // -------------------------
    // Task 2: Basic CRUD Operations
    // -------------------------
    console.log('\n--- Task 2: Basic CRUD Operations ---');

    // Find all books in a specific genre
    async function findByGenre(genre) {
      return await col.find({ genre }, { projection: { title: 1, author: 1, price: 1, _id: 0 } }).toArray();
    }
    console.log('\n1) Find all books in genre "Non-Fiction":');
    console.log(await findByGenre('Non-Fiction'));

    // Find books published after a certain year
    async function findPublishedAfter(year) {
      return await col.find({ published_year: { $gt: year } }, { projection: { title: 1, published_year: 1, _id: 0 } }).toArray();
    }
    console.log('\n2) Find books published after 2015:');
    console.log(await findPublishedAfter(2015));

    // Find books by a specific author
    async function findByAuthor(author) {
      return await col.find({ author }, { projection: { title: 1, genre: 1, price: 1, _id: 0 } }).toArray();
    }
    console.log('\n3) Find books by author "Samuel Reed":');
    console.log(await findByAuthor('Samuel Reed'));

    // Update the price of a specific book
    async function updatePriceByTitle(title, newPrice) {
      const res = await col.findOneAndUpdate(
        { title },
        { $set: { price: newPrice } },
        { returnDocument: 'after' }
      );
      return res.value;
    }
    console.log('\n4) Update price of "The Silent Orchard" to 12.49:');
    console.log(await updatePriceByTitle('The Silent Orchard', 12.49));

    // Delete a book by its title
    async function deleteByTitle(title) {
      return await col.deleteOne({ title });
    }
    console.log('\n5) Delete book "Memoirs of a Voyager":');
    console.log('deletedCount:', (await deleteByTitle('Memoirs of a Voyager')).deletedCount);

    // -------------------------
    // Task 3: Advanced Queries
    // -------------------------
    console.log('\n--- Task 3: Advanced Queries ---');

    // Books that are both in stock and published after 2010 (with projection)
    console.log('\n1) Books in stock and published after 2010 (title, author, price):');
    const inStockAfter2010 = await col.find(
      { in_stock: true, published_year: { $gt: 2010 } },
      { projection: { title: 1, author: 1, price: 1, _id: 0 } }
    ).toArray();
    console.log(inStockAfter2010);

    // Projection example is used above (title, author, price). Additional projection example:
    console.log('\n2) Projection-only example (title, author, price) for all books:');
    console.log(await col.find({}, { projection: { title: 1, author: 1, price: 1, _id: 0 } }).toArray());

    // Sorting by price ascending and descending
    console.log('\n3) Sort by price ascending (title, price):');
    console.log(await col.find({}, { projection: { title: 1, price: 1, _id: 0 } }).sort({ price: 1 }).toArray());

    console.log('\n4) Sort by price descending (title, price):');
    console.log(await col.find({}, { projection: { title: 1, price: 1, _id: 0 } }).sort({ price: -1 }).toArray());

    // Pagination: limit and skip (5 books per page)
    const pageSize = 5;
    async function getPage(pageNumber) {
      const skip = (pageNumber - 1) * pageSize;
      return await col.find({}, { projection: { title: 1, author: 1, _id: 0 } }).sort({ title: 1 }).skip(skip).limit(pageSize).toArray();
    }
    console.log(`\n5) Pagination (page size = ${pageSize}):`);
    console.log('Page 1:', await getPage(1));
    console.log('Page 2:', await getPage(2));

    // -------------------------
    // Task 4: Aggregation Pipeline
    // -------------------------
    console.log('\n--- Task 4: Aggregation Pipelines ---');

    // 1) Average price of books by genre
    console.log('\n1) Average price of books by genre:');
    const avgPriceByGenre = await col.aggregate([
      { $group: { _id: '$genre', averagePrice: { $avg: '$price' }, count: { $sum: 1 } } },
      { $sort: { averagePrice: -1 } }
    ]).toArray();
    console.log(avgPriceByGenre);

    // 2) Find the author with the most books in the collection
    console.log('\n2) Author with the most books:');
    const topAuthor = await col.aggregate([
      { $group: { _id: '$author', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]).toArray();
    console.log(topAuthor);

    // 3) Group books by publication decade and count them
    console.log('\n3) Group books by publication decade and count them:');
    const byDecade = await col.aggregate([
      { $addFields: { decade: { $multiply: [{ $floor: { $divide: ['$published_year', 10] } }, 10] } } },
      { $group: { _id: '$decade', count: { $sum: 1 }, titles: { $push: '$title' } } },
      { $sort: { _id: 1 } }
    ]).toArray();
    console.log(byDecade);

    // -------------------------
    // Task 5: Indexing
    // -------------------------
    console.log('\n--- Task 5: Indexing ---');

    // Sample query for title lookups
    const sampleQuery = { title: 'Echoes of Tomorrow' };

    // Explain before creating index
    console.log('\nExplain plan for sample title query BEFORE creating index:');
    const explainBefore = await col.find(sampleQuery).explain('executionStats');
    console.log({
      totalDocsExamined: explainBefore.executionStats ? explainBefore.executionStats.totalDocsExamined : null,
      totalKeysExamined: explainBefore.executionStats ? explainBefore.executionStats.totalKeysExamined : null,
      executionTimeMillis: explainBefore.executionStats ? explainBefore.executionStats.executionTimeMillis : null,
      winningPlan: explainBefore.queryPlanner ? explainBefore.queryPlanner.winningPlan : null
    });

    // Create index on title field
    console.log('\nCreating index: { title: 1 } (name: idx_title_1)');
    await col.createIndex({ title: 1 }, { name: 'idx_title_1' });

    // Create compound index on author and published_year
    console.log('Creating compound index: { author: 1, published_year: -1 } (name: idx_author_publishedYear)');
    await col.createIndex({ author: 1, published_year: -1 }, { name: 'idx_author_publishedYear' });

    // Explain after creating index
    console.log('\nExplain plan for sample title query AFTER creating index:');
    const explainAfter = await col.find(sampleQuery).explain('executionStats');
    console.log({
      totalDocsExamined: explainAfter.executionStats ? explainAfter.executionStats.totalDocsExamined : null,
      totalKeysExamined: explainAfter.executionStats ? explainAfter.executionStats.totalKeysExamined : null,
      executionTimeMillis: explainAfter.executionStats ? explainAfter.executionStats.executionTimeMillis : null,
      winningPlan: explainAfter.queryPlanner ? explainAfter.queryPlanner.winningPlan : null
    });

    // Explain plan for a query that can use the compound index
    const authorQuery = { author: 'Samuel Reed', published_year: { $gte: 2000 } };
    console.log('\nExplain plan for query using author + published_year (compound index):');
    const explainCompound = await col.find(authorQuery).explain('executionStats');
    console.log({
      totalDocsExamined: explainCompound.executionStats ? explainCompound.executionStats.totalDocsExamined : null,
      totalKeysExamined: explainCompound.executionStats ? explainCompound.executionStats.totalKeysExamined : null,
      executionTimeMillis: explainCompound.executionStats ? explainCompound.executionStats.executionTimeMillis : null,
      winningPlan: explainCompound.queryPlanner ? explainCompound.queryPlanner.winningPlan : null
    });

    console.log('\n--- All tasks completed ---\n');
  } catch (err) {
    console.error('Error during queries.js run:', err);
  } finally {
    await client.close();
    console.log('Connection closed.');
  }
}

run();
