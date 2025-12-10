import { ArrowLeft, Baby, GraduationCap } from 'lucide-react';
import Header from './Header';
import type { Topic } from '../App';

type TopicsPageProps = {
  topics: Topic[];
  navigateTo: (page: string, topicId?: string) => void;
};

export default function TopicsPage({ topics, navigateTo }: TopicsPageProps) {
  const nurseryTopics = topics.filter(t => t.category === 'nursery');
  const kindergartenTopics = topics.filter(t => t.category === 'kindergarten');

  return (
    <div className="min-h-screen pt-16 md:pt-20">
      {/* Header */}
      <Header title="Danh sách chủ đề" navigateTo={navigateTo} showNav={false} showBackButton={true} />

      <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
        {/* Nhà Trẻ Section */}
        <section className="mb-12 md:mb-16">
          <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
            <div className="bg-blue-100 p-2 md:p-3 rounded-full">
              <Baby className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
            </div>
            <h2 className="text-blue-600 text-xl md:text-2xl lg:text-3xl">Nhà Trẻ</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {nurseryTopics.map(topic => (
              <div
                key={topic.id}
                onClick={() => navigateTo('topic-detail', topic.id)}
                className="bg-white rounded-xl p-4 md:p-6 shadow-lg hover:shadow-2xl transition cursor-pointer border-t-4 border-blue-400 hover:scale-105 active:scale-95"
              >
                <h3 className="text-blue-600 mb-2 text-base md:text-lg">{topic.title}</h3>
                <p className="text-gray-600 text-sm md:text-base">{topic.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Mẫu Giáo Section */}
        <section>
          <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
            <div className="bg-pink-100 p-2 md:p-3 rounded-full">
              <GraduationCap className="w-6 h-6 md:w-8 md:h-8 text-pink-600" />
            </div>
            <h2 className="text-pink-600 text-xl md:text-2xl lg:text-3xl">Mẫu Giáo</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {kindergartenTopics.map(topic => (
              <div
                key={topic.id}
                onClick={() => navigateTo('topic-detail', topic.id)}
                className="bg-white rounded-xl p-4 md:p-6 shadow-lg hover:shadow-2xl transition cursor-pointer border-t-4 border-pink-400 hover:scale-105 active:scale-95"
              >
                <h3 className="text-pink-600 mb-2 text-base md:text-lg">{topic.title}</h3>
                <p className="text-gray-600 text-sm md:text-base">{topic.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}