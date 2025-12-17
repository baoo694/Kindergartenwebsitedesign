import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger(console.log));

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Initialize storage bucket
const BUCKET_NAME = 'make-2e8b32fc-storage';

async function initializeBucket() {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);
    if (!bucketExists) {
      await supabase.storage.createBucket(BUCKET_NAME, {
        public: true, // Changed to public so images can be accessed directly
      });
      console.log(`Created bucket: ${BUCKET_NAME}`);
    } else {
      // Update existing bucket to be public
      await supabase.storage.updateBucket(BUCKET_NAME, {
        public: true,
      });
    }
  } catch (error) {
    console.error('Error initializing bucket:', error);
  }
}

// Initialize on startup
initializeBucket();

// ===== TOPICS =====
app.get('/make-server-2e8b32fc/topics', async (c) => {
  try {
    const topics = await kv.getByPrefix('topic:');
    // Sort topics by order field
    const sortedTopics = (topics || []).sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
    return c.json({ topics: sortedTopics });
  } catch (error) {
    console.error('Error fetching topics:', error);
    return c.json({ error: 'Failed to fetch topics', details: String(error) }, 500);
  }
});

app.post('/make-server-2e8b32fc/topics', async (c) => {
  try {
    const topic = await c.req.json();
    await kv.set(`topic:${topic.id}`, topic);
    return c.json({ success: true, topic });
  } catch (error) {
    console.error('Error creating topic:', error);
    return c.json({ error: 'Failed to create topic', details: String(error) }, 500);
  }
});

app.put('/make-server-2e8b32fc/topics/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const topic = await c.req.json();
    await kv.set(`topic:${id}`, topic);
    return c.json({ success: true, topic });
  } catch (error) {
    console.error('Error updating topic:', error);
    return c.json({ error: 'Failed to update topic', details: String(error) }, 500);
  }
});

app.delete('/make-server-2e8b32fc/topics/:id', async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(`topic:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting topic:', error);
    return c.json({ error: 'Failed to delete topic', details: String(error) }, 500);
  }
});

// ===== VIDEOS =====
app.get('/make-server-2e8b32fc/videos', async (c) => {
  try {
    const videos = await kv.getByPrefix('video:');
    // Get signed URLs for thumbnails if they are stored in Supabase
    const videosWithSignedUrls = await Promise.all(
      videos.map(async (video: any) => {
        if (video.thumbnail && video.thumbnail.startsWith('supabase://')) {
          const path = video.thumbnail.replace('supabase://', '');
          const { data } = await supabase.storage
            .from(BUCKET_NAME)
            .createSignedUrl(path, 3600);
          if (data?.signedUrl) {
            video.thumbnail = data.signedUrl;
          }
        }
        if (video.videoUrl && video.videoUrl.startsWith('supabase://')) {
          const path = video.videoUrl.replace('supabase://', '');
          const { data } = await supabase.storage
            .from(BUCKET_NAME)
            .createSignedUrl(path, 3600);
          if (data?.signedUrl) {
            video.videoUrl = data.signedUrl;
          }
        }
        return video;
      })
    );
    return c.json({ videos: videosWithSignedUrls || [] });
  } catch (error) {
    console.error('Error fetching videos:', error);
    return c.json({ error: 'Failed to fetch videos', details: String(error) }, 500);
  }
});

app.post('/make-server-2e8b32fc/videos', async (c) => {
  try {
    const video = await c.req.json();
    await kv.set(`video:${video.id}`, video);
    return c.json({ success: true, video });
  } catch (error) {
    console.error('Error creating video:', error);
    return c.json({ error: 'Failed to create video', details: String(error) }, 500);
  }
});

app.put('/make-server-2e8b32fc/videos/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const video = await c.req.json();
    await kv.set(`video:${id}`, video);
    return c.json({ success: true, video });
  } catch (error) {
    console.error('Error updating video:', error);
    return c.json({ error: 'Failed to update video', details: String(error) }, 500);
  }
});

app.delete('/make-server-2e8b32fc/videos/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const video = await kv.get(`video:${id}`);
    // Delete associated files from storage
    if (video) {
      if (video.thumbnail && video.thumbnail.startsWith('supabase://')) {
        const path = video.thumbnail.replace('supabase://', '');
        await supabase.storage.from(BUCKET_NAME).remove([path]);
      }
      if (video.videoUrl && video.videoUrl.startsWith('supabase://')) {
        const path = video.videoUrl.replace('supabase://', '');
        await supabase.storage.from(BUCKET_NAME).remove([path]);
      }
    }
    await kv.del(`video:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting video:', error);
    return c.json({ error: 'Failed to delete video', details: String(error) }, 500);
  }
});

