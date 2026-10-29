const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Movie = require('../models/Movie');
const User = require('../models/User');

dotenv.config({ path: '../.env' }); // In case run from scripts folder
dotenv.config(); // In case run from root or server folder

const sampleMovies = [
  {
    title: 'Inception',
    description:
      'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the project and his team to disaster.',
    poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80',
    banner: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
    genre: ['Sci-Fi', 'Action', 'Thriller'],
    duration: 148,
    rating: 8.8,
    language: 'English',
    ticketPrice: 280,
    showtimes: ['10:30 AM', '02:00 PM', '06:00 PM', '09:30 PM'],
    featured: true,
    director: 'Christopher Nolan',
    cast: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Elliot Page', 'Tom Hardy'],
    trailerUrl: 'https://www.youtube.com/watch?v=YoHD9XEInc0',
  },
  {
    title: 'Interstellar',
    description:
      'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.',
    poster: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    banner: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1600&q=80',
    genre: ['Sci-Fi', 'Drama', 'Adventure'],
    duration: 169,
    rating: 8.7,
    language: 'English',
    ticketPrice: 300,
    showtimes: ['11:00 AM', '03:15 PM', '07:30 PM', '10:45 PM'],
    featured: true,
    director: 'Christopher Nolan',
    cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Michael Caine'],
    trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
  },
  {
    title: 'The Dark Knight',
    description:
      'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    poster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    banner: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80',
    genre: ['Action', 'Crime', 'Drama'],
    duration: 152,
    rating: 9.0,
    language: 'English',
    ticketPrice: 250,
    showtimes: ['01:00 PM', '04:30 PM', '08:00 PM', '11:15 PM'],
    featured: true,
    director: 'Christopher Nolan',
    cast: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart', 'Michael Caine'],
    trailerUrl: 'https://www.youtube.com/watch?v=EXeTwQWrcwY',
  },
  {
    title: 'Cyberpunk Odyssey: 2099',
    description:
      'In a neon-drenched metropolis controlled by synthetic intelligence, a rogue neural detective uncovers a conspiracy that threatens to rewrite human consciousness.',
    poster: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
    banner: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80',
    genre: ['Sci-Fi', 'Action', 'Cyberpunk'],
    duration: 135,
    rating: 8.4,
    language: 'English',
    ticketPrice: 260,
    showtimes: ['12:00 PM', '03:30 PM', '07:00 PM', '10:15 PM'],
    featured: false,
    director: 'Elena Vance',
    cast: ['Alex Rivera', 'Maya Lin', 'Kaelen Cross'],
    trailerUrl: '',
  },
  {
    title: 'Gladiator: Legends of Rome',
    description:
      'A betrayed general fights his way through brutal gladiatorial arenas to avenge the murder of his family and overthrow a corrupt emperor.',
    poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    banner: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1600&q=80',
    genre: ['Action', 'Drama', 'Adventure'],
    duration: 155,
    rating: 8.5,
    language: 'English',
    ticketPrice: 270,
    showtimes: ['10:00 AM', '01:45 PM', '05:30 PM', '09:00 PM'],
    featured: false,
    director: 'Marcus Sterling',
    cast: ['David Vance', 'Helena Roman', 'Viktor Stone'],
    trailerUrl: '',
  },
  {
    title: 'Enchanted Realm',
    description:
      'An ancient magical forest awakens as two unlikely adventurers set out on an extraordinary voyage across mystic valleys to restore the lost crystal of light.',
    poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    banner: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
    genre: ['Fantasy', 'Adventure', 'Family'],
    duration: 120,
    rating: 8.2,
    language: 'English',
    ticketPrice: 240,
    showtimes: ['10:15 AM', '01:00 PM', '04:15 PM', '07:45 PM'],
    featured: false,
    director: 'Sarah Jenkins',
    cast: ['Sophie Turner', 'Liam Neeson', 'Freddie Highmore'],
    trailerUrl: '',
  },
];

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI is missing in .env');
    }

    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to database!');

    // 1. Seed Movies
    console.log('[Seed] Clearing existing movies...');
    await Movie.deleteMany({});
    const insertedMovies = await Movie.insertMany(sampleMovies);
    console.log(`[Seed] Successfully inserted ${insertedMovies.length} movies!`);

    // 2. Seed Default Admin and User accounts (if not already existing)
    console.log('[Seed] Checking default accounts...');
    const adminEmail = 'admin@imovies.com';
    const userEmail = 'user@imovies.com';

    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = await User.create({
        name: 'IMovies Cinema Admin',
        email: adminEmail,
        password: 'AdminPassword123!',
        role: 'admin',
      });
      console.log(`[Seed] Created Default Admin: ${adminEmail}`);
    } else {
      console.log(`[Seed] Admin ${adminEmail} already exists.`);
    }

    let user = await User.findOne({ email: userEmail });
    if (!user) {
      user = await User.create({
        name: 'Movie Fan',
        email: userEmail,
        password: 'UserPassword123!',
        role: 'user',
      });
      console.log(`[Seed] Created Demo User: ${userEmail}`);
    } else {
      console.log(`[Seed] User ${userEmail} already exists.`);
    }

    console.log('\n=========================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY');
    console.log('=========================================');
    console.log('Demo Credentials for Testing:');
    console.log('  Admin: admin@imovies.com / AdminPassword123!');
    console.log('  User:  user@imovies.com  / UserPassword123!');
    console.log('=========================================\n');

    process.exit(0);
  } catch (error) {
    const safeError = error.message.replace(/:\/\/[^@]+@/, '://***:***@');
    console.error('❌ [Seed Error]:', safeError);
    process.exit(1);
  }
};

seedDatabase();
