import { ArrowLeft, Baby, GraduationCap } from 'lucide-react';
import { useState } from 'react';
import Header from './Header';
import type { Topic } from '../App';
import { KINDERGARTEN_FIELDS, NURSERY_FIELDS } from '../utils/constants';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';

type TopicsPageProps = {
  topics: Topic[];
  navigateTo: (page: string, topicId?: string) => void;
};

export default function TopicsPage({ topics, navigateTo }: TopicsPageProps) {
  const [activeTab, setActiveTab] = useState<'nursery' | 'kindergarten'>('nursery');
  
  const nurseryTopics = topics.filter(t => t.category === 'nursery');
  const kindergartenTopics = topics.filter(t => t.category === 'kindergarten');

  // Nhóm chủ đề Nhà trẻ theo lĩnh vực - hiển thị tất cả 4 lĩnh vực
  const nurseryTopicsByField = NURSERY_FIELDS.map(field => ({
    field,
    topics: nurseryTopics
      .filter(t => t.field === field)
      .sort((a, b) => (a.order || 0) - (b.order || 0))
  }));

  // Nhóm chủ đề Mẫu giáo theo lĩnh vực - hiển thị tất cả 5 lĩnh vực
  const kindergartenTopicsByField = KINDERGARTEN_FIELDS.map(field => ({
    field,
    topics: kindergartenTopics
      .filter(t => t.field === field)
      .sort((a, b) => (a.order || 0) - (b.order || 0))
  }));

  return (
    <div className="min-h-screen pt-16 md:pt-20 bg-gradient-to-b from-blue-50 to-pink-50">
      {/* Header */}
      <Header title="Danh sách chủ đề" navigateTo={navigateTo} showNav={false} showBackButton={true} />

      <div className="container mx-auto px-4 py-6 md:py-8 max-w-4xl">
        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-xl p-2 mb-6 md:mb-8">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setActiveTab('nursery')}
              className={`flex items-center justify-center gap-2 md:gap-3 px-4 md:px-6 py-3 md:py-4 rounded-xl transition-all duration-300 ${
                activeTab === 'nursery'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Baby className={`w-5 h-5 md:w-6 md:h-6 ${activeTab === 'nursery' ? 'animate-bounce' : ''}`} />
              <span className="text-sm md:text-base lg:text-lg">Nhà Trẻ</span>
            </button>
            
            <button
              onClick={() => setActiveTab('kindergarten')}
              className={`flex items-center justify-center gap-2 md:gap-3 px-4 md:px-6 py-3 md:py-4 rounded-xl transition-all duration-300 ${
                activeTab === 'kindergarten'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <GraduationCap className={`w-5 h-5 md:w-6 md:h-6 ${activeTab === 'kindergarten' ? 'animate-bounce' : ''}`} />
              <span className="text-sm md:text-base lg:text-lg">Mẫu Giáo</span>
            </button>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'nursery' ? (
          /* Nhà Trẻ Content */
          <section>
            <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
              <div className="bg-blue-500 p-3 md:p-4 rounded-2xl shadow-lg">
                <Baby className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
              <div>
                <h2 className="text-blue-600 text-2xl md:text-3xl lg:text-4xl">Nhà Trẻ</h2>
                <p className="text-gray-600 text-sm md:text-base">Chương trình dành cho bé 3-36 tháng tuổi</p>
              </div>
            </div>

            {/* Accordion cho 4 lĩnh vực */}
            <Accordion type="single" collapsible className="space-y-4">
              {nurseryTopicsByField.map((group, index) => (
                <AccordionItem 
                  key={group.field} 
                  value={group.field}
                  className="bg-white rounded-2xl shadow-lg border-2 border-blue-200 overflow-hidden hover:border-blue-400 transition"
                >
                  <AccordionTrigger className="px-5 md:px-7 py-4 md:py-5 hover:bg-blue-50 transition">
                    <div className="flex items-center gap-3 md:gap-4 w-full">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                        <span className="text-white text-base md:text-lg">{index + 1}</span>
                      </div>
                      <h3 className="text-blue-700 text-base md:text-lg lg:text-xl text-left flex-1">
                        {group.field}
                      </h3>
                      {group.topics.length > 0 && (
                        <span className="mr-2 text-xs md:text-sm text-blue-600 bg-blue-100 px-3 py-1.5 rounded-full flex-shrink-0">
                          {group.topics.length} chủ đề
                        </span>
                      )}
                    </div>
                  </AccordionTrigger>
                  
                  <AccordionContent className="px-5 md:px-7 pb-5 md:pb-7 pt-2">
                    {group.field === 'Lĩnh vực phát triển tình cảm - kỹ năng xã hội' && group.topics.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                        {group.topics.map(topic => (
                          <div
                            key={topic.id}
                            onClick={() => navigateTo('topic-detail', topic.id)}
                            className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 md:p-5 shadow-md hover:shadow-2xl transition cursor-pointer border-l-4 border-blue-400 hover:scale-105 active:scale-95"
                          >
                            <h4 className="text-blue-600 mb-2 text-base md:text-lg">{topic.title}</h4>
                            <p className="text-gray-600 text-sm md:text-base">{topic.description}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      group.field !== 'Lĩnh vực phát triển tình cảm - kỹ năng xã hội' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                          <div
                            onClick={() => navigateTo('field-detail', group.field)}
                            className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-5 md:p-6 shadow-md hover:shadow-2xl transition cursor-pointer border-l-4 border-purple-400 hover:scale-105 active:scale-95 group"
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition shadow-sm">
                                <span className="text-3xl">🎥</span>
                              </div>
                              <h4 className="text-purple-700 text-lg md:text-xl">Video bài giảng</h4>
                            </div>
                            <p className="text-gray-600 text-sm md:text-base">Xem các video học tập cho lĩnh vực này</p>
                          </div>

                          <div
                            onClick={() => navigateTo('field-detail', group.field)}
                            className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-5 md:p-6 shadow-md hover:shadow-2xl transition cursor-pointer border-l-4 border-green-400 hover:scale-105 active:scale-95 group"
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition shadow-sm">
                                <span className="text-3xl">🧩</span>
                              </div>
                              <h4 className="text-green-700 text-lg md:text-xl">Bài luyện tập</h4>
                            </div>
                            <p className="text-gray-600 text-sm md:text-base">Thực hành với các bài tập tương tác</p>
                          </div>
                        </div>
                      )
                    )}
                    
                    {group.topics.length === 0 && group.field === 'Lĩnh vực phát triển tình cảm - kỹ năng xã hội' && (
                      <div className="bg-blue-50/50 rounded-xl p-6 md:p-8 text-center border-2 border-dashed border-blue-200 mt-2">
                        <p className="text-blue-400 italic text-sm md:text-base">Chưa có chủ đề nào trong lĩnh vực này</p>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        ) : (
          /* Mẫu Giáo Content */
          <section>
            <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
              <div className="bg-gradient-to-br from-pink-500 to-purple-500 p-3 md:p-4 rounded-2xl shadow-lg">
                <GraduationCap className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
              <div>
                <h2 className="text-pink-600 text-2xl md:text-3xl lg:text-4xl">Mẫu Giáo</h2>
                <p className="text-gray-600 text-sm md:text-base">Chương trình dành cho bé 3-6 tuổi</p>
              </div>
            </div>

            {/* Accordion cho 5 lĩnh vực */}
            <Accordion type="single" collapsible className="space-y-4">
              {kindergartenTopicsByField.map((group, index) => (
                <AccordionItem 
                  key={group.field} 
                  value={group.field}
                  className="bg-white rounded-2xl shadow-lg border-2 border-pink-200 overflow-hidden hover:border-pink-400 transition"
                >
                  <AccordionTrigger className="px-5 md:px-7 py-4 md:py-5 hover:bg-pink-50 transition">
                    <div className="flex items-center gap-3 md:gap-4 w-full">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                        <span className="text-white text-base md:text-lg">{index + 1}</span>
                      </div>
                      <h3 className="text-pink-700 text-base md:text-lg lg:text-xl text-left flex-1">
                        {group.field}
                      </h3>
                      {group.topics.length > 0 && (
                        <span className="mr-2 text-xs md:text-sm text-pink-600 bg-pink-100 px-3 py-1.5 rounded-full flex-shrink-0">
                          {group.topics.length} chủ đề
                        </span>
                      )}
                    </div>
                  </AccordionTrigger>
                  
                  <AccordionContent className="px-5 md:px-7 pb-5 md:pb-7 pt-2">
                    {group.field === 'Lĩnh vực phát triển tình cảm - kỹ năng xã hội' && group.topics.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                        {group.topics.map(topic => (
                          <div
                            key={topic.id}
                            onClick={() => navigateTo('topic-detail', topic.id)}
                            className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-4 md:p-5 shadow-md hover:shadow-2xl transition cursor-pointer border-l-4 border-pink-400 hover:scale-105 active:scale-95"
                          >
                            <h4 className="text-pink-600 mb-2 text-base md:text-lg">{topic.title}</h4>
                            <p className="text-gray-600 text-sm md:text-base">{topic.description}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      group.field !== 'Lĩnh vực phát triển tình cảm - kỹ năng xã hội' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                          <div
                            onClick={() => navigateTo('field-detail', group.field)}
                            className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-5 md:p-6 shadow-md hover:shadow-2xl transition cursor-pointer border-l-4 border-purple-400 hover:scale-105 active:scale-95 group"
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition shadow-sm">
                                <span className="text-3xl">🎥</span>
                              </div>
                              <h4 className="text-purple-700 text-lg md:text-xl">Video bài giảng</h4>
                            </div>
                            <p className="text-gray-600 text-sm md:text-base">Xem các video học tập cho lĩnh vực này</p>
                          </div>

                          <div
                            onClick={() => navigateTo('field-detail', group.field)}
                            className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-5 md:p-6 shadow-md hover:shadow-2xl transition cursor-pointer border-l-4 border-green-400 hover:scale-105 active:scale-95 group"
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition shadow-sm">
                                <span className="text-3xl">🧩</span>
                              </div>
                              <h4 className="text-green-700 text-lg md:text-xl">Bài luyện tập</h4>
                            </div>
                            <p className="text-gray-600 text-sm md:text-base">Thực hành với các bài tập tương tác</p>
                          </div>
                        </div>
                      )
                    )}
                    
                    {group.topics.length === 0 && group.field === 'Lĩnh vực phát triển tình cảm - kỹ năng xã hội' && (
                      <div className="bg-pink-50/50 rounded-xl p-6 md:p-8 text-center border-2 border-dashed border-pink-200 mt-2">
                        <p className="text-pink-400 italic text-sm md:text-base">Chưa có chủ đề nào trong lĩnh vực này</p>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        )}
      </div>
    </div>
  );
}