// ===== MATCHING EXERCISES =====
app.get('/make-server-2e8b32fc/matching-exercises', async (c) => {
  try {
    const exercises = await kv.getByPrefix('matching:');
    // Get signed URLs for images if they are stored in Supabase
    const exercisesWithSignedUrls = await Promise.all(
      exercises.map(async (exercise: any) => {
        if (exercise.pairs && Array.isArray(exercise.pairs)) {
          exercise.pairs = await Promise.all(
            exercise.pairs.map(async (pair: any) => {
              // backward compatible fields: image/text or left/right
              const leftPath = pair.left || pair.image;
              const rightPath = pair.right || pair.text;

              if (leftPath && typeof leftPath === 'string' && leftPath.startsWith('supabase://')) {
                const path = leftPath.replace('supabase://', '');
                const { data } = await supabase.storage
                  .from(BUCKET_NAME)
                  .createSignedUrl(path, 3600);
                if (data?.signedUrl) {
                  pair.left = data.signedUrl;
                }
              }

              if (rightPath && typeof rightPath === 'string' && rightPath.startsWith('supabase://')) {
                const path = rightPath.replace('supabase://', '');
                const { data } = await supabase.storage
                  .from(BUCKET_NAME)
                  .createSignedUrl(path, 3600);
                if (data?.signedUrl) {
                  pair.right = data.signedUrl;
                }
              }

              return {
                ...pair,
                left: pair.left ?? leftPath ?? '',
                right: pair.right ?? rightPath ?? '',
              };
            })
          );
        }
        return exercise;
      })
    );
    return c.json({ exercises: exercisesWithSignedUrls || [] });
  } catch (error) {
    console.error('Error fetching matching exercises:', error);
    return c.json({ error: 'Failed to fetch matching exercises', details: String(error) }, 500);
  }
});

app.post('/make-server-2e8b32fc/matching-exercises', async (c) => {
  try {
    const exercise = await c.req.json();
    await kv.set(`matching:${exercise.id}`, exercise);
    return c.json({ success: true, exercise });
  } catch (error) {
    console.error('Error creating matching exercise:', error);
    return c.json({ error: 'Failed to create matching exercise', details: String(error) }, 500);
  }
});

app.put('/make-server-2e8b32fc/matching-exercises/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const exercise = await c.req.json();
    await kv.set(`matching:${id}`, exercise);
    return c.json({ success: true, exercise });
  } catch (error) {
    console.error('Error updating matching exercise:', error);
    return c.json({ error: 'Failed to update matching exercise', details: String(error) }, 500);
  }
});

app.delete('/make-server-2e8b32fc/matching-exercises/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const exercise = await kv.get(`matching:${id}`);

    // Delete associated files from storage
    if (exercise?.pairs && Array.isArray(exercise.pairs)) {
      const pathsToRemove: string[] = [];
      exercise.pairs.forEach((pair: any) => {
        const leftPath = pair.left || pair.image;
        const rightPath = pair.right || pair.text;
        if (leftPath && typeof leftPath === 'string' && leftPath.startsWith('supabase://')) {
          pathsToRemove.push(leftPath.replace('supabase://', ''));
        }
        if (rightPath && typeof rightPath === 'string' && rightPath.startsWith('supabase://')) {
          pathsToRemove.push(rightPath.replace('supabase://', ''));
        }
      });
      if (pathsToRemove.length > 0) {
        await supabase.storage.from(BUCKET_NAME).remove(pathsToRemove);
      }
    }

    await kv.del(`matching:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting matching exercise:', error);
    return c.json({ error: 'Failed to delete matching exercise', details: String(error) }, 500);
  }
});

// ===== QUIZ EXERCISES =====
app.get('/make-server-2e8b32fc/quiz-exercises', async (c) => {
  try {
    const exercises = await kv.getByPrefix('quiz:');
    return c.json({ exercises: exercises || [] });
  } catch (error) {
    console.error('Error fetching quiz exercises:', error);
    return c.json({ error: 'Failed to fetch quiz exercises', details: String(error) }, 500);
  }
});

app.post('/make-server-2e8b32fc/quiz-exercises', async (c) => {
  try {
    const exercise = await c.req.json();
    await kv.set(`quiz:${exercise.id}`, exercise);
    return c.json({ success: true, exercise });
  } catch (error) {
    console.error('Error creating quiz exercise:', error);
    return c.json({ error: 'Failed to create quiz exercise', details: String(error) }, 500);
  }
});

app.put('/make-server-2e8b32fc/quiz-exercises/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const exercise = await c.req.json();
    await kv.set(`quiz:${id}`, exercise);
    return c.json({ success: true, exercise });
  } catch (error) {
    console.error('Error updating quiz exercise:', error);
    return c.json({ error: 'Failed to update quiz exercise', details: String(error) }, 500);
  }
});

app.delete('/make-server-2e8b32fc/quiz-exercises/:id', async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(`quiz:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting quiz exercise:', error);
    return c.json({ error: 'Failed to delete quiz exercise', details: String(error) }, 500);
  }
});

