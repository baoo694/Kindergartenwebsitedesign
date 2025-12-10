import { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import type { MatchingExercise } from '../App';

type MatchingGameProps = {
  exercise: MatchingExercise;
  onClose: () => void;
};

type DraggableTextProps = {
  text: string;
  id: number;
};

type DropZoneProps = {
  image: string;
  correctText: string;
  onDrop: (text: string) => void;
  droppedText: string | null;
};

const DraggableText = ({ text, id }: DraggableTextProps) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'text',
    item: { text },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`bg-blue-500 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg cursor-move shadow-lg text-sm md:text-base touch-none ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
    >
      {text}
    </div>
  );
};

const DropZone = ({ image, correctText, onDrop, droppedText }: DropZoneProps) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'text',
    drop: (item: { text: string }) => {
      onDrop(item.text);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const isCorrect = droppedText === correctText;

  // Check if image is a URL or emoji
  const isImageUrl = image.startsWith('http') || image.startsWith('data:') || image.startsWith('supabase://');

  return (
    <div
      ref={drop}
      className={`border-4 border-dashed rounded-xl p-3 md:p-6 min-h-32 md:min-h-40 flex flex-col items-center justify-center text-center ${
        isOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
      } ${isCorrect ? 'bg-green-100 border-green-500' : ''}`}
    >
      <div className="mb-2 md:mb-4">
        {isImageUrl ? (
          <img src={image} alt="Matching item" className="w-20 h-20 md:w-32 md:h-32 object-cover rounded-lg" />
        ) : (
          <div className="text-5xl md:text-8xl">{image}</div>
        )}
      </div>
      {droppedText ? (
        <div
          className={`px-3 md:px-6 py-2 md:py-3 rounded-lg text-sm md:text-base ${
            isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}
        >
          {droppedText}
          {isCorrect ? ' ✓' : ' ✗'}
        </div>
      ) : (
        <div className="text-gray-400 text-xs md:text-sm">Kéo thả tên vào đây</div>
      )}
    </div>
  );
};

function MatchingGameContent({ exercise, onClose }: MatchingGameProps) {
  const [droppedTexts, setDroppedTexts] = useState<{ [key: number]: string }>({});
  const [shuffledTexts, setShuffledTexts] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const texts = exercise.pairs.map(p => p.text);
    setShuffledTexts(texts.sort(() => Math.random() - 0.5));
  }, [exercise]);

  const handleDrop = (index: number, text: string) => {
    setDroppedTexts(prev => ({ ...prev, [index]: text }));
  };

  useEffect(() => {
    const allCorrect = exercise.pairs.every(
      (pair, index) => droppedTexts[index] === pair.text
    );
    if (allCorrect && Object.keys(droppedTexts).length === exercise.pairs.length) {
      setIsComplete(true);
    }
  }, [droppedTexts, exercise.pairs]);

  const handleReset = () => {
    setDroppedTexts({});
    setIsComplete(false);
    setShuffledTexts(exercise.pairs.map(p => p.text).sort(() => Math.random() - 0.5));
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-2 md:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-7xl w-full p-4 md:p-8 my-4 md:my-8 max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-purple-600 text-lg md:text-2xl">{exercise.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 px-2 md:px-4 py-2 text-base md:text-lg"
          >
            ✕ Đóng
          </button>
        </div>

        {isComplete && (
          <div className="bg-green-100 border-4 border-green-500 rounded-xl p-4 md:p-6 mb-4 md:mb-6 text-center">
            <h3 className="text-green-600 mb-2 text-xl md:text-2xl">🎉 Chúc mừng bé! 🎉</h3>
            <p className="text-green-700 text-base md:text-lg">Bé đã hoàn thành tất cả!</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
          {/* Drop Zones */}
          <div>
            <h3 className="text-gray-700 mb-3 md:mb-4 text-base md:text-lg">Ghép đúng tên cho mỗi hình:</h3>
            <div className="grid grid-cols-2 gap-2 md:gap-4">
              {exercise.pairs.map((pair, index) => (
                <DropZone
                  key={index}
                  image={pair.image}
                  correctText={pair.text}
                  onDrop={(text) => handleDrop(index, text)}
                  droppedText={droppedTexts[index] || null}
                />
              ))}
            </div>
          </div>

          {/* Draggable Texts */}
          <div>
            <h3 className="text-gray-700 mb-3 md:mb-4 text-base md:text-lg">Kéo tên vào vị trí đúng:</h3>
            <div className="flex flex-col gap-2 md:gap-4">
              {shuffledTexts.map((text, index) => {
                const isUsed = Object.values(droppedTexts).includes(text);
                if (isUsed) return null;
                return <DraggableText key={index} text={text} id={index} />;
              })}
            </div>
          </div>
        </div>

        <div className="mt-4 md:mt-6 flex gap-2 md:gap-4">
          <button
            onClick={handleReset}
            className="bg-orange-500 text-white px-6 md:px-8 py-3 md:py-4 rounded-lg hover:bg-orange-600 transition text-base md:text-lg"
          >
            🔄 Chơi lại
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MatchingGame(props: MatchingGameProps) {
  return (
    <DndProvider backend={HTML5Backend}>
      <MatchingGameContent {...props} />
    </DndProvider>
  );
}