import { useState, useEffect } from 'react';
import HomePage from './components/HomePage';
import TopicsPage from './components/TopicsPage';
import TopicDetail from './components/TopicDetail';
import VideosPage from './components/VideosPage';
import ExercisesPage from './components/ExercisesPage';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import FieldDetail from './components/FieldDetail';
import { projectId, publicAnonKey } from './utils/supabase/info';

export type Topic = {
  id: string;
  title: string;
  category: 'nursery' | 'kindergarten';
  description: string;
  order: number; // Thứ tự hiển thị
  field?: string; // Lĩnh vực (chỉ áp dụng cho kindergarten)
};

export type Video = {
  id: string;
  topicId?: string; // Optional - có thể thuộc topic hoặc field
  field?: string; // Lĩnh vực - nếu video thuộc lĩnh vực
  category?: 'nursery' | 'kindergarten'; // Danh mục - nếu video thuộc lĩnh vực
  title: string;
  thumbnail: string;
  videoUrl: string;
  contentType: 'skill' | 'emotion'; // Kỹ năng hoặc Tình cảm
};

export type MatchingExercise = {
  id: string;
  topicId?: string; // Optional - có thể thuộc topic hoặc field
  field?: string; // Lĩnh vực - nếu bài tập thuộc lĩnh vực
  category?: 'nursery' | 'kindergarten'; // Danh mục - nếu bài tập thuộc lĩnh vực
  title: string;
  pairs: { image: string; text: string }[];
};

export type QuizExercise = {
  id: string;
  topicId?: string; // Optional - có thể thuộc topic hoặc field
  field?: string; // Lĩnh vực - nếu bài tập thuộc lĩnh vực
  category?: 'nursery' | 'kindergarten'; // Danh mục - nếu bài tập thuộc lĩnh vực
  title: string;
  questions: {
    question: string;
    options: string[];
    correctAnswer: number;
  }[];
};

export type Field = {
  id: string;
  name: string;
  category: 'nursery' | 'kindergarten';
  order: number;
};

export type AppData = {
  topics: Topic[];
  videos: Video[];
  matchingExercises: MatchingExercise[];
  quizExercises: QuizExercise[];
  fields: Field[];
};

