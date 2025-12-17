import { useState, useEffect } from 'react';
import { LogOut, Plus, Edit2, Trash2, Video, BookOpen, GamepadIcon, Upload, Layers } from 'lucide-react';
import type { AppData, Topic, Video as VideoType, MatchingExercise, QuizExercise, Field } from '../App';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { convertToEmbedUrl } from '../utils/videoUtils';

type AdminDashboardProps = {
  appData: AppData;
  setAppData: (data: AppData) => void;
  onLogout: () => void;
  navigateTo: (page: string) => void;
  reloadData: () => Promise<void>;
};

type TabType = 'topics' | 'videos' | 'matching' | 'quiz' | 'fields';

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
  const [videoForm, setVideoForm] = useState({ 
    assignType: 'topic' as 'topic' | 'field', // Chọn gán vào topic hay field
    topicId: '', 
    field: '', 
    category: 'nursery' as 'nursery' | 'kindergarten',
    title: '', 
    thumbnail: '', 
    videoUrl: '', 
    contentType: 'skill' as 'skill' | 'emotion' 
  });
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [videoPreview, setVideoPreview] = useState<string>('');
  
  // Matching Exercise Form
  const [matchingForm, setMatchingForm] = useState({ 
    assignType: 'topic' as 'topic' | 'field',
    topicId: '', 
    field: '', 
    category: 'nursery' as 'nursery' | 'kindergarten',
    title: '', 
    pairs: [{ left: '', right: '' }] 
  });
  const [pairImageFiles, setPairImageFiles] = useState<(File | null)[]>([null]);
  const [pairImagePreviews, setPairImagePreviews] = useState<string[]>(['']);
  
  // Quiz Exercise Form
  const [quizForm, setQuizForm] = useState({
    assignType: 'topic' as 'topic' | 'field',
    topicId: '',
    field: '',
    category: 'nursery' as 'nursery' | 'kindergarten',
    title: '',
    questions: [{ question: '', options: ['', '', ''], correctAnswer: 0 }],
  });

  // Field Form
  const [fieldForm, setFieldForm] = useState({
    name: '',
    category: 'nursery' as 'nursery' | 'kindergarten',
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
        topicId: videoForm.assignType === 'topic' ? videoForm.topicId : undefined,
        field: videoForm.assignType === 'field' ? videoForm.field : undefined,
        category: videoForm.assignType === 'field' ? videoForm.category : undefined,
        title: videoForm.title,
        thumbnail,
        videoUrl,
        contentType: videoForm.assignType === 'topic' ? videoForm.contentType : 'skill',
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
      setVideoForm({ assignType: 'topic', topicId: '', field: '', category: 'nursery', title: '', thumbnail: '', videoUrl: '', contentType: 'skill' });
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
    const assignType = video.field ? 'field' : 'topic';
    setVideoForm({ 
      assignType,
      topicId: video.topicId || '', 
      field: video.field || '',
      category: video.category || 'nursery',
      title: video.title, 
      thumbnail: video.thumbnail, 
      videoUrl: video.videoUrl, 
      contentType: video.contentType 
    });
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
        topicId: videoForm.assignType === 'topic' ? videoForm.topicId : undefined,
        field: videoForm.assignType === 'field' ? videoForm.field : undefined,
        category: videoForm.assignType === 'field' ? videoForm.category : undefined,
        title: videoForm.title,
        thumbnail,
        videoUrl,
        contentType: videoForm.assignType === 'topic' ? videoForm.contentType : 'skill',
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
      setVideoForm({ assignType: 'topic', topicId: '', field: '', category: 'nursery', title: '', thumbnail: '', videoUrl: '', contentType: 'skill' });
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
          updatedPairs[i].left = imageUrl;
        }
      }

      const newExercise: MatchingExercise = {
        id: Date.now().toString(),
        topicId: matchingForm.assignType === 'topic' ? matchingForm.topicId : undefined,
        field: matchingForm.assignType === 'field' ? matchingForm.field : undefined,
        category: matchingForm.assignType === 'field' ? matchingForm.category : undefined,
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
      setMatchingForm({ assignType: 'topic', topicId: '', field: '', category: 'nursery', title: '', pairs: [{ left: '', right: '' }] });
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
    const assignType = exercise.field ? 'field' : 'topic';
    setMatchingForm({ 
      assignType, 
      topicId: exercise.topicId || '', 
      field: exercise.field || '',
      category: exercise.category || 'nursery',
      title: exercise.title, 
      pairs: exercise.pairs.map(p => ({
        left: (p as any).left ?? (p as any).image ?? '',
        right: (p as any).right ?? (p as any).text ?? '',
      })) 
    });
    setPairImageFiles(new Array(exercise.pairs.length).fill(null));
    setPairImagePreviews(exercise.pairs.map(p => (p as any).left ?? (p as any).image ?? ''));
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
          updatedPairs[i].left = imageUrl;
        }
      }

      const updatedExercise: MatchingExercise = {
        ...editingItem,
        topicId: matchingForm.assignType === 'topic' ? matchingForm.topicId : undefined,
        field: matchingForm.assignType === 'field' ? matchingForm.field : undefined,
        category: matchingForm.assignType === 'field' ? matchingForm.category : undefined,
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
      setMatchingForm({ assignType: 'topic', topicId: '', field: '', category: 'nursery', title: '', pairs: [{ left: '', right: '' }] });
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
        topicId: quizForm.assignType === 'topic' ? quizForm.topicId : undefined,
        field: quizForm.assignType === 'field' ? quizForm.field : undefined,
        category: quizForm.assignType === 'field' ? quizForm.category : undefined,
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
      setQuizForm({ assignType: 'topic', topicId: '', field: '', category: 'nursery', title: '', questions: [{ question: '', options: ['', '', ''], correctAnswer: 0 }] });
    } catch (error) {
      console.error('Error adding quiz exercise:', error);
      alert('Lỗi khi thêm bài trắc nghiệm');
    }
  };

  const handleEditQuiz = (exercise: QuizExercise) => {
    setEditingItem(exercise);
    const assignType = exercise.field ? 'field' : 'topic';
    setQuizForm({ 
      assignType,
      topicId: exercise.topicId || '', 
      field: exercise.field || '',
      category: exercise.category || 'nursery',
      title: exercise.title, 
      questions: exercise.questions 
    });
    setShowAddModal(true);
  };

  const handleUpdateQuiz = async () => {
    try {
      const updatedExercise: QuizExercise = {
        ...editingItem,
        topicId: quizForm.assignType === 'topic' ? quizForm.topicId : undefined,
        field: quizForm.assignType === 'field' ? quizForm.field : undefined,
        category: quizForm.assignType === 'field' ? quizForm.category : undefined,
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
      setQuizForm({ assignType: 'topic', topicId: '', field: '', category: 'nursery', title: '', questions: [{ question: '', options: ['', '', ''], correctAnswer: 0 }] });
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

  const handleAddField = async () => {
    try {
      // Get the max order number for the category
      const fieldsInCategory = (appData.fields || []).filter(f => f.category === fieldForm.category);
      const maxOrder = fieldsInCategory.length > 0 
        ? Math.max(...fieldsInCategory.map(f => f.order || 0))
        : 0;

      const newField: Field = {
        id: Date.now().toString(),
        ...fieldForm,
        order: maxOrder + 1,
      };

      const response = await fetch(`${API_URL}/fields`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newField),
      });

      if (!response.ok) throw new Error('Failed to add field');

      await reloadData();
      setShowAddModal(false);
      setFieldForm({ name: '', category: 'nursery' });
    } catch (error) {
      console.error('Error adding field:', error);
      alert('Lỗi khi thêm lĩnh vực');
    }
  };

  const handleEditField = (field: Field) => {
    setEditingItem(field);
    setFieldForm({ name: field.name, category: field.category });
    setShowAddModal(true);
  };

  const handleUpdateField = async () => {
    try {
      const updatedField: Field = {
        ...editingItem,
        name: fieldForm.name,
        category: fieldForm.category,
      };

      const response = await fetch(`${API_URL}/fields/${editingItem.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedField),
      });

      if (!response.ok) throw new Error('Failed to update field');

      await reloadData();
      setShowAddModal(false);
      setEditingItem(null);
      setFieldForm({ name: '', category: 'nursery' });
    } catch (error) {
      console.error('Error updating field:', error);
      alert('Lỗi khi cập nhật lĩnh vực');
    }
  };

  const handleDeleteField = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa? Lưu ý: Các chủ đề/video/bài tập thuộc lĩnh vực này sẽ không còn liên kết.')) return;

    try {
      const response = await fetch(`${API_URL}/fields/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${publicAnonKey}` },
      });

      if (!response.ok) throw new Error('Failed to delete field');

      await reloadData();
    } catch (error) {
      console.error('Error deleting field:', error);
      alert('Lỗi khi xóa lĩnh vực');
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
          <button
            onClick={() => setActiveTab('fields')}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 transition whitespace-nowrap ${
              activeTab === 'fields' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-600'
            }`}
          >
            <Layers className="w-5 h-5" />
            Lĩnh vực
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
                    <td className="px-6 py-4">
                      {video.topicId 
                        ? appData.topics.find(t => t.id === video.topicId)?.title 
                        : video.field 
                          ? `${video.field} (${video.category === 'nursery' ? 'Nhà trẻ' : 'Mẫu giáo'})` 
                          : ''}
                    </td>
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
                    <td className="px-6 py-4">
                      {exercise.topicId 
                        ? appData.topics.find(t => t.id === exercise.topicId)?.title 
                        : exercise.field 
                          ? `${exercise.field} (${exercise.category === 'nursery' ? 'Nhà trẻ' : 'Mẫu giáo'})` 
                          : ''}
                    </td>
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
                    <td className="px-6 py-4">
                      {exercise.topicId 
                        ? appData.topics.find(t => t.id === exercise.topicId)?.title 
                        : exercise.field 
                          ? `${exercise.field} (${exercise.category === 'nursery' ? 'Nhà trẻ' : 'Mẫu giáo'})` 
                          : ''}
                    </td>
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

        {/* Fields Tab */}
        {activeTab === 'fields' && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {(!appData.fields || appData.fields.length === 0) ? (
              <div className="px-6 py-12 text-center">
                <p className="text-gray-600 mb-4">Chưa có lĩnh vực nào. Vui lòng reload trang để khởi tạo dữ liệu mặc định.</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition"
                >
                  Reload trang
                </button>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left">Tên lĩnh vực</th>
                    <th className="px-6 py-3 text-left">Loại</th>
                    <th className="px-6 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {appData.fields.map((field) => (
                    <tr key={field.id} className="border-t">
                      <td className="px-6 py-4">{field.name}</td>
                      <td className="px-6 py-4">{field.category === 'nursery' ? 'Nhà trẻ' : 'Mẫu giáo'}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleEditField(field)}
                          className="text-blue-600 hover:text-blue-800 p-2"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteField(field.id)}
                          className="text-red-600 hover:text-red-800 p-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 my-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-gray-800 mb-6">
              {editingItem ? 'Chỉnh sửa' : 'Thêm mới'} {activeTab === 'topics' ? 'Chủ đề' : activeTab === 'videos' ? 'Video' : activeTab === 'matching' ? 'Bài ghép hình' : activeTab === 'quiz' ? 'Bài trắc nghiệm' : 'Lĩnh vực'}
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
                    onChange={(e) => {
                      const newCategory = e.target.value as 'nursery' | 'kindergarten';
                      const defaultField = (appData.fields || []).find(f => f.category === newCategory && f.order === 1);
                      setTopicForm({ ...topicForm, category: newCategory, field: defaultField?.name || '' });
                    }}
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
                <div>
                  <label className="block mb-2">Lĩnh vực phát triển</label>
                  <select
                    value={topicForm.field}
                    onChange={(e) => setTopicForm({ ...topicForm, field: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    {(appData.fields || [])
                      .filter(f => f.category === topicForm.category)
                      .sort((a, b) => a.order - b.order)
                      .map(field => (
                        <option key={field.id} value={field.name}>{field.name}</option>
                      ))}
                  </select>
                </div>
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
                  <label className="block mb-2">Chọn gán vào</label>
                  <select
                    value={videoForm.assignType}
                    onChange={(e) => setVideoForm({ ...videoForm, assignType: e.target.value as 'topic' | 'field' })}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="topic">Chủ đề</option>
                    <option value="field">Lĩnh vực phát triển</option>
                  </select>
                </div>
                {videoForm.assignType === 'topic' && (
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
                )}
                {videoForm.assignType === 'field' && (
                  <>
                    <div>
                      <label className="block mb-2">Loại</label>
                      <select
                        value={videoForm.category}
                        onChange={(e) => setVideoForm({ ...videoForm, category: e.target.value as 'nursery' | 'kindergarten', field: '' })}
                        className="w-full px-4 py-2 border rounded-lg"
                      >
                        <option value="nursery">Nhà trẻ</option>
                        <option value="kindergarten">Mẫu giáo</option>
                      </select>
                    </div>
                    <div>
                      <label className="block mb-2">Lĩnh vực phát triển</label>
                      <select
                        value={videoForm.field}
                        onChange={(e) => setVideoForm({ ...videoForm, field: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg"
                      >
                        <option value="">Chọn lĩnh vực</option>
                        {(appData.fields || [])
                          .filter(f => f.category === videoForm.category)
                          .sort((a, b) => a.order - b.order)
                          .map(field => (
                            <option key={field.id} value={field.name}>{field.name}</option>
                          ))}
                      </select>
                    </div>
                  </>
                )}
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
                {videoForm.assignType === 'topic' && (
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
                )}
                
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
                  <label className="block mb-2">Chọn gán vào</label>
                  <select
                    value={matchingForm.assignType}
                    onChange={(e) => setMatchingForm({ ...matchingForm, assignType: e.target.value as 'topic' | 'field' })}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="topic">Chủ đề</option>
                    <option value="field">Lĩnh vực phát triển</option>
                  </select>
                </div>
                {matchingForm.assignType === 'topic' && (
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
                )}
                {matchingForm.assignType === 'field' && (
                  <>
                    <div>
                      <label className="block mb-2">Loại</label>
                      <select
                        value={matchingForm.category}
                        onChange={(e) => setMatchingForm({ ...matchingForm, category: e.target.value as 'nursery' | 'kindergarten', field: '' })}
                        className="w-full px-4 py-2 border rounded-lg"
                      >
                        <option value="nursery">Nhà trẻ</option>
                        <option value="kindergarten">Mẫu giáo</option>
                      </select>
                    </div>
                    <div>
                      <label className="block mb-2">Lĩnh vực phát triển</label>
                      <select
                        value={matchingForm.field}
                        onChange={(e) => setMatchingForm({ ...matchingForm, field: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg"
                      >
                        <option value="">Chọn lĩnh vực</option>
                        {(appData.fields || [])
                          .filter(f => f.category === matchingForm.category)
                          .sort((a, b) => a.order - b.order)
                          .map(field => (
                            <option key={field.id} value={field.name}>{field.name}</option>
                          ))}
                      </select>
                    </div>
                  </>
                )}
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
                          <label className="block text-sm mb-1 text-gray-600">Mặt A (URL ảnh hoặc Emoji hoặc Upload)</label>
                          <div className="relative">
                            <input
                              type="text"
                              value={pairImageFiles[index] ? pairImageFiles[index]!.name : pair.left}
                              onChange={(e) => {
                                const newPairs = [...matchingForm.pairs];
                                newPairs[index].left = e.target.value;
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
                                  newPreviews[index] = pair.left;
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
                          <label className="block text-sm mb-1 text-gray-600">Mặt B (URL ảnh / Emoji / chữ)</label>
                          <input
                            type="text"
                            value={pair.right}
                            onChange={(e) => {
                              const newPairs = [...matchingForm.pairs];
                              newPairs[index].right = e.target.value;
                              setMatchingForm({ ...matchingForm, pairs: newPairs });
                            }}
                            className="w-full px-4 py-2 border rounded-lg"
                            placeholder="https://... hoặc 🎯"
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
                      setMatchingForm({ ...matchingForm, pairs: [...matchingForm.pairs, { left: '', right: '' }] });
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
      setMatchingForm({ assignType: 'topic', topicId: '', field: '', category: 'nursery', title: '', pairs: [{ left: '', right: '' }] });
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
                  <label className="block mb-2">Chọn gán vào</label>
                  <select
                    value={quizForm.assignType}
                    onChange={(e) => setQuizForm({ ...quizForm, assignType: e.target.value as 'topic' | 'field' })}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="topic">Chủ đề</option>
                    <option value="field">Lĩnh vực phát triển</option>
                  </select>
                </div>
                {quizForm.assignType === 'topic' && (
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
                )}
                {quizForm.assignType === 'field' && (
                  <>
                    <div>
                      <label className="block mb-2">Lo��i</label>
                      <select
                        value={quizForm.category}
                        onChange={(e) => setQuizForm({ ...quizForm, category: e.target.value as 'nursery' | 'kindergarten', field: '' })}
                        className="w-full px-4 py-2 border rounded-lg"
                      >
                        <option value="nursery">Nhà trẻ</option>
                        <option value="kindergarten">Mẫu giáo</option>
                      </select>
                    </div>
                    <div>
                      <label className="block mb-2">Lĩnh vực phát triển</label>
                      <select
                        value={quizForm.field}
                        onChange={(e) => setQuizForm({ ...quizForm, field: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg"
                      >
                        <option value="">Chọn lĩnh vực</option>
                        {(appData.fields || [])
                          .filter(f => f.category === quizForm.category)
                          .sort((a, b) => a.order - b.order)
                          .map(field => (
                            <option key={field.id} value={field.name}>{field.name}</option>
                          ))}
                      </select>
                    </div>
                  </>
                )}
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
                      setQuizForm({ assignType: 'topic', topicId: '', field: '', category: 'nursery', title: '', questions: [{ question: '', options: ['', '', ''], correctAnswer: 0 }] });
                    }}
                    className="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}

            {/* Field Form */}
            {activeTab === 'fields' && (
              <div className="space-y-4">
                <div>
                  <label className="block mb-2">Tên lĩnh vực</label>
                  <input
                    type="text"
                    value={fieldForm.name}
                    onChange={(e) => setFieldForm({ ...fieldForm, name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="VD: Lĩnh vực phát triển ngôn ngữ"
                  />
                </div>
                <div>
                  <label className="block mb-2">Loại</label>
                  <select
                    value={fieldForm.category}
                    onChange={(e) => setFieldForm({ ...fieldForm, category: e.target.value as 'nursery' | 'kindergarten' })}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="nursery">Nhà trẻ</option>
                    <option value="kindergarten">Mẫu giáo</option>
                  </select>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={editingItem ? handleUpdateField : handleAddField}
                    className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
                  >
                    {editingItem ? 'Cập nhật' : 'Thêm'}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingItem(null);
                      setFieldForm({ name: '', category: 'nursery' });
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