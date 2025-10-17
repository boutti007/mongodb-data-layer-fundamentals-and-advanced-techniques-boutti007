#!/usr/bin/env node
/**
 * insert_books.js
 *
 * Inserts sample book documents into the plp_bookstore.books collection.
 *
 * Usage:
 *   MONGODB_URI="mongodb://localhost:27017" node insert_books.js
 *
 * If MONGODB_URI is not set, defaults to mongodb://localhost:27017
 */

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'plp_bookstore';
const COLLECTION = 'books';

const sampleBooks = [
  {
    title: 'The Silent Orchard',
    author: 'Ava Harper',
    genre: 'Fiction',
    published_year: 2018,
    price: 14.99,
    in_stock: true,
    pages: 320,
    publisher: 'Harbor Press'
  },
  {
    title: 'Learning MongoDB',
    author: 'Samuel Reed',
    genre: 'Non-Fiction',
    published_year: 2021,
    price: 39.5,
    in_stock: true,
    pages: 280,
    publisher: 'TechBooks'
  },
  {
    title: 'Galaxies Apart',
    author: 'Maya Chen',
    genre: 'Science Fiction',
    published_year: 2012,
    price: 12.0,
    in_stock: false,
    pages: 410,
    publisher: 'Orbit House'
  },
  {
    title: 'The Last Alchemist',
    author: 'Ava Harper',
    genre: 'Fantasy',
    published_year: 2005,
    price: 9.99,
    in_stock: true,
    pages: 450,
    publisher: 'Mythic Press'
  },
  {
    title: 'Mysteries of Grey Manor',
    author: 'Derek Cole',
    genre: 'Mystery',
    published_year: 2016,
    price: 11.5,
    in_stock: false,
    pages: 370,
    publisher: 'Detective House'
  },
  {
    title: 'A Short History of Timekeeping',
    author: 'Nina Patel',
    genre: 'History',
    published_year: 1998,
    price: 24.0,
    in_stock: true,
    pages: 220,
    publisher: 'Chronicle Pub'
  },
  {
    title: 'Romance on 5th Avenue',
    author: 'Liam Brooks',
    genre: 'Romance',
    published_year: 2019,
    price: 7.99,
    in_stock: true,
    pages: 300,
    publisher: 'LoveReads'
  },
  {
    title: 'Data Patterns in the Wild',
    author: 'Samuel Reed',
    genre: 'Non-Fiction',
    published_year: 2015,
    price: 45.0,
    in_stock: false,
    pages: 500,
    publisher: 'TechBooks'
  },
  {
    title: 'Echoes of Tomorrow',
    author: 'Maya Chen',
    genre: 'Science Fiction',
    published_year: 2020,
    price: 18.75,
    in_stock: true,
    pages: 360,
    publisher: 'Orbit House'
  },
  {
    title: 'Memoirs of a Voyager',
    author: 'Isabella Stone',
    genre: 'Biography',
    published_year: 2002,
    price: 16.0,
    in_stock: true,
    pages: 410,
    publisher: 'LifeStory Press'
  },
  {
    title: 'Practical Indexing',
    author: 'Samuel Reed',
    genre: 'Non-Fiction',
    published_year: 2010,
    price: 29.99,
    in_stock: true,
    pages: 200,
    publisher: 'TechBooks'
  },
  {
    title: 'Shadows Under the Ivy',
    author: 'Derek Cole',
    genre: 'Mystery',
    published_year: 2022,
    price: 13.5,
    in_stock: true,
    pages: 330,
    publisher: 'Detective House'
  }
];

async function main() {
  const client = new MongoClient(MONGODB_URI, { useUnifiedTopology: true });

  try {
    await client.connect();
    console.log('Connected to MongoDB:', MONGODB_URI);
    const db = client.db(DB_NAME);
    const col = db.collection(COLLECTION);

    // Insert sample data
    const result = await col.insertMany(sampleBooks, { ordered: true });
    console.log(`Inserted ${result.insertedCount} documents into ${DB_NAME}.${COLLECTION}`);
  } catch (err) {
    console.error('Error inserting books:', err);
  } finally {
    await client.close();
    console.log('Connection closed.');
  }
}

main();
