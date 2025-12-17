import { useMemo, useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import type { MatchingExercise } from '../App';
import { projectId } from '../utils/supabase/info';
import { convertSupabaseUrl } from '../utils/videoUtils';

const isImageLike = (value?: string) => {
  if (!value) return false;
  if (value.startsWith('http') || value.startsWith('data:') || value.startsWith('supabase://')) return true;
  // Basic emoji range check
  const emojiRegex = /[\u{1F300}-\u{1FAFF}\u2600-\u27BF]/u;
  return emojiRegex.test(value);
};

type MatchingGameProps = {
  exercise: MatchingExercise;
  onClose: () => void;
};

type DraggableTextProps = {
  text: string;
  id: number;
  isImage: boolean;
};

type DropZoneProps = {
  prompt: string;
  correctText: string;
  onDrop: (text: string) => void;
  droppedText: string | null;
  isImagePrompt: boolean;
};

const DraggableText = ({ text, id, isImage }: DraggableTextProps) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'text',
    item: { text },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  // Check if text is a valid image URL (http/https or data URI - NOT supabase://)
  const isValidImageUrl = text.startsWith('http') || text.startsWith('data:');

  return (
    <div
      ref={drag}
      className={`bg-blue-500 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg cursor-move shadow-lg text-sm md:text-base touch-none ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
    >
      {isImage ? (
        isValidImageUrl ? (
          <img src={text} alt="Draggable" className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-md" />
        ) : (
          <span className="text-3xl md:text-4xl">{text}</span>
        )
      ) : (
        text
      )}
    </div>
  );
};

const DropZone = ({ prompt, correctText, onDrop, droppedText, isImagePrompt }: DropZoneProps) => {
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
  // Check if prompt is a valid image URL (http/https or data URI - NOT supabase://)
  const isValidImageUrl = prompt.startsWith('http') || prompt.startsWith('data:');

  return (
    <div
      ref={drop}
      className={`border-4 border-dashed rounded-xl p-3 md:p-6 min-h-48 md:min-h-64 flex flex-col items-center justify-center text-center ${
        isOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
      } ${isCorrect ? 'bg-green-100 border-green-500' : ''}`}
    >
      <div className="mb-2 md:mb-4">
        {isImagePrompt ? (
          isValidImageUrl ? (
            <img src={prompt} alt="Matching item" className="w-32 h-32 md:w-48 md:h-48 object-cover rounded-lg" />
          ) : (
            <div className="text-5xl md:text-8xl">{prompt}</div>
          )
        ) : (
          <div className="text-gray-700 font-semibold text-sm md:text-base">{prompt}</div>
        )}
      </div>
      {droppedText ? (
        <div
          className={`px-3 md:px-6 py-2 md:py-3 rounded-lg text-sm md:text-base flex items-center gap-2 ${
            isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}
        >
          {/* Check if droppedText is an image URL */}
          {droppedText.startsWith('http') || droppedText.startsWith('data:') ? (
            <>
              <img src={droppedText} alt="Đã chọn" className="w-12 h-12 md:w-16 md:h-16 object-cover rounded" />
              {isCorrect ? 'Đúng ✓' : 'Sai ✗'}
            </>
          ) : (
            <>
              {droppedText}
              {isCorrect ? ' ✓' : ' ✗'}
            </>
          )}
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

  // Normalize supabase:// links to public URLs on the client (fallback if backend hasn't signed yet)
  const normalizedPairs = useMemo(() => {
    return exercise.pairs.map((p: any) => ({
      left: convertSupabaseUrl(p.left ?? p.image, projectId),
      right: convertSupabaseUrl(p.right ?? p.text, projectId),
    }));
  }, [exercise.pairs]);

  // Shuffle texts when pairs change
  useEffect(() => {
    const texts = normalizedPairs.map(p => p.right);
    setShuffledTexts(texts.sort(() => Math.random() - 0.5));
  }, [normalizedPairs]);

  const handleDrop = (index: number, text: string) => {
    setDroppedTexts(prev => ({ ...prev, [index]: text }));
  };

  useEffect(() => {
    const allCorrect = normalizedPairs.every(
      (pair, index) => droppedTexts[index] === (pair as any).right
    );
    if (allCorrect && Object.keys(droppedTexts).length === normalizedPairs.length) {
      setIsComplete(true);
    }
  }, [droppedTexts, normalizedPairs]);

  const handleReset = () => {
    setDroppedTexts({});
    setIsComplete(false);
    setShuffledTexts(normalizedPairs.map(p => p.right).sort(() => Math.random() - 0.5));
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
              {normalizedPairs.map((pair, index) => {
                const prompt = (pair as any).left;
                const isImagePrompt = isImageLike(prompt);
                return (
                <DropZone
                  key={index}
                  prompt={prompt}
                  correctText={(pair as any).right}
                  onDrop={(text) => handleDrop(index, text)}
                  droppedText={droppedTexts[index] || null}
                  isImagePrompt={isImagePrompt}
                />
              )})}
            </div>
          </div>

          {/* Draggable Texts */}
          <div>
            <h3 className="text-gray-700 mb-3 md:mb-4 text-base md:text-lg">Kéo tên vào vị trí đúng:</h3>
            <div className="flex flex-col gap-2 md:gap-4">
              {shuffledTexts.map((text, index) => {
                const isUsed = Object.values(droppedTexts).includes(text);
                if (isUsed) return null;
                // Calculate isImage inline to avoid index mismatch after shuffling
                const isImage = isImageLike(text);
                return <DraggableText key={index} text={text} id={index} isImage={isImage} />;
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