import { useState } from 'react';
import { Video, Brain, FileText, Download } from 'lucide-react';
import Header from './Header';
import MatchingGame from './MatchingGame';
import QuizGame from './QuizGame';
import { convertToEmbedUrl, convertSupabaseUrl } from '../utils/videoUtils';
import { projectId } from '../utils/supabase/info';
import type { Video as VideoType, MatchingExercise, QuizExercise, Topic, Document } from '../App';

type FieldDetailProps = {
  fieldName: string;
  fieldCategory?: 'nursery' | 'kindergarten' | null;
  videos: VideoType[];
  matchingExercises: MatchingExercise[];
  quizExercises: QuizExercise[];
  documents: Document[];
  topics: Topic[];
  navigateTo: (page: string, topicId?: string) => void;
};

export default function FieldDetail({ 
  fieldName,
  fieldCategory,
  videos, 
  matchingExercises, 
  quizExercises,
  documents,
  topics,
  navigateTo 
}: FieldDetailProps) {
  const getDocumentUrl = (document: Document): string => {
    return convertSupabaseUrl(document.fileUrl, projectId);
  };
  const [selectedVideo, setSelectedVideo] = useState<VideoType | null>(null);
  const [selectedMatchingExercise, setSelectedMatchingExercise] = useState<MatchingExercise | null>(null);
  const [selectedQuizExercise, setSelectedQuizExercise] = useState<QuizExercise | null>(null);

  return (
    <div className="min-h-screen pt-16 md:pt-20">
      <Header title={fieldName} navigateTo={navigateTo} showNav={false} showBackButton={true} backButtonPage="topics" />
      
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
        {/* Videos Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-purple-100 p-3 rounded-full">
              <Video className="w-6 h-6 md:w-8 md:h-8 text-purple-600" />
            </div>
            <h2 className="text-purple-600 text-xl md:text-2xl">Video bài giảng</h2>
          </div>
          
          {videos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {videos.map(video => {
                const topic = topics.find(t => t.id === video.topicId);
                return (
                  <div
                    key={video.id}
                    onClick={() => setSelectedVideo(video)}
                    className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition cursor-pointer hover:scale-105 active:scale-95"
                  >
                    <img 
                      src={video.thumbnail} 
                      alt={video.title}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-purple-600 mb-2">{video.title}</h3>
                      {topic && (
                        <p className="text-sm text-gray-500">Chủ đề: {topic.title}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white/50 rounded-xl p-8 text-center border-2 border-dashed border-purple-200">
              <p className="text-purple-400 italic">Chưa có video nào trong lĩnh vực này</p>
            </div>
          )}
        </section>

        {/* Documents Section */}
        {documents.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-100 p-3 rounded-full">
                <FileText className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
              </div>
              <h2 className="text-blue-600 text-xl md:text-2xl">Tài liệu Word</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {documents.map(document => {
                const topic = topics.find(t => t.id === document.topicId);
                return (
                  <div
                    key={document.id}
                    className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition border-l-4 border-blue-400"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-blue-600 mb-1 font-semibold">{document.title}</h3>
                        {topic && (
                          <p className="text-sm text-gray-500 mb-1">Chủ đề: {topic.title}</p>
                        )}
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
                      className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                      <Download className="w-4 h-4" />
                      Tải xuống
                    </a>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Exercises Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-green-100 p-3 rounded-full">
              <Brain className="w-6 h-6 md:w-8 md:h-8 text-green-600" />
            </div>
            <h2 className="text-green-600 text-xl md:text-2xl">Bài luyện tập</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {matchingExercises.map(exercise => {
              const topic = topics.find(t => t.id === exercise.topicId);
              return (
                <div
                  key={exercise.id}
                  onClick={() => setSelectedMatchingExercise(exercise)}
                  className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition cursor-pointer border-l-4 border-green-400 hover:scale-105 active:scale-95"
                >
                  <div className="text-4xl mb-3">🎯</div>
                  <h3 className="text-green-600 mb-2">{exercise.title}</h3>
                  {topic && (
                    <p className="text-sm text-gray-500 mb-2">Chủ đề: {topic.title}</p>
                  )}
                  <p className="text-sm text-gray-600">Ghép hình - {exercise.pairs.length} cặp</p>
                </div>
              );
            })}
            
            {quizExercises.map(exercise => {
              const topic = topics.find(t => t.id === exercise.topicId);
              return (
                <div
                  key={exercise.id}
                  onClick={() => setSelectedQuizExercise(exercise)}
                  className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition cursor-pointer border-l-4 border-green-400 hover:scale-105 active:scale-95"
                >
                  <div className="text-4xl mb-3">❓</div>
                  <h3 className="text-green-600 mb-2">{exercise.title}</h3>
                  {topic && (
                    <p className="text-sm text-gray-500 mb-2">Chủ đề: {topic.title}</p>
                  )}
                  <p className="text-sm text-gray-600">Trắc nghiệm - {exercise.questions.length} câu</p>
                </div>
              );
            })}
            
            {matchingExercises.length === 0 && quizExercises.length === 0 && (
              <div className="col-span-full bg-white/50 rounded-xl p-8 text-center border-2 border-dashed border-green-200">
                <p className="text-green-400 italic">Chưa có bài luyện tập nào trong lĩnh vực này</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full overflow-hidden">
            <div className="p-3 md:p-4 border-b flex items-center justify-between">
              <div>
                <h3 className="text-gray-800 text-sm md:text-base lg:text-lg">{selectedVideo.title}</h3>
                {selectedVideo.topicId && (
                  <p className="text-purple-600 text-xs md:text-sm">
                    Chủ đề: {topics.find(t => t.id === selectedVideo.topicId)?.title}
                  </p>
                )}
                {!selectedVideo.topicId && selectedVideo.field && (
                  <p className="text-purple-600 text-xs md:text-sm">{selectedVideo.field}</p>
                )}
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