const initialData: AppData = {
  topics: [
    { id: '1', title: 'Bé và các bạn', category: 'nursery', description: 'Học cách chào hỏi và kết bạn', order: 1, field: 'Lĩnh vực phát triển tình cảm - kỹ năng xã hội' },
    { id: '2', title: 'Đồ dùng đồ chơi', category: 'nursery', description: 'Nhận biết các đồ dùng và đồ chơi', order: 2, field: 'Lĩnh vực phát triển tình cảm - kỹ năng xã hội' },
    { id: '3', title: 'Cô và các bác trong nhà trẻ', category: 'nursery', description: 'Làm quen với các cô và bác', order: 3, field: 'Lĩnh vực phát triển tình cảm - kỹ năng xã hội' },
    { id: '4', title: 'Cây và bng hoa', category: 'nursery', description: 'Khám phá thiên nhiên xung quanh', order: 4, field: 'Lĩnh vực phát triển tình cảm - kỹ năng xã hội' },
    // Lĩnh vực phát triển tình cảm - kỹ năng xã hội
    { id: '5', title: 'Trường mầm non', category: 'kindergarten', description: 'Làm quen với trường lớp', order: 1, field: 'Lĩnh vực phát triển tình cảm - kỹ năng xã hội' },
    { id: '6', title: 'Bản thân', category: 'kindergarten', description: 'Nhận biết cơ thể và cảm xúc', order: 2, field: 'Lĩnh vực phát triển tình cảm - kỹ năng xã hội' },
    { id: '7', title: 'Gia đình', category: 'kindergarten', description: 'Tìm hiểu về gia đình', order: 3, field: 'Lĩnh vực phát triển tình cảm - kỹ năng xã hội' },
    { id: '8', title: 'Nghề nghiệp', category: 'kindergarten', description: 'Khám phá các nghề nghiệp', order: 4, field: 'Lĩnh vực phát triển tình cảm - kỹ năng xã hội' },
    { id: '9', title: 'Động vật', category: 'kindergarten', description: 'Tìm hiểu các loài vật quanh bé', order: 5, field: 'Lĩnh vực phát triển tình cảm - kỹ năng xã hội' },
    { id: '10', title: 'Thực vật', category: 'kindergarten', description: 'Quan sát cây cỏ và hoa lá', order: 6, field: 'Lĩnh vực phát triển tình cảm - kỹ năng xã hội' },
    { id: '11', title: 'Phương tiện giao thông', category: 'kindergarten', description: 'Làm quen luật lệ và an toàn giao thông', order: 7, field: 'Lĩnh vực phát triển tình cảm - kỹ năng xã hội' },
    { id: '12', title: 'Nước và các hiện tượng tự nhiên', category: 'kindergarten', description: 'Khám phá nước và thời tiết', order: 8, field: 'Lĩnh vực phát triển tình cảm - kỹ năng xã hội' },
    { id: '13', title: 'Quê hương–Đất nước–Bác Hồ', category: 'kindergarten', description: 'Bồi dưỡng tình yêu quê hương đất nước', order: 9, field: 'Lĩnh vực phát triển tình cảm - kỹ năng xã hội' },
    { id: '14', title: 'Trường tiểu học', category: 'kindergarten', description: 'Làm quen môi trường tiểu học', order: 10, field: 'Lĩnh vực phát triển tình cảm - kỹ năng xã hội' },
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
  fields: [
    // Nursery fields
    { id: 'nf1', name: 'Lĩnh vực phát triển thể chất', category: 'nursery', order: 1 },
    { id: 'nf2', name: 'Lĩnh vực phát triển ngôn ngữ', category: 'nursery', order: 2 },
    { id: 'nf3', name: 'Lĩnh vực phát triển nhận thức', category: 'nursery', order: 3 },
    { id: 'nf4', name: 'Lĩnh vực phát triển tình cảm - kỹ năng xã hội', category: 'nursery', order: 4 },
    // Kindergarten fields
    { id: 'kf1', name: 'Lĩnh vực phát triển ngôn ngữ', category: 'kindergarten', order: 1 },
    { id: 'kf2', name: 'Lĩnh vực phát triển nhận thức', category: 'kindergarten', order: 2 },
    { id: 'kf3', name: 'Lĩnh vực phát triển thể chất', category: 'kindergarten', order: 3 },
    { id: 'kf4', name: 'Lĩnh vực phát triển thẩm mỹ', category: 'kindergarten', order: 4 },
    { id: 'kf5', name: 'Lĩnh vực phát triển tình cảm - kỹ năng xã hội', category: 'kindergarten', order: 5 },
  ],
};

type Page = 'home' | 'topics' | 'videos' | 'exercises' | 'admin-login' | 'admin-dashboard' | 'topic-detail' | 'field-detail';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-2e8b32fc`;

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [appData, setAppData] = useState<AppData>(initialData);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [selectedFieldName, setSelectedFieldName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from Supabase
  useEffect(() => {
    loadDataFromSupabase();
  }, []);

  const loadDataFromSupabase = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all data in parallel
      const [topicsRes, videosRes, matchingRes, quizRes, fieldsRes] = await Promise.all([
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
        fetch(`${API_URL}/fields`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }),
      ]);

      const topics = await topicsRes.json();
      const videos = await videosRes.json();
      const matching = await matchingRes.json();
      const quiz = await quizRes.json();
      const fields = await fieldsRes.json();

      // If no data exists, initialize with default data
      if (topics.topics.length === 0 || !fields.fields || fields.fields.length === 0) {
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

      // Migration: Add field to kindergarten topics if missing
      const fullyMigratedTopics = migratedTopics.map((topic: Topic) => {
        if (topic.category === 'kindergarten' && !topic.field) {
          // Assign to default field: "Lĩnh vực phát triển tình cảm - kỹ năng xã hội"
          return { ...topic, field: 'Lĩnh vực phát triển tình cảm - kỹ năng xã hội' };
        }
        // Migration: Add field to nursery topics if missing
        if (topic.category === 'nursery' && !topic.field) {
          // Assign to default field: "Lĩnh vực phát triển tình cảm - kỹ năng xã hội"
          return { ...topic, field: 'Lĩnh vực phát triển tình cảm - kỹ năng xã hội' };
        }
        return topic;
      });

      // Check if migration was needed and save back to server
      const needsMigration = topics.topics.some((t: Topic) => t.order === undefined || t.order === null) ||
        topics.topics.some((t: Topic) => (t.category === 'kindergarten' || t.category === 'nursery') && !t.field);
      if (needsMigration) {
        // Save migrated topics back to server
        await Promise.all(
          fullyMigratedTopics.map((topic: Topic) =>
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
        topics: fullyMigratedTopics || [],
        videos: videos.videos || [],
        matchingExercises: matching.exercises || [],
        quizExercises: quiz.exercises || [],
        fields: fields.fields || [],
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
      // If navigating to field-detail, topicId is actually the field name
      if (page === 'field-detail') {
        setSelectedFieldName(topicId);
      } else {
        setSelectedTopicId(topicId);
      }
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
            <VideosPage videos={appData.videos} topics={appData.topics} fields={appData.fields} navigateTo={navigateTo} />
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
          {currentPage === 'field-detail' && selectedFieldName && (
            <FieldDetail
              fieldName={selectedFieldName}
              topics={appData.topics.filter(t => t.field === selectedFieldName)}
              videos={appData.videos.filter(v => {
                // Video thuộc field trực tiếp hoặc thuộc topic trong field
                if (v.field === selectedFieldName) return true;
                const topic = appData.topics.find(t => t.id === v.topicId);
                return topic?.field === selectedFieldName;
              })}
              matchingExercises={appData.matchingExercises.filter(e => {
                // Exercise thuộc field trực tiếp hoặc thuộc topic trong field
                if (e.field === selectedFieldName) return true;
                const topic = appData.topics.find(t => t.id === e.topicId);
                return topic?.field === selectedFieldName;
              })}
              quizExercises={appData.quizExercises.filter(e => {
                // Exercise thuộc field trực tiếp hoặc thuộc topic trong field
                if (e.field === selectedFieldName) return true;
                const topic = appData.topics.find(t => t.id === e.topicId);
                return topic?.field === selectedFieldName;
              })}
              navigateTo={navigateTo}
            />
          )}
        </>
      )}
    </div>
  );
}