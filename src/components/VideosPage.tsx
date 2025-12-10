import { ArrowLeft, Play } from 'lucide-react';
import { useState } from 'react';
import Header from './Header';
import type { Video, Topic, Field } from '../App';
import { convertToEmbedUrl } from '../utils/videoUtils';

type VideosPageProps = {
  videos: Video[];
  topics: Topic[];
  fields: Field[];
  navigateTo: (page: string) => void;
};

export default function VideosPage({ videos, topics, fields, navigateTo }: VideosPageProps) {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'nursery' | 'kindergarten'>('all');

  const getTopicTitle = (topicId: string) => {
    return topics.find(t => t.id === topicId)?.title || 'Không rõ';
  };

  const getVideoLabel = (video: Video) => {
    if (video.topicId) {
      return getTopicTitle(video.topicId);
    } else if (video.field) {
      return video.field;
    }
    return 'Không rõ';
  };

  const filteredVideos = videos.filter(video => {
    if (selectedCategory === 'all') return true;
    
    // Nếu video thuộc topic
    if (video.topicId) {
      const topic = topics.find(t => t.id === video.topicId);
      return topic?.category === selectedCategory;
    }
    
    // Nếu video thuộc field
    if (video.field) {
      return video.category === selectedCategory;
    }
    
    return false;
  });

  return (
    <div className="min-h-screen pt-16 md:pt-20">
      {/* Header */}
      <Header title="Video bài giảng" navigateTo={navigateTo} showNav={false} showBackButton={true} />

      <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
        {/* Category Filter */}
        <div className="flex gap-2 md:gap-4 mb-6 md:mb-8 flex-wrap">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 md:px-6 py-2 md:py-3 rounded-lg transition ${
              selectedCategory === 'all'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-purple-50 shadow'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setSelectedCategory('nursery')}
            className={`px-4 md:px-6 py-2 md:py-3 rounded-lg transition ${
              selectedCategory === 'nursery'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-purple-50 shadow'
            }`}
          >
            Nhà trẻ
          </button>
          <button
            onClick={() => setSelectedCategory('kindergarten')}
            className={`px-4 md:px-6 py-2 md:py-3 rounded-lg transition ${
              selectedCategory === 'kindergarten'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-purple-50 shadow'
            }`}
          >
            Mẫu giáo
          </button>
        </div>

        {filteredVideos.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <p>Chưa có video nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {filteredVideos.map(video => (
              <div
                key={video.id}
                onClick={() => setSelectedVideo(video)}
                className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition cursor-pointer hover:scale-105 active:scale-95"
              >
                <div className="relative">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-40 md:h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center hover:bg-black/50 transition">
                    <Play className="w-12 h-12 md:w-16 md:h-16 text-white" />
                  </div>
                </div>
                <div className="p-3 md:p-4">
                  <h3 className="text-gray-800 mb-2 text-sm md:text-base">{video.title}</h3>
                  <p className="text-purple-600 text-sm">{getVideoLabel(video)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full overflow-hidden">
            <div className="p-3 md:p-4 border-b flex items-center justify-between">
              <div>
                <h3 className="text-gray-800 text-sm md:text-base lg:text-lg">{selectedVideo.title}</h3>
                <p className="text-purple-600 text-xs md:text-sm">{getVideoLabel(selectedVideo)}</p>
              </div>
              <button
                onClick={() => setSelectedVideo(null)}
                className="text-gray-500 hover:text-gray-700 px-3 md:px-4 py-2 text-sm md:text-base"
              >
                Đóng
              </button>
            </div>
            <div className="aspect-video">
              <iframe
                src={convertToEmbedUrl(selectedVideo.videoUrl)}
                className="w-full h-full"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}