import path from 'node:path';
import { pathToFileURL } from 'node:url';
import mongoose from 'mongoose';
import User from './models/User.js';
import Project from './models/Project.js';
import { connectDB, disconnectDB } from './config/db.js';

const SAMPLE_PROJECTS = [
  {
    title: 'Never Gonna Give You Up — 15s Retention Hook',
    category: 'short-form',
    platform: 'youtube',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    embedUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1&autoplay=1',
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
    description:
      'A 15-second vertical cut built around a hard hook in the first 3 frames, beat-matched jump cuts and animated captions to push watch-time past 90%.',
    duration: '0:15',
    tags: ['hook', 'captions', 'beat-sync'],
    featured: true,
    order: 1,
  },
  {
    title: 'Despacito — Reels Pace Edit',
    category: 'short-form',
    platform: 'youtube',
    videoUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
    embedUrl: 'https://www.youtube-nocookie.com/embed/kJQP7kiw5Fk?rel=0&modestbranding=1&autoplay=1',
    thumbnail: 'https://i.ytimg.com/vi/kJQP7kiw5Fk/hqdefault.jpg',
    description:
      'Instagram Reels re-cut with punch-in zooms, colour-pop grading and micro sound design. Retention curve held above 85% for the full clip.',
    duration: '0:32',
    tags: ['reels', 'zoom', 'sound-design'],
    featured: false,
    order: 2,
  },
  {
    title: '60-Second Story Arc — Shorts Format',
    category: 'short-form',
    platform: 'youtube',
    videoUrl: 'https://www.youtube.com/watch?v=CevxZvSJLk8',
    embedUrl: 'https://www.youtube-nocookie.com/embed/CevxZvSJLk8?rel=0&modestbranding=1&autoplay=1',
    thumbnail: 'https://i.ytimg.com/vi/CevxZvSJLk8/hqdefault.jpg',
    description:
      'Narrative pacing study: open loop, escalation, payoff. Built in CapCut with auto-captions then finished in Premiere Pro.',
    duration: '0:58',
    tags: ['storytelling', 'capcut', 'captions'],
    featured: false,
    order: 3,
  },
  {
    title: 'Big Buck Bunny — 10 Minute Documentary Cut',
    category: 'long-form',
    platform: 'youtube',
    videoUrl: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
    embedUrl: 'https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ?rel=0&modestbranding=1&autoplay=1',
    thumbnail: 'https://i.ytimg.com/vi/aqz-KE-bpKQ/hqdefault.jpg',
    description:
      'Long-form YouTube documentary edit: chaptered storytelling, B-roll layering, dynamic audio ducking and thumbnail-driven pacing decisions.',
    duration: '10:34',
    tags: ['youtube', 'documentary', 'b-roll'],
    featured: true,
    order: 4,
  },
  {
    title: 'Colour Grade & Finishing — Music Documentary',
    category: 'long-form',
    platform: 'youtube',
    videoUrl: 'https://www.youtube.com/watch?v=OPf0YbXqDm0',
    embedUrl: 'https://www.youtube-nocookie.com/embed/OPf0YbXqDm0?rel=0&modestbranding=1&autoplay=1',
    thumbnail: 'https://i.ytimg.com/vi/OPf0YbXqDm0/hqdefault.jpg',
    description:
      'Full finishing pass: Lumetri grade, film grain, LUT design and loudness normalisation to -14 LUFS for YouTube.',
    duration: '4:12',
    tags: ['colour', 'lumetri', 'audio'],
    featured: false,
    order: 5,
  },
  {
    title: 'Brand Story Film — Vimeo Master',
    category: 'long-form',
    platform: 'vimeo',
    videoUrl: 'https://vimeo.com/76979871',
    embedUrl: 'https://player.vimeo.com/video/76979871?autoplay=1',
    thumbnail: '',
    description:
      'Client brand film delivered in 4K with clean titles, motion-tracked logo placement and a Vimeo review round-trip.',
    duration: '2:47',
    tags: ['brand', 'client', '4k'],
    featured: false,
    order: 6,
  },
  {
    title: 'Kinetic Titles — Motion Graphics Automation',
    category: 'vfx-motion',
    platform: 'youtube',
    videoUrl: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
    embedUrl: 'https://www.youtube-nocookie.com/embed/9bZkp7q19f0?rel=0&modestbranding=1&autoplay=1',
    thumbnail: 'https://i.ytimg.com/vi/9bZkp7q19f0/hqdefault.jpg',
    description:
      'Kinetic typography system with automated lower-thirds and data-driven title templates that cut per-video production time by 60%.',
    duration: '1:20',
    tags: ['motion-graphics', 'templates', 'automation'],
    featured: false,
    order: 7,
  },
  {
    title: 'VFX Breakdown Reel — Custom Player',
    category: 'vfx-motion',
    platform: 'direct',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    embedUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail: '',
    description:
      'Self-hosted breakdown reel: tracking, removals, screen comps and particle work, played through the site’s custom HTML5 player.',
    duration: '0:15',
    tags: ['vfx', 'compositing', 'breakdown'],
    featured: true,
    order: 8,
  },
];

export async function ensureAdmin() {
  const email = (process.env.ADMIN_EMAIL || 'admin@portfolio.dev').toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'ChangeMe123!';

  const existing = await User.findOne({ email });
  if (existing) return existing;

  const user = await User.create({
    name: 'Admin',
    email,
    password,
    role: 'admin',
  });
  console.log(`[seed] admin account created: ${email}`);
  return user;
}

export async function seedProjectsIfEmpty() {
  const count = await Project.countDocuments();
  if (count > 0) return count;
  await Project.insertMany(SAMPLE_PROJECTS);
  console.log(`[seed] inserted ${SAMPLE_PROJECTS.length} sample projects`);
  return SAMPLE_PROJECTS.length;
}

export async function seed() {
  await ensureAdmin();
  await seedProjectsIfEmpty();
}

// Run directly: `npm --prefix server run seed`
if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  const { memoryServer } = await connectDB();
  try {
    await seed();
    console.log('[seed] done');
  } finally {
    await disconnectDB(memoryServer);
    await mongoose.disconnect().catch(() => {});
  }
}
