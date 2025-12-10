import { useState, useEffect } from 'react';
import HomePage from './components/HomePage';
import TopicsPage from './components/TopicsPage';
import TopicDetail from './components/TopicDetail';
import VideosPage from './components/VideosPage';
import ExercisesPage from './components/ExercisesPage';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import { projectId, publicAnonKey } from './utils/supabase/info';

export type Topic = {
  id: string;
  title: string;
  category: 'nursery' | 'kindergarten';
  description: string;
  order: number; // Thứ tự hiển thị
};

export type Video = {
  id: string;
  topicId: string;
  title: string;
  thumbnail: string;
  videoUrl: string;
  contentType: 'skill' | 'emotion'; // Kỹ năng hoặc Tình cảm
};

export type MatchingExercise = {
  id: string;
  topicId: string;
  title: string;
  pairs: { image: string; text: string }[];
};

export type QuizExercise = {
  id: string;
  topicId: string;
  title: string;
  questions: {
    question: string;
    options: string[];
    correctAnswer: number;
  }[];
};

export type AppData = {
  topics: Topic[];
  videos: Video[];
  matchingExercises: MatchingExercise[];
  quizExercises: QuizExercise[];
};

const initialData: AppData = {
  topics: [
    { id: '1', title: 'Bé và các bạn', category: 'nursery', description: 'Học cách chào hỏi và kết bạn', order: 1 },
    { id: '2', title: 'Đồ dùng đồ chơi', category: 'nursery', description: 'Nhận biết các đồ dùng và đồ chơi', order: 2 },
    { id: '3', title: 'Cô và các bác trong nhà trẻ', category: 'nursery', description: 'Làm quen với các cô và bác', order: 3 },
    { id: '4', title: 'Cây và bông hoa', category: 'nursery', description: 'Khám phá thiên nhiên xung quanh', order: 4 },
    { id: '5', title: 'Trường mầm non', category: 'kindergarten', description: 'Làm quen với trường lớp', order: 1 },
    { id: '6', title: 'Bản thân', category: 'kindergarten', description: 'Nhận biết cơ thể và cảm xúc', order: 2 },
    { id: '7', title: 'Gia đình', category: 'kindergarten', description: 'Tìm hiểu về gia đình', order: 3 },
    { id: '8', title: 'Nghề nghiệp', category: 'kindergarten', description: 'Khám phá các nghề nghiệp', order: 4 },
  ],
  videos: [
    { id: 'v1', topicId: '1', title: 'Chào bạn mới', thumbnail: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', contentType: 'skill' },
    { id: 'v2', topicId: '2', title: 'Đồ chơi của bé', thumbnail: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', contentType: 'skill' },
    { id: 'v3', topicId: '6', title: 'Cơ thể ca bé', thumbnail: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', contentType: 'emotion' },
  ],
  matchingExercises: [
    {
      id: 'm1',
      topicId: '2',
      title: 'Ghép đồ chơi với tên',
      pairs: [
        { image: '🎨', text: 'Bút màu' },
        { image: '⚽', text: 'Bóng đá' },
        { image: '🧸', text: 'Gấu bông' },
        { image: '🚗', text: 'Ô tô' },
      ],
    },
  ],
  quizExercises: [
    {
      id: 'q1',
      topicId: '1',
      title: 'Câu hỏi về bạn bè',
      questions: [
        {
          question: 'Khi gặp bạn, bé nên nói gì?',
          options: ['Xin chào', 'Tạm biệt', 'Ngủ ngon'],
          correctAnswer: 0,
        },
        {
          question: 'Khi chia tay bạn, bé nên nói gì?',
          options: ['Xin chào', 'Tạm biệt', 'Chúc ngủ ngon'],
          correctAnswer: 1,
        },
      ],
    },
  ],
};

type Page = 'home' | 'topics' | 'videos' | 'exercises' | 'admin-login' | 'admin-dashboard' | 'topic-detail';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-2e8b32fc`;

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [appData, setAppData] = useState<AppData>(initialData);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from Supabase
  useEffect(() => {
    loadDataFromSupabase();
  }, []);

  const loadDataFromSupabase = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all data in parallel
      const [topicsRes, videosRes, matchingRes, quizRes] = await Promise.all([
        fetch(`${API_URL}/topics`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }),
        fetch(`${API_URL}/videos`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }),
        fetch(`${API_URL}/matching-exercises`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }),
        fetch(`${API_URL}/quiz-exercises`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }),
      ]);

      const topics = await topicsRes.json();
      const videos = await videosRes.json();
      const matching = await matchingRes.json();
      const quiz = await quizRes.json();

      // If no data exists, initialize with default data
      if (topics.topics.length === 0) {
        await initializeSupabaseData();
        await loadDataFromSupabase(); // Reload after initialization
        return;
      }

      // Migration: Add order field to existing topics if missing
      const migratedTopics = topics.topics.map((topic: Topic, index: number) => {
        if (topic.order === undefined || topic.order === null) {
          // Group by category and assign order
          const sameCategory = topics.topics.filter((t: Topic) => t.category === topic.category);
          const indexInCategory = sameCategory.findIndex((t: Topic) => t.id === topic.id);
          return { ...topic, order: indexInCategory + 1 };
        }
        return topic;
      });

      // Check if migration was needed and save back to server
      const needsMigration = topics.topics.some((t: Topic) => t.order === undefined || t.order === null);
      if (needsMigration) {
        // Save migrated topics back to server
        await Promise.all(
          migratedTopics.map((topic: Topic) =>
            fetch(`${API_URL}/topics/${topic.id}`, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${publicAnonKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(topic),
            })
          )
        );
      }

      setAppData({
        topics: migratedTopics || [],
        videos: videos.videos || [],
        matchingExercises: matching.exercises || [],
        quizExercises: quiz.exercises || [],
      });
    } catch (error) {
      console.error('Error loading data from Supabase:', error);
      // Fallback to localStorage if Supabase fails
      const savedData = localStorage.getItem('mamNonData');
      if (savedData) {
        setAppData(JSON.parse(savedData));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const initializeSupabaseData = async () => {
    try {
      const response = await fetch(`${API_URL}/initialize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(initialData),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Error initializing Supabase data:', error);
      }
    } catch (error) {
      console.error('Error initializing Supabase data:', error);
    }
  };

  const navigateTo = (page: Page, topicId?: string) => {
    setCurrentPage(page);
    if (topicId) {
      setSelectedTopicId(topicId);
    }
  };

  const handleLogin = (username: string, password: string) => {
    if (username === 'admin' && password === 'admin123') {
      setIsAdmin(true);
      setCurrentPage('admin-dashboard');
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setCurrentPage('home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-pink-50">
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải dữ liệu...</p>
          </div>
        </div>
      ) : (
        <>
          {currentPage === 'home' && (
            <HomePage navigateTo={navigateTo} />
          )}
          {currentPage === 'topics' && (
            <TopicsPage topics={appData.topics} navigateTo={navigateTo} />
          )}
          {currentPage === 'topic-detail' && selectedTopicId && (
            <TopicDetail
              topic={appData.topics.find(t => t.id === selectedTopicId)!}
              videos={appData.videos.filter(v => v.topicId === selectedTopicId)}
              matchingExercises={appData.matchingExercises.filter(e => e.topicId === selectedTopicId)}
              quizExercises={appData.quizExercises.filter(e => e.topicId === selectedTopicId)}
              navigateTo={navigateTo}
            />
          )}
          {currentPage === 'videos' && (
            <VideosPage videos={appData.videos} topics={appData.topics} navigateTo={navigateTo} />
          )}
          {currentPage === 'exercises' && (
            <ExercisesPage
              matchingExercises={appData.matchingExercises}
              quizExercises={appData.quizExercises}
              topics={appData.topics}
              navigateTo={navigateTo}
            />
          )}
          {currentPage === 'admin-login' && (
            <AdminLogin onLogin={handleLogin} navigateTo={navigateTo} />
          )}
          {currentPage === 'admin-dashboard' && isAdmin && (
            <AdminDashboard
              appData={appData}
              setAppData={setAppData}
              onLogout={handleLogout}
              navigateTo={navigateTo}
              reloadData={loadDataFromSupabase}
            />
          )}
        </>
      )}
    </div>
  );
}