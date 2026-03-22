const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Club = require('./models/Club');
const Event = require('./models/Event');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Club.deleteMany({});
    await Event.deleteMany({});

    // Create Super Admin
    const superAdmin = await User.create({
      name: 'Super Admin',
      email: 'admin@college.edu',
      password: 'admin123',
      role: 'superadmin',
      department: 'Administration',
    });

    // Create Club Admins
    const clubAdmin1 = await User.create({
      name: 'Ravi Kumar',
      email: 'ravi@college.edu',
      password: 'admin123',
      role: 'clubadmin',
      department: 'Computer Science',
      year: '3rd Year',
    });

    const clubAdmin2 = await User.create({
      name: 'Priya Sharma',
      email: 'priya@college.edu',
      password: 'admin123',
      role: 'clubadmin',
      department: 'Electronics',
      year: '4th Year',
    });

    // Create Participants
    const participant1 = await User.create({
      name: 'Amit Patel',
      email: 'amit@college.edu',
      password: 'pass123',
      role: 'participant',
      department: 'Computer Science',
      year: '2nd Year',
    });

    const participant2 = await User.create({
      name: 'Sneha Reddy',
      email: 'sneha@college.edu',
      password: 'pass123',
      role: 'participant',
      department: 'Mechanical',
      year: '1st Year',
    });

    // Create Clubs
    const techClub = await Club.create({
      name: 'TechVista',
      description: 'The premier technology club fostering innovation through hackathons, workshops, and tech talks. We build the future, one line of code at a time.',
      category: 'technical',
      logo: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80',
      admin: clubAdmin1._id,
      members: [clubAdmin1._id, participant1._id, participant2._id],
    });

    const culturalClub = await Club.create({
      name: 'Kalakriti',
      description: 'Celebrating art, music, dance, and drama. Kalakriti brings the culturally vibrant side of college to life through spectacular performances and exhibitions.',
      category: 'cultural',
      logo: 'https://images.unsplash.com/photo-1547153760-18fc86324498?w=400&q=80',
      admin: clubAdmin2._id,
      members: [clubAdmin2._id, participant1._id],
    });

    const sportsClub = await Club.create({
      name: 'Sportify',
      description: 'Your ultimate destination for competitive and recreational sports. From cricket to chess, we keep the spirit of sportsmanship alive.',
      category: 'sports',
      logo: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&q=80',
      admin: clubAdmin1._id,
      members: [clubAdmin1._id, participant2._id],
    });

    const literaryClub = await Club.create({
      name: 'WordSmith',
      description: 'A haven for wordsmiths — debates, poetry slams, creative writing, and book discussions that ignite intellectual curiosity.',
      category: 'literary',
      logo: 'https://images.unsplash.com/photo-1474932430478-367dbb6832c1?w=400&q=80',
      admin: clubAdmin2._id,
      members: [clubAdmin2._id],
    });

    // Create Events
    const events = await Event.insertMany([
      {
        title: 'HackFusion 2026',
        description: 'A 36-hour national-level hackathon bringing together 500+ developers to solve real-world challenges. Prizes worth ₹2,00,000! Mentorship from industry leaders, free meals, and swag included.',
        date: new Date('2026-04-15'),
        endDate: new Date('2026-04-17'),
        time: '9:00 AM',
        venue: 'Main Auditorium & CS Labs',
        club: techClub._id,
        organizer: clubAdmin1._id,
        price: 299,
        capacity: 500,
        category: 'hackathon',
        coverImage: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1000&q=80',
        tags: ['hackathon', 'coding', 'innovation', 'prizes'],
        status: 'published',
        isApproved: true,
        isFeatured: true,
      },
      {
        title: 'Web Development Bootcamp',
        description: 'An intensive 3-day workshop covering React, Node.js, and MongoDB. Build a full-stack project from scratch with industry-grade tools and best practices.',
        date: new Date('2026-04-10'),
        endDate: new Date('2026-04-12'),
        time: '10:00 AM',
        venue: 'Computer Lab 3',
        club: techClub._id,
        organizer: clubAdmin1._id,
        price: 149,
        capacity: 60,
        category: 'workshop',
        coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1000&q=80',
        tags: ['web development', 'react', 'node.js', 'mongodb'],
        status: 'published',
        isApproved: true,
        isFeatured: true,
      },
      {
        title: 'Sargam Night 2026',
        description: 'The annual musical extravaganza featuring live band performances, solo singing, and a DJ night. An unforgettable evening under the stars!',
        date: new Date('2026-04-20'),
        time: '6:00 PM',
        venue: 'Open Air Theatre',
        club: culturalClub._id,
        organizer: clubAdmin2._id,
        price: 199,
        capacity: 1000,
        category: 'cultural',
        coverImage: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1000&q=80',
        tags: ['music', 'concert', 'live performance'],
        status: 'published',
        isApproved: true,
        isFeatured: true,
      },
      {
        title: 'Inter-College Cricket Tournament',
        description: 'The most anticipated sports event of the year! 16 colleges, 5 days, one champion. Come witness the fierce battles on the cricket field.',
        date: new Date('2026-05-01'),
        endDate: new Date('2026-05-05'),
        time: '8:00 AM',
        venue: 'College Sports Ground',
        club: sportsClub._id,
        organizer: clubAdmin1._id,
        price: 0,
        capacity: 200,
        category: 'sports',
        coverImage: 'https://images.unsplash.com/photo-1540747913346-19e32fc3e64b?w=1000&q=80',
        tags: ['cricket', 'sports', 'tournament'],
        status: 'published',
        isApproved: true,
      },
      {
        title: 'AI & Machine Learning Seminar',
        description: 'An enlightening seminar on the latest breakthroughs in Artificial Intelligence and Machine Learning. Featuring speakers from Google, Microsoft, and top research institutes.',
        date: new Date('2026-04-25'),
        time: '2:00 PM',
        venue: 'Seminar Hall A',
        club: techClub._id,
        organizer: clubAdmin1._id,
        price: 0,
        capacity: 150,
        category: 'seminar',
        coverImage: 'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=1000&q=80',
        tags: ['AI', 'machine learning', 'technology'],
        status: 'published',
        isApproved: true,
      },
      {
        title: 'Poetry Slam Championship',
        description: 'Express yourself through the power of words! Compete in our annual poetry slam and win exciting prizes. Open mic sessions, guest poets, and spoken word performances.',
        date: new Date('2026-04-22'),
        time: '3:00 PM',
        venue: 'Library Hall',
        club: literaryClub._id,
        organizer: clubAdmin2._id,
        price: 49,
        capacity: 80,
        category: 'competition',
        coverImage: 'https://images.unsplash.com/photo-1474175281363-f0aefcdce2e1?w=1000&q=80',
        tags: ['poetry', 'literature', 'competition'],
        status: 'published',
        isApproved: true,
      },
    ]);

    console.log('✅ Database seeded successfully!');
    console.log('');
    console.log('📧 Login Credentials:');
    console.log('   Super Admin:  admin@college.edu / admin123');
    console.log('   Club Admin 1: ravi@college.edu / admin123');
    console.log('   Club Admin 2: priya@college.edu / admin123');
    console.log('   Participant:  amit@college.edu / pass123');
    console.log('   Participant:  sneha@college.edu / pass123');
    console.log('');
    console.log(`📊 Created: ${events.length} events, 4 clubs, 5 users`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedDB();
