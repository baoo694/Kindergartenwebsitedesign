import { useState } from 'react';
import type { QuizExercise } from '../App';

type QuizGameProps = {
  exercise: QuizExercise;
  onClose: () => void;
};

export default function QuizGame({ exercise, onClose }: QuizGameProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = exercise.questions[currentQuestionIndex];

  const handleAnswerClick = (answerIndex: number) => {
    if (showResult) return;
    setSelectedAnswer(answerIndex);
    setShowResult(true);

    if (answerIndex === currentQuestion.correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < exercise.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setIsFinished(true);
    }
  };

  const handleReset = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setIsFinished(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-2 md:p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-4 md:p-8 max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-purple-600 text-lg md:text-2xl">{exercise.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 px-2 md:px-4 py-2 text-base md:text-lg"
          >
            ✕ Đóng
          </button>
        </div>

        {!isFinished ? (
          <>
            {/* Progress */}
            <div className="mb-4 md:mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm md:text-lg">
                  Câu {currentQuestionIndex + 1} / {exercise.questions.length}
                </span>
                <span className="text-gray-600 text-sm md:text-lg">Điểm: {score}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 md:h-3">
                <div
                  className="bg-purple-500 h-2 md:h-3 rounded-full transition-all"
                  style={{
                    width: `${((currentQuestionIndex + 1) / exercise.questions.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Question */}
            <div className="mb-6 md:mb-8">
              <h3 className="text-gray-800 mb-4 md:mb-6 text-base md:text-xl">{currentQuestion.question}</h3>
              <div className="space-y-2 md:space-y-3">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrect = index === currentQuestion.correctAnswer;
                  let buttonClass = 'bg-gray-100 hover:bg-gray-200';

                  if (showResult) {
                    if (isCorrect) {
                      buttonClass = 'bg-green-500 text-white';
                    } else if (isSelected && !isCorrect) {
                      buttonClass = 'bg-red-500 text-white';
                    }
                  } else if (isSelected) {
                    buttonClass = 'bg-purple-200';
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswerClick(index)}
                      className={`w-full text-left px-4 md:px-6 py-3 md:py-4 rounded-lg transition text-sm md:text-lg ${buttonClass}`}
                    >
                      <span className="mr-2 md:mr-3">{String.fromCharCode(65 + index)}.</span>
                      {option}
                      {showResult && isCorrect && ' ✓'}
                      {showResult && isSelected && !isCorrect && ' ✗'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Next Button */}
            {showResult && (
              <button
                onClick={handleNext}
                className="w-full bg-purple-500 text-white px-4 md:px-6 py-3 md:py-4 rounded-lg hover:bg-purple-600 transition text-base md:text-lg"
              >
                {currentQuestionIndex < exercise.questions.length - 1
                  ? '➡️ Câu tiếp theo'
                  : '🏁 Xem kết quả'}
              </button>
            )}
          </>
        ) : (
          <div className="text-center">
            <h3 className="text-purple-600 mb-3 md:mb-4 text-xl md:text-2xl">🎉 Hoàn thành! 🎉</h3>
            <div className="bg-purple-100 rounded-xl p-6 md:p-8 mb-4 md:mb-6">
              <div className="mb-3 md:mb-4 text-base md:text-lg">Điểm số của bé:</div>
              <div className="text-purple-600 mb-2 text-2xl md:text-3xl">
                {score} / {exercise.questions.length}
              </div>
              <div className="text-gray-600 text-base md:text-lg">
                {score === exercise.questions.length
                  ? 'Xuất sắc! Bé làm đúng tất cả!'
                  : score >= exercise.questions.length / 2
                  ? 'Giỏi lắm! Bé làm rất tốt!'
                  : 'Cố gắng lên bé nhé!'}
              </div>
            </div>
            <div className="flex gap-2 md:gap-4">
              <button
                onClick={handleReset}
                className="flex-1 bg-orange-500 text-white px-4 md:px-6 py-3 md:py-4 rounded-lg hover:bg-orange-600 transition text-base md:text-lg"
              >
                🔄 Làm lại
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-gray-500 text-white px-4 md:px-6 py-3 md:py-4 rounded-lg hover:bg-gray-600 transition text-base md:text-lg"
              >
                ✕ Đóng
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}