import { ArrowLeft, Video, GamepadIcon, Play, FileText, Download } from 'lucide-react';
import { useState } from 'react';
import Header from './Header';
import type { Topic, Video as VideoType, MatchingExercise, QuizExercise, Document } from '../App';
import MatchingGame from './MatchingGame';
import QuizGame from './QuizGame';
import { convertToEmbedUrl, convertSupabaseUrl } from '../utils/videoUtils';
import { projectId } from '../utils/supabase/info';

type TopicDetailProps = {
  topic: Topic;
  videos: VideoType[];
  matchingExercises: MatchingExercise[];
  quizExercises: QuizExercise[];
  documents: Document[];
  navigateTo: (page: string) => void;
};

export default function TopicDetail({
  topic,
  videos,
  matchingExercises,
  quizExercises,
  documents,
  navigateTo,
}: TopicDetailProps) {
  const getDocumentUrl = (document: Document): string => {
    return convertSupabaseUrl(document.fileUrl, projectId);
  };
  const [activeTab, setActiveTab] = useState<'skill' | 'emotion'>('skill');
  const [selectedVideo, setSelectedVideo] = useState<VideoType | null>(null);
  const [selectedMatchingExercise, setSelectedMatchingExercise] = useState<MatchingExercise | null>(null);
  const [selectedQuizExercise, setSelectedQuizExercise] = useState<QuizExercise | null>(null);

  // Filter videos by content type
  const skillVideos = videos.filter(v => v.contentType === 'skill');
  const emotionVideos = videos.filter(v => v.contentType === 'emotion');

  return (
    <div className="min-h-screen pt-16 md:pt-20">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white shadow-lg z-50">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-white text-xl md:text-2xl lg:text-3xl">{topic.title}</h1>
              <p className="text-white/90 text-sm md:text-base">{topic.description}</p>
            </div>
            <button
              onClick={() => navigateTo('topics')}
              className="flex items-center gap-2 hover:bg-white/20 px-3 md:px-4 py-2 rounded-lg transition text-sm md:text-base"
            >
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline">Quay lại</span>
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
        {/* Tab Navigation */}
        <div className="flex gap-2 md:gap-4 mb-6 md:mb-8 border-b">
          <button
            onClick={() => setActiveTab('skill')}
            className={`flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 border-b-2 transition text-sm md:text-base ${
              activeTab === 'skill' 
                ? 'border-purple-600 text-purple-600' 
                : 'border-transparent text-gray-600 hover:text-purple-600'
            }`}
          >
            <span className="text-lg md:text-xl">🎯</span>
            <span>Kỹ năng</span>
          </button>
          <button
            onClick={() => setActiveTab('emotion')}
            className={`flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 border-b-2 transition text-sm md:text-base ${
              activeTab === 'emotion' 
                ? 'border-purple-600 text-purple-600' 
                : 'border-transparent text-gray-600 hover:text-purple-600'
            }`}
          >
            <span className="text-lg md:text-xl">❤️</span>
            <span>Tình cảm</span>
          </button>
        </div>

        {/* Skill Tab Content */}
        {activeTab === 'skill' && (
          <>
            {/* Videos Section */}
            <section className="mb-8 md:mb-12">
              <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                <Video className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
                <h2 className="text-purple-600 text-lg md:text-2xl">Video bài giảng</h2>
              </div>
              {skillVideos.length === 0 ? (
                <p className="text-gray-500 text-sm md:text-base">Chưa có video cho phần này</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {skillVideos.map(video => (
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
                        <h3 className="text-gray-800 text-sm md:text-base">{video.title}</h3>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Documents Section */}
            {documents.length > 0 && (
              <section className="mb-8 md:mb-12">
                <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                  <FileText className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                  <h2 className="text-blue-600 text-lg md:text-2xl">Tài liệu Word</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {documents.map(document => (
                    <div
                      key={document.id}
                      className="bg-white rounded-xl p-4 md:p-6 shadow-lg hover:shadow-2xl transition border-l-4 border-blue-400"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="bg-blue-100 p-3 rounded-lg">
                          <FileText className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-blue-600 mb-1 font-semibold text-sm md:text-base">{document.title}</h3>
                          <p className="text-xs text-gray-400">{document.fileName}</p>
                          {document.fileSize && (
                            <p className="text-xs text-gray-400">{(document.fileSize / 1024).toFixed(1)} KB</p>
                          )}
                        </div>
                      </div>
                      <a
                        href={getDocumentUrl(document)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm md:text-base"
                      >
                        <Download className="w-4 h-4" />
                        Tải xuống
                      </a>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Exercises Section */}
            <section>
              <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                <GamepadIcon className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
                <h2 className="text-orange-600 text-lg md:text-2xl">Bài luyện tập</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-5xl">
                {/* Matching Exercises */}
                {matchingExercises.map(exercise => (
                  <div
                    key={exercise.id}
                    onClick={() => setSelectedMatchingExercise(exercise)}
                    className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl p-4 md:p-6 shadow-lg hover:shadow-2xl transition cursor-pointer hover:scale-105 active:scale-95"
                  >
                    <div className="flex items-center gap-2 md:gap-3 mb-2">
                      <span className="text-blue-600 text-2xl md:text-3xl">🧩</span>
                      <h3 className="text-blue-700 text-sm md:text-base">{exercise.title}</h3>
                    </div>
                    <p className="text-blue-600 text-xs md:text-sm">Trò chơi ghép hình</p>
                  </div>
                ))}

                {/* Quiz Exercises */}
                {quizExercises.map(exercise => (
                  <div
                    key={exercise.id}
                    onClick={() => setSelectedQuizExercise(exercise)}
                    className="bg-gradient-to-br from-green-100 to-green-200 rounded-xl p-4 md:p-6 shadow-lg hover:shadow-2xl transition cursor-pointer hover:scale-105 active:scale-95"
                  >
                    <div className="flex items-center gap-2 md:gap-3 mb-2">
                      <span className="text-green-600 text-2xl md:text-3xl">❓</span>
                      <h3 className="text-green-700 text-sm md:text-base">{exercise.title}</h3>
                    </div>
                    <p className="text-green-600 text-xs md:text-sm">Trắc nghiệm</p>
                  </div>
                ))}
              </div>
              {matchingExercises.length === 0 && quizExercises.length === 0 && (
                <p className="text-gray-500 text-sm md:text-base">Chưa có bài luyện tập cho phần này</p>
              )}
            </section>
          </>
        )}

        {/* Emotion Tab Content */}
        {activeTab === 'emotion' && (
          <section>
            <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
              <Video className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
              <h2 className="text-purple-600 text-lg md:text-2xl">Video tình cảm</h2>
            </div>
            {emotionVideos.length === 0 ? (
              <p className="text-gray-500 text-sm md:text-base">Chưa có video cho phần này</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {emotionVideos.map(video => (
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
                      <h3 className="text-gray-800 text-sm md:text-base">{video.title}</h3>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full overflow-hidden">
            <div className="p-3 md:p-4 border-b flex items-center justify-between">
              <h3 className="text-gray-800 text-sm md:text-base">{selectedVideo.title}</h3>
              <button
                onClick={() => setSelectedVideo(null)}
                className="text-gray-500 hover:text-gray-700 px-2 md:px-4 py-2 text-sm md:text-base"
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

      {/* Matching Game Modal */}
      {selectedMatchingExercise && (
        <MatchingGame
          exercise={selectedMatchingExercise}
          onClose={() => setSelectedMatchingExercise(null)}
        />
      )}

      {/* Quiz Game Modal */}
      {selectedQuizExercise && (
        <QuizGame
          exercise={selectedQuizExercise}
          onClose={() => setSelectedQuizExercise(null)}
        />
      )}
    </div>
  );
}