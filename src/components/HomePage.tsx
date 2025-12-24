import { Sparkles, BookOpen, Video, GamepadIcon, LogIn } from "lucide-react";
import Header from "./Header";

type HomePageProps = {
    navigateTo: (page: string) => void;
};

export default function HomePage({ navigateTo }: HomePageProps) {
    return (
        <div className="min-h-screen">
            {/* Header */}
            <Header navigateTo={navigateTo} showNav={true} />

            {/* Hero Banner - positioned right below fixed header */}
            <section className="relative overflow-hidden pt-[72px]">
                <div
                    className="h-[300px] md:h-[400px] lg:h-[500px] bg-cover bg-center relative"
                    style={{
                        backgroundImage:
                            "url(https://i.ibb.co/DPRxjsbp/64efed74-d177-434c-b8cf-a9bd4a8dfc2b.jpg)",
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-900/70 to-pink-900/70 flex items-center justify-center">
                        <div className="text-center text-white px-4">
                            <h2 className="text-white mb-3 md:mb-4 text-2xl md:text-3xl lg:text-4xl">
                                Chào mừng đến với thế giới học tập vui nhộn!
                            </h2>
                            <p className="text-white/90 mb-6 md:mb-8 max-w-2xl mx-auto text-base md:text-lg lg:text-xl">
                                Nơi bé khám phá kiến thức qua video và trò chơi
                                thú vị
                            </p>
                            <button
                                onClick={() => navigateTo("topics")}
                                className="bg-white text-purple-600 px-6 md:px-10 py-3 md:py-4 rounded-full hover:bg-purple-100 transition shadow-lg text-base md:text-lg"
                            >
                                Bắt đầu học ngay
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="container mx-auto px-4 py-12 md:py-16 lg:py-20 max-w-6xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                    <div
                        onClick={() => navigateTo("topics")}
                        className="bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition cursor-pointer border-4 border-blue-200 hover:scale-105"
                    >
                        <div className="bg-blue-100 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mb-4 md:mb-6 mx-auto">
                            <BookOpen className="w-8 h-8 md:w-10 md:h-10 text-blue-600" />
                        </div>
                        <h3 className="text-blue-600 mb-2 md:mb-3 text-center text-lg md:text-xl">
                            Chủ đề đa dạng
                        </h3>
                        <p className="text-gray-600 text-center text-sm md:text-base">
                            Nhiều chủ đề từ Nhà trẻ đến Mẫu giáo, phù hợp với
                            từng lứa tuổi
                        </p>
                    </div>

                    <div
                        onClick={() => navigateTo("videos")}
                        className="bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition cursor-pointer border-4 border-pink-200 hover:scale-105"
                    >
                        <div className="bg-pink-100 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mb-4 md:mb-6 mx-auto">
                            <Video className="w-8 h-8 md:w-10 md:h-10 text-pink-600" />
                        </div>
                        <h3 className="text-pink-600 mb-2 md:mb-3 text-center text-lg md:text-xl">
                            Video bài giảng
                        </h3>
                        <p className="text-gray-600 text-center text-sm md:text-base">
                            Video sinh động giúp bé dễ dàng tiếp thu kiến thức
                        </p>
                    </div>

                    <div
                        onClick={() => navigateTo("exercises")}
                        className="bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition cursor-pointer border-4 border-orange-200 hover:scale-105"
                    >
                        <div className="bg-orange-100 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mb-4 md:mb-6 mx-auto">
                            <GamepadIcon className="w-8 h-8 md:w-10 md:h-10 text-orange-600" />
                        </div>
                        <h3 className="text-orange-600 mb-2 md:mb-3 text-center text-lg md:text-xl">
                            Bài luyện tập
                        </h3>
                        <p className="text-gray-600 text-center text-sm md:text-base">
                            Trò chơi ghép hình và trắc nghiệm giúp bé củng cố
                            kiến thức
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-gradient-to-r from-purple-500 to-pink-500 py-12 md:py-16 lg:py-20">
                <div className="container mx-auto px-4 text-center text-white max-w-4xl">
                    <h2 className="text-white mb-3 md:mb-4 text-2xl md:text-3xl lg:text-4xl">
                        Sẵn sàng khám phá?
                    </h2>
                    <p className="text-white/90 mb-6 md:mb-8 text-base md:text-lg lg:text-xl">
                        Hãy cùng bé bắt đầu hành trình học tập thú vị ngay hôm
                        nay!
                    </p>
                    <button
                        onClick={() => navigateTo("topics")}
                        className="bg-white text-purple-600 px-6 md:px-10 py-3 md:py-4 rounded-full hover:bg-purple-100 transition shadow-lg text-base md:text-lg"
                    >
                        Khám phá ngay
                    </button>
                </div>
            </section>
        </div>
    );
}
