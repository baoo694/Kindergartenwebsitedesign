import { useState, useEffect } from 'react';
import { LogOut, Plus, Edit2, Trash2, Video, BookOpen, GamepadIcon, Upload } from 'lucide-react';
import type { AppData, Topic, Video as VideoType, MatchingExercise, QuizExercise } from '../App';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { convertToEmbedUrl } from '../utils/videoUtils';
import { KINDERGARTEN_FIELDS } from '../utils/constants';

type AdminDashboardProps = {
  appData: AppData;
  setAppData: (data: AppData) => void;
  onLogout: () => void;
  navigateTo: (page: string) => void;
  reloadData: () => Promise<void>;
};

type TabType = 'topics' | 'videos' | 'matching' | 'quiz';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-2e8b32fc`;

export default function AdminDashboard({ appData, setAppData, onLogout, navigateTo, reloadData }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    // Load saved tab from localStorage
    const savedTab = localStorage.getItem('adminActiveTab');
    return (savedTab as TabType) || 'topics';
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Topic Form
  const [topicForm, setTopicForm] = useState({ 
    title: '', 
    category: 'nursery' as 'nursery' | 'kindergarten', 
    description: '',
    field: 'Lĩnh vực phát triển tình cảm - kỹ năng xã hội' // Default field
  });
  
  // Video Form
  const [videoForm, setVideoForm] = useState({ topicId: '', title: '', thumbnail: '', videoUrl: '', contentType: 'skill' as 'skill' | 'emotion' });
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [videoPreview, setVideoPreview] = useState<string>('');
  
  // Matching Exercise Form
  const [matchingForm, setMatchingForm] = useState({ topicId: '', title: '', pairs: [{ image: '', text: '' }] });
  const [pairImageFiles, setPairImageFiles] = useState<(File | null)[]>([null]);
  const [pairImagePreviews, setPairImagePreviews] = useState<string[]>(['']);
  
  // Quiz Exercise Form
  const [quizForm, setQuizForm] = useState({
    topicId: '',
    title: '',
    questions: [{ question: '', options: ['', '', ''], correctAnswer: 0 }],
  });

  // Save activeTab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('adminActiveTab', activeTab);
  }, [activeTab]);

  const handleUploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/upload-image`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${publicAnonKey}` },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload image');
    }

    const data = await response.json();
    return data.path;
  };

  const handleUploadVideo = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/upload-video`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${publicAnonKey}` },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload video');
    }

    const data = await response.json();
    return data.path;
  };

  const handleAddTopic = async () => {
    try {
      // Get the max order number for the category
      const topicsInCategory = appData.topics.filter(t => t.category === topicForm.category);
      const maxOrder = topicsInCategory.length > 0 
        ? Math.max(...topicsInCategory.map(t => t.order || 0))
        : 0;

      const newTopic: Topic = {
        id: Date.now().toString(),
        ...topicForm,
        order: maxOrder + 1, // Set order to be last in category
      };

      const response = await fetch(`${API_URL}/topics`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTopic),
      });

      if (!response.ok) throw new Error('Failed to add topic');

      await reloadData();
      setShowAddModal(false);
      setTopicForm({ title: '', category: 'nursery', description: '', field: 'Lĩnh vực phát triển tình cảm - kỹ năng xã hội' });
    } catch (error) {
      console.error('Error adding topic:', error);
      alert('Lỗi khi thêm chủ đề');
    }
  };

  const handleEditTopic = (topic: Topic) => {
    setEditingItem(topic);
    setTopicForm({ title: topic.title, category: topic.category, description: topic.description, field: topic.field });
    setShowAddModal(true);
  };

  const handleUpdateTopic = async () => {
    try {
      // Debug: Log current editing item to check order
      console.log('Editing item before update:', editingItem);
      console.log('Order value:', editingItem.order);

      const updatedTopic: Topic = {
        id: editingItem.id,
        title: topicForm.title,
        category: topicForm.category,
        description: topicForm.description,
        field: topicForm.field,
        // IMPORTANT: Keep the original order - do not change it
        order: editingItem.order,
      };

      console.log('Updated topic to send:', updatedTopic);

      const response = await fetch(`${API_URL}/topics/${editingItem.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTopic),
      });

      if (!response.ok) throw new Error('Failed to update topic');

      await reloadData();
      setShowAddModal(false);
      setEditingItem(null);
      setTopicForm({ title: '', category: 'nursery', description: '', field: 'Lĩnh vực phát triển tình cảm - kỹ năng xã hội' });
    } catch (error) {
      console.error('Error updating topic:', error);
      alert('Lỗi khi cập nhật chủ đề');
    }
  };

  const handleDeleteTopic = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa?')) return;

    try {
      const response = await fetch(`${API_URL}/topics/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${publicAnonKey}` },
      });

      if (!response.ok) throw new Error('Failed to delete topic');

      await reloadData();
    } catch (error) {
      console.error('Error deleting topic:', error);
      alert('Lỗi khi xóa chủ đề');
    }
  };

  const handleAddVideo = async () => {
    try {
      setIsUploading(true);
      
      let thumbnail = videoForm.thumbnail;
      let videoUrl = videoForm.videoUrl;

      // Upload thumbnail if file is selected
      if (thumbnailFile) {
        thumbnail = await handleUploadImage(thumbnailFile);
      }

      // Upload video if file is selected
      if (videoFile) {
        videoUrl = await handleUploadVideo(videoFile);
      }

      const newVideo: VideoType = {
        id: Date.now().toString(),
        topicId: videoForm.topicId,
        title: videoForm.title,
        thumbnail,
        videoUrl,
        contentType: videoForm.contentType,
      };

      const response = await fetch(`${API_URL}/videos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newVideo),
      });

      if (!response.ok) throw new Error('Failed to add video');

      await reloadData();
      setShowAddModal(false);
      setVideoForm({ topicId: '', title: '', thumbnail: '', videoUrl: '', contentType: 'skill' });
      setThumbnailFile(null);
      setVideoFile(null);
    } catch (error) {
      console.error('Error adding video:', error);
      alert('Lỗi khi thêm video: ' + (error as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditVideo = (video: VideoType) => {
    setEditingItem(video);
    setVideoForm({ topicId: video.topicId, title: video.title, thumbnail: video.thumbnail, videoUrl: video.videoUrl, contentType: video.contentType });
    setThumbnailPreview(video.thumbnail);
    setVideoPreview(video.videoUrl);
    setShowAddModal(true);
  };

  const handleUpdateVideo = async () => {
    try {
      setIsUploading(true);

      let thumbnail = videoForm.thumbnail;
      let videoUrl = videoForm.videoUrl;

      // Upload new thumbnail if file is selected
      if (thumbnailFile) {
        thumbnail = await handleUploadImage(thumbnailFile);
      }

      // Upload new video if file is selected
      if (videoFile) {
        videoUrl = await handleUploadVideo(videoFile);
      }

      const updatedVideo: VideoType = {
        ...editingItem,
        topicId: videoForm.topicId,
        title: videoForm.title,
        thumbnail,
        videoUrl,
        contentType: videoForm.contentType,
      };

      const response = await fetch(`${API_URL}/videos/${editingItem.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedVideo),
      });

      if (!response.ok) throw new Error('Failed to update video');

      await reloadData();
      setShowAddModal(false);
      setEditingItem(null);
      setVideoForm({ topicId: '', title: '', thumbnail: '', videoUrl: '', contentType: 'skill' });
      setThumbnailFile(null);
      setVideoFile(null);
    } catch (error) {
      console.error('Error updating video:', error);
      alert('Lỗi khi cập nhật video: ' + (error as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa?')) return;

    try {
      const response = await fetch(`${API_URL}/videos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${publicAnonKey}` },
      });

      if (!response.ok) throw new Error('Failed to delete video');

      await reloadData();
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('Lỗi khi xóa video');
    }
  };

  const handleAddMatching = async () => {
    try {
      setIsUploading(true);

      // Upload images for pairs that have files selected
      const updatedPairs = [...matchingForm.pairs];
      for (let i = 0; i < pairImageFiles.length; i++) {
        if (pairImageFiles[i]) {
          const imageUrl = await handleUploadImage(pairImageFiles[i]!);
          updatedPairs[i].image = imageUrl;
        }
      }

      const newExercise: MatchingExercise = {
        id: Date.now().toString(),
        topicId: matchingForm.topicId,
        title: matchingForm.title,
        pairs: updatedPairs,
      };

      const response = await fetch(`${API_URL}/matching-exercises`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newExercise),
      });

      if (!response.ok) throw new Error('Failed to add matching exercise');

      await reloadData();
      setShowAddModal(false);
      setMatchingForm({ topicId: '', title: '', pairs: [{ image: '', text: '' }] });
      setPairImageFiles([null]);
      setPairImagePreviews(['']);
    } catch (error) {
      console.error('Error adding matching exercise:', error);
      alert('Lỗi khi thêm bài ghép hình: ' + (error as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditMatching = (exercise: MatchingExercise) => {
    setEditingItem(exercise);
    setMatchingForm({ topicId: exercise.topicId, title: exercise.title, pairs: exercise.pairs });
    setPairImageFiles(new Array(exercise.pairs.length).fill(null));
    setPairImagePreviews(exercise.pairs.map(p => p.image));
    setShowAddModal(true);
  };

  const handleUpdateMatching = async () => {
    try {
      setIsUploading(true);

      // Upload images for pairs that have files selected
      const updatedPairs = [...matchingForm.pairs];
      for (let i = 0; i < pairImageFiles.length; i++) {
        if (pairImageFiles[i]) {
          const imageUrl = await handleUploadImage(pairImageFiles[i]!);
          updatedPairs[i].image = imageUrl;
        }
      }

      const updatedExercise: MatchingExercise = {
        ...editingItem,
        topicId: matchingForm.topicId,
        title: matchingForm.title,
        pairs: updatedPairs,
      };

      const response = await fetch(`${API_URL}/matching-exercises/${editingItem.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedExercise),
      });

      if (!response.ok) throw new Error('Failed to update matching exercise');

      await reloadData();
      setShowAddModal(false);
      setEditingItem(null);
      setMatchingForm({ topicId: '', title: '', pairs: [{ image: '', text: '' }] });
      setPairImageFiles([null]);
      setPairImagePreviews(['']);
    } catch (error) {
      console.error('Error updating matching exercise:', error);
      alert('Lỗi khi cập nhật bài ghép hình: ' + (error as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteMatching = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa?')) return;

    try {
      const response = await fetch(`${API_URL}/matching-exercises/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${publicAnonKey}` },
      });

      if (!response.ok) throw new Error('Failed to delete matching exercise');

      await reloadData();
    } catch (error) {
      console.error('Error deleting matching exercise:', error);
      alert('Lỗi khi xóa bài ghép hình');
    }
  };

  const handleAddQuiz = async () => {
    try {
      const newExercise: QuizExercise = {
        id: Date.now().toString(),
        topicId: quizForm.topicId,
        title: quizForm.title,
        questions: quizForm.questions,
      };

      const response = await fetch(`${API_URL}/quiz-exercises`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newExercise),
      });

      if (!response.ok) throw new Error('Failed to add quiz exercise');

      await reloadData();
      setShowAddModal(false);
      setQuizForm({ topicId: '', title: '', questions: [{ question: '', options: ['', '', ''], correctAnswer: 0 }] });
    } catch (error) {
      console.error('Error adding quiz exercise:', error);
      alert('Lỗi khi thêm bài trắc nghiệm');
    }
  };

  const handleEditQuiz = (exercise: QuizExercise) => {
    setEditingItem(exercise);
    setQuizForm({ topicId: exercise.topicId, title: exercise.title, questions: exercise.questions });
    setShowAddModal(true);
  };

  const handleUpdateQuiz = async () => {
    try {
      const updatedExercise: QuizExercise = {
        ...editingItem,
        topicId: quizForm.topicId,
        title: quizForm.title,
        questions: quizForm.questions,
      };

      const response = await fetch(`${API_URL}/quiz-exercises/${editingItem.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedExercise),
      });

      if (!response.ok) throw new Error('Failed to update quiz exercise');

      await reloadData();
      setShowAddModal(false);
      setEditingItem(null);
      setQuizForm({ topicId: '', title: '', questions: [{ question: '', options: ['', '', ''], correctAnswer: 0 }] });
    } catch (error) {
      console.error('Error updating quiz exercise:', error);
      alert('Lỗi khi cập nhật bài trắc nghiệm');
    }
  };

  const handleDeleteQuiz = async (id: string) => {
    if (!confirm('Bạn có chắc chắn mun xóa?')) return;

    try {
      const response = await fetch(`${API_URL}/quiz-exercises/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${publicAnonKey}` },
      });

      if (!response.ok) throw new Error('Failed to delete quiz exercise');

      await reloadData();
    } catch (error) {
      console.error('Error deleting quiz exercise:', error);
      alert('Lỗi khi xóa bài trắc nghiệm');
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setShowAddModal(true);
    setThumbnailFile(null);
    setVideoFile(null);
    setThumbnailPreview('');
    setVideoPreview('');
  };

  // Update previews when files or URLs change
  useEffect(() => {
    if (thumbnailFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(thumbnailFile);
    } else if (videoForm.thumbnail && !thumbnailFile) {
      setThumbnailPreview(videoForm.thumbnail);
    } else {
      setThumbnailPreview('');
    }
  }, [thumbnailFile, videoForm.thumbnail]);

  useEffect(() => {
    if (videoFile) {
      const url = URL.createObjectURL(videoFile);
      setVideoPreview(url);
      return () => URL.revokeObjectURL(url);
    } else if (videoForm.videoUrl && !videoFile) {
      // Convert YouTube URL to embed format for preview
      const embedUrl = convertToEmbedUrl(videoForm.videoUrl);
      setVideoPreview(embedUrl);
    } else {
      setVideoPreview('');
    }
  }, [videoFile, videoForm.videoUrl]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-white">Quản trị - Admin</h1>
            <div className="flex gap-4">
              <button
                onClick={() => navigateTo('home')}
                className="flex items-center gap-2 hover:bg-white/20 px-4 py-2 rounded-lg transition"
              >
                Về trang chủ
              </button>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 hover:bg-white/20 px-4 py-2 rounded-lg transition"
              >
                <LogOut className="w-5 h-5" />
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b overflow-x-auto">
          <button
            onClick={() => setActiveTab('topics')}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 transition whitespace-nowrap ${
              activeTab === 'topics' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-600'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            Chủ đề
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 transition whitespace-nowrap ${
              activeTab === 'videos' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-600'
            }`}
          >
            <Video className="w-5 h-5" />
            Video
          </button>
          <button
            onClick={() => setActiveTab('matching')}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 transition whitespace-nowrap ${
              activeTab === 'matching' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-600'
            }`}
          >
            <GamepadIcon className="w-5 h-5" />
            Ghép hình
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 transition whitespace-nowrap ${
              activeTab === 'quiz' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-600'
            }`}
          >
            <GamepadIcon className="w-5 h-5" />
            Trắc nghiệm
          </button>
        </div>

        {/* Add Button */}
        <div className="mb-6">
          <button
            onClick={openAddModal}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Thêm mới
          </button>
        </div>

        {/* Topics Tab */}
        {activeTab === 'topics' && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left">Tiêu đề</th>
                  <th className="px-6 py-3 text-left">Loại</th>
                  <th className="px-6 py-3 text-left">Mô tả</th>
                  <th className="px-6 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {appData.topics.map((topic) => (
                  <tr key={topic.id} className="border-t">
                    <td className="px-6 py-4">{topic.title}</td>
                    <td className="px-6 py-4">{topic.category === 'nursery' ? 'Nhà trẻ' : 'Mẫu giáo'}</td>
                    <td className="px-6 py-4">{topic.description}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleEditTopic(topic)}
                        className="text-blue-600 hover:text-blue-800 p-2"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTopic(topic.id)}
                        className="text-red-600 hover:text-red-800 p-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Videos Tab */}
        {activeTab === 'videos' && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left">Tiêu đề</th>
                  <th className="px-6 py-3 text-left">Chủ đề</th>
                  <th className="px-6 py-3 text-left">Thumbnail</th>
                  <th className="px-6 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {appData.videos.map((video) => (
                  <tr key={video.id} className="border-t">
                    <td className="px-6 py-4">{video.title}</td>
                    <td className="px-6 py-4">{appData.topics.find(t => t.id === video.topicId)?.title}</td>
                    <td className="px-6 py-4">
                      <img src={video.thumbnail} alt={video.title} className="w-16 h-16 object-cover rounded" />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleEditVideo(video)}
                        className="text-blue-600 hover:text-blue-800 p-2"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteVideo(video.id)}
                        className="text-red-600 hover:text-red-800 p-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Matching Tab */}
        {activeTab === 'matching' && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left">Tiêu đề</th>
                  <th className="px-6 py-3 text-left">Chủ đề</th>
                  <th className="px-6 py-3 text-left">Số cặp</th>
                  <th className="px-6 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {appData.matchingExercises.map((exercise) => (
                  <tr key={exercise.id} className="border-t">
                    <td className="px-6 py-4">{exercise.title}</td>
                    <td className="px-6 py-4">{appData.topics.find(t => t.id === exercise.topicId)?.title}</td>
                    <td className="px-6 py-4">{exercise.pairs.length}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleEditMatching(exercise)}
                        className="text-blue-600 hover:text-blue-800 p-2"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMatching(exercise.id)}
                        className="text-red-600 hover:text-red-800 p-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Quiz Tab */}
        {activeTab === 'quiz' && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left">Tiêu đề</th>
                  <th className="px-6 py-3 text-left">Chủ đề</th>
                  <th className="px-6 py-3 text-left">Số câu hỏi</th>
                  <th className="px-6 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {appData.quizExercises.map((exercise) => (
                  <tr key={exercise.id} className="border-t">
                    <td className="px-6 py-4">{exercise.title}</td>
                    <td className="px-6 py-4">{appData.topics.find(t => t.id === exercise.topicId)?.title}</td>
                    <td className="px-6 py-4">{exercise.questions.length}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleEditQuiz(exercise)}
                        className="text-blue-600 hover:text-blue-800 p-2"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuiz(exercise.id)}
                        className="text-red-600 hover:text-red-800 p-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 my-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-gray-800 mb-6">
              {editingItem ? 'Chỉnh sửa' : 'Thêm mới'} {activeTab === 'topics' ? 'Chủ đề' : activeTab === 'videos' ? 'Video' : activeTab === 'matching' ? 'Bài ghép hình' : 'Bài trắc nghiệm'}
            </h2>

            {/* Topic Form */}
            {activeTab === 'topics' && (
              <div className="space-y-4">
                <div>
                  <label className="block mb-2">Tiêu đề</label>
                  <input
                    type="text"
                    value={topicForm.title}
                    onChange={(e) => setTopicForm({ ...topicForm, title: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block mb-2">Loại</label>
                  <select
                    value={topicForm.category}
                    onChange={(e) => setTopicForm({ ...topicForm, category: e.target.value as 'nursery' | 'kindergarten' })}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="nursery">Nhà trẻ</option>
                    <option value="kindergarten">Mẫu giáo</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-2">Mô tả</label>
                  <textarea
                    value={topicForm.description}
                    onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    rows={3}
                  />
                </div>
                {topicForm.category === 'kindergarten' && (
                  <div>
                    <label className="block mb-2">Lĩnh vực phát triển (chỉ áp dụng cho Mẫu giáo)</label>
                    <select
                      value={topicForm.field}
                      onChange={(e) => setTopicForm({ ...topicForm, field: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      {KINDERGARTEN_FIELDS.map(field => (
                        <option key={field} value={field}>{field}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="flex gap-4">
                  <button
                    onClick={editingItem ? handleUpdateTopic : handleAddTopic}
                    className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
                  >
                    {editingItem ? 'Cập nhật' : 'Thêm'}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingItem(null);
                      setTopicForm({ title: '', category: 'nursery', description: '', field: 'Lĩnh vực phát triển tình cảm - kỹ năng xã hội' });
                    }}
                    className="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}

            {/* Video Form */}
            {activeTab === 'videos' && (
              <div className="space-y-4">
                <div>
                  <label className="block mb-2">Chủ đề</label>
                  <select
                    value={videoForm.topicId}
                    onChange={(e) => setVideoForm({ ...videoForm, topicId: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="">Chọn chủ đề</option>
                    {appData.topics.map(topic => (
                      <option key={topic.id} value={topic.id}>{topic.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-2">Tiêu đề</label>
                  <input
                    type="text"
                    value={videoForm.title}
                    onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block mb-2">Thumbnail (URL hoặc Upload)</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={thumbnailFile ? thumbnailFile.name : videoForm.thumbnail}
                      onChange={(e) => setVideoForm({ ...videoForm, thumbnail: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg pr-12"
                      placeholder="https://..."
                      readOnly={!!thumbnailFile}
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="thumbnail-upload"
                    />
                    <label
                      htmlFor="thumbnail-upload"
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-purple-600 hover:text-purple-800 cursor-pointer hover:bg-purple-50 rounded"
                      title="Upload hình ảnh"
                    >
                      <Upload className="w-5 h-5" />
                    </label>
                  </div>
                  {thumbnailFile && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                      <span>✓ Đã chọn: {thumbnailFile.name}</span>
                      <button
                        onClick={() => setThumbnailFile(null)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block mb-2">Video (URL YouTube hoặc Upload file)</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={videoFile ? videoFile.name : videoForm.videoUrl}
                      onChange={(e) => setVideoForm({ ...videoForm, videoUrl: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg pr-12"
                      placeholder="https://www.youtube.com/embed/..."
                      readOnly={!!videoFile}
                    />
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="video-upload"
                    />
                    <label
                      htmlFor="video-upload"
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-purple-600 hover:text-purple-800 cursor-pointer hover:bg-purple-50 rounded"
                      title="Upload video"
                    >
                      <Upload className="w-5 h-5" />
                    </label>
                  </div>
                  {videoFile && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                      <span>✓ Đã chọn: {videoFile.name}</span>
                      <button
                        onClick={() => setVideoFile(null)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block mb-2">Loại nội dung</label>
                  <select
                    value={videoForm.contentType}
                    onChange={(e) => setVideoForm({ ...videoForm, contentType: e.target.value as 'skill' | 'emotion' })}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="skill">Kỹ năng</option>
                    <option value="emotion">Cảm xúc</option>
                  </select>
                </div>
                
                {/* Preview Section */}
                {(thumbnailPreview || videoPreview) && (
                  <div className="border-t pt-4 mt-4">
                    <label className="block mb-3 text-gray-700">Xem trước</label>
                    <div className="grid grid-cols-2 gap-4">
                      {thumbnailPreview && (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Thumbnail</p>
                          <img 
                            src={thumbnailPreview} 
                            alt="Thumbnail preview" 
                            className="w-full h-40 object-cover rounded-lg border"
                          />
                        </div>
                      )}
                      {videoPreview && (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Video</p>
                          {videoPreview.includes('youtube.com') || videoPreview.includes('youtu.be') ? (
                            <iframe
                              src={videoPreview}
                              className="w-full h-40 rounded-lg border"
                              allowFullScreen
                            />
                          ) : (
                            <video
                              src={videoPreview}
                              controls
                              className="w-full h-40 rounded-lg border object-cover"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-4">
                  <button
                    onClick={editingItem ? handleUpdateVideo : handleAddVideo}
                    disabled={isUploading}
                    className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Đang tải lên...</span>
                      </>
                    ) : (
                      editingItem ? 'Cập nhật' : 'Thêm'
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingItem(null);
                      setVideoForm({ topicId: '', title: '', thumbnail: '', videoUrl: '', contentType: 'skill' });
                      setThumbnailFile(null);
                      setVideoFile(null);
                    }}
                    disabled={isUploading}
                    className="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 disabled:bg-gray-400"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}

            {/* Matching Form */}
            {activeTab === 'matching' && (
              <div className="space-y-4">
                <div>
                  <label className="block mb-2">Chủ đề</label>
                  <select
                    value={matchingForm.topicId}
                    onChange={(e) => setMatchingForm({ ...matchingForm, topicId: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="">Chọn chủ đề</option>
                    {appData.topics.map(topic => (
                      <option key={topic.id} value={topic.id}>{topic.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-2">Tiêu đề</label>
                  <input
                    type="text"
                    value={matchingForm.title}
                    onChange={(e) => setMatchingForm({ ...matchingForm, title: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block mb-2">Các cặp ghép</label>
                  {matchingForm.pairs.map((pair, index) => (
                    <div key={index} className="mb-4 p-4 border rounded-lg bg-gray-50">
                      <div className="flex gap-2 mb-2">
                        <div className="w-1/2">
                          <label className="block text-sm mb-1 text-gray-600">Hình ảnh (URL hoặc Emoji hoặc Upload)</label>
                          <div className="relative">
                            <input
                              type="text"
                              value={pairImageFiles[index] ? pairImageFiles[index]!.name : pair.image}
                              onChange={(e) => {
                                const newPairs = [...matchingForm.pairs];
                                newPairs[index].image = e.target.value;
                                setMatchingForm({ ...matchingForm, pairs: newPairs });
                              }}
                              className="w-full px-4 py-2 border rounded-lg pr-12"
                              placeholder="https://... hoặc 🎨"
                              readOnly={!!pairImageFiles[index]}
                            />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                const newFiles = [...pairImageFiles];
                                newFiles[index] = file;
                                setPairImageFiles(newFiles);
                                
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    const newPreviews = [...pairImagePreviews];
                                    newPreviews[index] = reader.result as string;
                                    setPairImagePreviews(newPreviews);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="hidden"
                              id={`pair-image-${index}`}
                            />
                            <label
                              htmlFor={`pair-image-${index}`}
                              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-purple-600 hover:text-purple-800 cursor-pointer hover:bg-purple-50 rounded"
                              title="Upload hình ảnh"
                            >
                              <Upload className="w-5 h-5" />
                            </label>
                          </div>
                          {pairImageFiles[index] && (
                            <div className="mt-1 flex items-center gap-2 text-sm text-green-600">
                              <span>✓ {pairImageFiles[index]!.name}</span>
                              <button
                                onClick={() => {
                                  const newFiles = [...pairImageFiles];
                                  newFiles[index] = null;
                                  setPairImageFiles(newFiles);
                                  const newPreviews = [...pairImagePreviews];
                                  newPreviews[index] = pair.image;
                                  setPairImagePreviews(newPreviews);
                                }}
                                className="text-red-600 hover:text-red-800"
                              >
                                ✕
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="w-1/2">
                          <label className="block text-sm mb-1 text-gray-600">Tên</label>
                          <input
                            type="text"
                            value={pair.text}
                            onChange={(e) => {
                              const newPairs = [...matchingForm.pairs];
                              newPairs[index].text = e.target.value;
                              setMatchingForm({ ...matchingForm, pairs: newPairs });
                            }}
                            className="w-full px-4 py-2 border rounded-lg"
                            placeholder="Tên"
                          />
                        </div>
                        <button
                          onClick={() => {
                            const newPairs = matchingForm.pairs.filter((_, i) => i !== index);
                            const newFiles = pairImageFiles.filter((_, i) => i !== index);
                            const newPreviews = pairImagePreviews.filter((_, i) => i !== index);
                            setMatchingForm({ ...matchingForm, pairs: newPairs });
                            setPairImageFiles(newFiles);
                            setPairImagePreviews(newPreviews);
                          }}
                          className="text-red-600 hover:text-red-800 px-2 self-end mb-1"
                          title="Xóa cặp"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      {/* Preview */}
                      {pairImagePreviews[index] && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600 mb-1">Xem trước:</p>
                          {pairImagePreviews[index].startsWith('http') || pairImagePreviews[index].startsWith('data:') || pairImagePreviews[index].startsWith('supabase://') ? (
                            <img 
                              src={pairImagePreviews[index]} 
                              alt="Preview" 
                              className="w-20 h-20 object-cover rounded border"
                            />
                          ) : (
                            <div className="text-4xl">{pairImagePreviews[index]}</div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      setMatchingForm({ ...matchingForm, pairs: [...matchingForm.pairs, { image: '', text: '' }] });
                      setPairImageFiles([...pairImageFiles, null]);
                      setPairImagePreviews([...pairImagePreviews, '']);
                    }}
                    className="text-purple-600 hover:text-purple-800 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm cặp
                  </button>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={editingItem ? handleUpdateMatching : handleAddMatching}
                    disabled={isUploading}
                    className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Đang tải lên...</span>
                      </>
                    ) : (
                      editingItem ? 'Cập nhật' : 'Thêm'
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingItem(null);
                      setMatchingForm({ topicId: '', title: '', pairs: [{ image: '', text: '' }] });
                      setPairImageFiles([null]);
                      setPairImagePreviews(['']);
                    }}
                    disabled={isUploading}
                    className="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 disabled:bg-gray-400"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}

            {/* Quiz Form */}
            {activeTab === 'quiz' && (
              <div className="space-y-4">
                <div>
                  <label className="block mb-2">Chủ đề</label>
                  <select
                    value={quizForm.topicId}
                    onChange={(e) => setQuizForm({ ...quizForm, topicId: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="">Chọn chủ đề</option>
                    {appData.topics.map(topic => (
                      <option key={topic.id} value={topic.id}>{topic.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-2">Tiêu đề</label>
                  <input
                    type="text"
                    value={quizForm.title}
                    onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block mb-2">Câu hỏi</label>
                  {quizForm.questions.map((question, qIndex) => (
                    <div key={qIndex} className="border p-4 rounded-lg mb-4">
                      <input
                        type="text"
                        value={question.question}
                        onChange={(e) => {
                          const newQuestions = [...quizForm.questions];
                          newQuestions[qIndex].question = e.target.value;
                          setQuizForm({ ...quizForm, questions: newQuestions });
                        }}
                        className="w-full px-4 py-2 border rounded-lg mb-2"
                        placeholder="Câu hỏi"
                      />
                      {question.options.map((option, oIndex) => (
                        <input
                          key={oIndex}
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const newQuestions = [...quizForm.questions];
                            newQuestions[qIndex].options[oIndex] = e.target.value;
                            setQuizForm({ ...quizForm, questions: newQuestions });
                          }}
                          className="w-full px-4 py-2 border rounded-lg mb-2"
                          placeholder={`Đáp án ${oIndex + 1}`}
                        />
                      ))}
                      <div className="flex items-center gap-4 mb-2">
                        <label className="text-sm">Đáp án đúng:</label>
                        <select
                          value={question.correctAnswer}
                          onChange={(e) => {
                            const newQuestions = [...quizForm.questions];
                            newQuestions[qIndex].correctAnswer = parseInt(e.target.value);
                            setQuizForm({ ...quizForm, questions: newQuestions });
                          }}
                          className="px-4 py-2 border rounded-lg"
                        >
                          {question.options.map((_, i) => (
                            <option key={i} value={i}>Đáp án {i + 1}</option>
                          ))}
                        </select>
                      </div>
                      <button
                        onClick={() => {
                          const newQuestions = [...quizForm.questions];
                          newQuestions[qIndex].options.push('');
                          setQuizForm({ ...quizForm, questions: newQuestions });
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm mr-4"
                      >
                        + Thêm đáp án
                      </button>
                      <button
                        onClick={() => {
                          const newQuestions = quizForm.questions.filter((_, i) => i !== qIndex);
                          setQuizForm({ ...quizForm, questions: newQuestions });
                        }}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Xóa câu hỏi
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setQuizForm({ 
                      ...quizForm, 
                      questions: [...quizForm.questions, { question: '', options: ['', '', ''], correctAnswer: 0 }] 
                    })}
                    className="text-purple-600 hover:text-purple-800 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm câu hỏi
                  </button>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={editingItem ? handleUpdateQuiz : handleAddQuiz}
                    className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
                  >
                    {editingItem ? 'Cập nhật' : 'Thêm'}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingItem(null);
                      setQuizForm({ topicId: '', title: '', questions: [{ question: '', options: ['', '', ''], correctAnswer: 0 }] });
                    }}
                    className="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}