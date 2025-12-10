import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import Header from './Header';
import type { MatchingExercise, QuizExercise, Topic } from '../App';
import MatchingGame from './MatchingGame';
import QuizGame from './QuizGame';

type ExercisesPageProps = {
  matchingExercises: MatchingExercise[];
  quizExercises: QuizExercise[];
  topics: Topic[];
  navigateTo: (page: string) => void;
};

export default function ExercisesPage({
  matchingExercises,
  quizExercises,
  topics,
  navigateTo,
}: ExercisesPageProps) {
  const [selectedMatchingExercise, setSelectedMatchingExercise] = useState<MatchingExercise | null>(null);
  const [selectedQuizExercise, setSelectedQuizExercise] = useState<QuizExercise | null>(null);

  const getTopicTitle = (topicId: string) => {
    return topics.find(t => t.id === topicId)?.title || 'Không rõ';
  };

  return (
    <div className="min-h-screen pt-16 md:pt-20">
      {/* Header */}
      <Header title="Bài luyện tập" navigateTo={navigateTo} showNav={false} showBackButton={true} />

      <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
        {/* Matching Exercises */}
        <section className="mb-8 md:mb-12">
          <h2 className="text-blue-600 mb-4 md:mb-6 text-xl md:text-2xl">🧩 Trò chơi ghép hình</h2>
          {matchingExercises.length === 0 ? (
            <p className="text-gray-500 text-sm md:text-base">Chưa có bài tập ghép hình</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {matchingExercises.map(exercise => (
                <div
                  key={exercise.id}
                  onClick={() => setSelectedMatchingExercise(exercise)}
                  className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl p-4 md:p-6 shadow-lg hover:shadow-2xl transition cursor-pointer hover:scale-105 active:scale-95"
                >
                  <h3 className="text-blue-700 mb-2 text-base md:text-lg">{exercise.title}</h3>
                  <p className="text-blue-600 text-sm md:text-base">{getTopicTitle(exercise.topicId)}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Quiz Exercises */}
        <section>
          <h2 className="text-green-600 mb-4 md:mb-6 text-xl md:text-2xl">❓ Trắc nghiệm</h2>
          {quizExercises.length === 0 ? (
            <p className="text-gray-500 text-sm md:text-base">Chưa có bài tập trắc nghiệm</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {quizExercises.map(exercise => (
                <div
                  key={exercise.id}
                  onClick={() => setSelectedQuizExercise(exercise)}
                  className="bg-gradient-to-br from-green-100 to-green-200 rounded-xl p-4 md:p-6 shadow-lg hover:shadow-2xl transition cursor-pointer hover:scale-105 active:scale-95"
                >
                  <h3 className="text-green-700 mb-2 text-base md:text-lg">{exercise.title}</h3>
                  <p className="text-green-600 text-sm md:text-base">{getTopicTitle(exercise.topicId)}</p>
                  <p className="text-green-600 mt-2 text-sm md:text-base">{exercise.questions.length} câu hỏi</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

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