// ===== FILE UPLOAD =====
app.post('/make-server-2e8b32fc/upload-image', async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `images/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, arrayBuffer, {
        contentType: file.type,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return c.json({ error: 'Failed to upload file', details: String(uploadError) }, 500);
    }

    // Return storage path with supabase:// prefix
    return c.json({ success: true, path: `supabase://${filePath}` });
  } catch (error) {
    console.error('Error uploading image:', error);
    return c.json({ error: 'Failed to upload image', details: String(error) }, 500);
  }
});

app.post('/make-server-2e8b32fc/upload-video', async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `videos/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, arrayBuffer, {
        contentType: file.type,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return c.json({ error: 'Failed to upload file', details: String(uploadError) }, 500);
    }

    // Return storage path with supabase:// prefix
    return c.json({ success: true, path: `supabase://${filePath}` });
  } catch (error) {
    console.error('Error uploading video:', error);
    return c.json({ error: 'Failed to upload video', details: String(error) }, 500);
  }
});

// ===== INITIALIZE DATA =====
app.post('/make-server-2e8b32fc/initialize', async (c) => {
  try {
    const data = await c.req.json();
    
    // Clear existing data
    const existingTopics = await kv.getByPrefix('topic:');
    const existingVideos = await kv.getByPrefix('video:');
    const existingMatching = await kv.getByPrefix('matching:');
    const existingQuiz = await kv.getByPrefix('quiz:');
    const existingFields = await kv.getByPrefix('field:');
    
    const keysToDelete = [
      ...existingTopics.map((t: any) => `topic:${t.id}`),
      ...existingVideos.map((v: any) => `video:${v.id}`),
      ...existingMatching.map((m: any) => `matching:${m.id}`),
      ...existingQuiz.map((q: any) => `quiz:${q.id}`),
      ...existingFields.map((f: any) => `field:${f.id}`),
    ];
    
    if (keysToDelete.length > 0) {
      await kv.mdel(keysToDelete);
    }
    
    // Initialize new data
    const topicKeys = data.topics.map((t: any) => `topic:${t.id}`);
    await kv.mset(topicKeys, data.topics);
    
    const videoKeys = data.videos.map((v: any) => `video:${v.id}`);
    await kv.mset(videoKeys, data.videos);
    
    const matchingKeys = data.matchingExercises.map((m: any) => `matching:${m.id}`);
    await kv.mset(matchingKeys, data.matchingExercises);
    
    const quizKeys = data.quizExercises.map((q: any) => `quiz:${q.id}`);
    await kv.mset(quizKeys, data.quizExercises);
    
    // Initialize fields
    if (data.fields && data.fields.length > 0) {
      const fieldKeys = data.fields.map((f: any) => `field:${f.id}`);
      await kv.mset(fieldKeys, data.fields);
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error initializing data:', error);
    return c.json({ error: 'Failed to initialize data', details: String(error) }, 500);
  }
});

// ===== FIELDS =====
app.get('/make-server-2e8b32fc/fields', async (c) => {
  try {
    const fields = await kv.getByPrefix('field:');
    // Sort fields by order field
    const sortedFields = (fields || []).sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
    return c.json({ fields: sortedFields });
  } catch (error) {
    console.error('Error fetching fields:', error);
    return c.json({ error: 'Failed to fetch fields', details: String(error) }, 500);
  }
});

app.post('/make-server-2e8b32fc/fields', async (c) => {
  try {
    const field = await c.req.json();
    await kv.set(`field:${field.id}`, field);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error creating field:', error);
    return c.json({ error: 'Failed to create field', details: String(error) }, 500);
  }
});

app.put('/make-server-2e8b32fc/fields/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const field = await c.req.json();
    await kv.set(`field:${id}`, field);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error updating field:', error);
    return c.json({ error: 'Failed to update field', details: String(error) }, 500);
  }
});

app.delete('/make-server-2e8b32fc/fields/:id', async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(`field:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting field:', error);
    return c.json({ error: 'Failed to delete field', details: String(error) }, 500);
  }
});

Deno.serve(app.fetch);