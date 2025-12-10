import { ArrowLeft, Video, Brain } from 'lucide-react';
import Header from './Header';
import type { Video as VideoType, MatchingExercise, QuizExercise, Topic } from '../App';

type FieldDetailProps = {
  fieldName: string;
  videos: VideoType[];
  matchingExercises: MatchingExercise[];
  quizExercises: QuizExercise[];
  topics: Topic[];
  navigateTo: (page: string, topicId?: string) => void;
};

export default function FieldDetail({ 
  fieldName, 
  videos, 
  matchingExercises, 
  quizExercises,
  topics,
  navigateTo 
}: FieldDetailProps) {
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
                    className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition cursor-pointer hover:scale-105"
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
                  className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition cursor-pointer border-l-4 border-green-400 hover:scale-105"
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
                  className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition cursor-pointer border-l-4 border-green-400 hover:scale-105"
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
    </div>
  );
}