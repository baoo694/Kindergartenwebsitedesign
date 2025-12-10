import {
    Sparkles,
    BookOpen,
    Video,
    GamepadIcon,
    LogIn,
    Menu,
    X,
} from "lucide-react";
import { useState } from "react";

type HeaderProps = {
    title?: string;
    showNav?: boolean;
    showBackButton?: boolean;
    navigateTo: (page: string) => void;
};

export default function Header({
    title = "Trường Mầm Non Đông Hoàng",
    showNav = true,
    showBackButton = false,
    navigateTo,
}: HeaderProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navItems = [
        { icon: BookOpen, label: "Chủ đề", page: "topics" },
        { icon: GamepadIcon, label: "Luyện tập", page: "exercises" },
        { icon: Video, label: "Video", page: "videos" },
        { icon: LogIn, label: "Đăng nhập", page: "admin-login" },
    ];

    const handleNavigate = (page: string) => {
        navigateTo(page);
        setMobileMenuOpen(false);
    };

    return (
        <header className="fixed top-0 left-0 right-0 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white shadow-lg z-50">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <div
                        className="flex items-center gap-2 md:gap-3 cursor-pointer"
                        onClick={() => handleNavigate("home")}
                    >
                        <Sparkles className="w-8 h-8 md:w-10 md:h-10" />
                        <h1 className="text-white text-lg md:text-2xl lg:text-3xl">
                            {title}
                        </h1>
                    </div>

                    {/* Desktop Navigation */}
                    {showNav && (
                        <nav className="hidden md:flex gap-2 lg:gap-6">
                            {navItems.map(({ icon: Icon, label, page }) => (
                                <button
                                    key={page}
                                    onClick={() => handleNavigate(page)}
                                    className="flex items-center gap-2 hover:bg-white/20 px-3 lg:px-4 py-2 rounded-lg transition"
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="text-sm lg:text-base">
                                        {label}
                                    </span>
                                </button>
                            ))}
                        </nav>
                    )}

                    {/* Mobile Menu Button */}
                    {showNav && (
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden hover:bg-white/20 p-2 rounded-lg transition"
                        >
                            {mobileMenuOpen ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <Menu className="w-6 h-6" />
                            )}
                        </button>
                    )}

                    {/* Back Button (for pages without nav) */}
                    {showBackButton && !showNav && (
                        <button
                            onClick={() => handleNavigate("home")}
                            className="flex items-center gap-2 hover:bg-white/20 px-4 py-2 rounded-lg transition text-sm md:text-base"
                        >
                            <span>Về trang chủ</span>
                        </button>
                    )}
                </div>

                {/* Mobile Menu Dropdown */}
                {showNav && mobileMenuOpen && (
                    <nav className="md:hidden mt-4 pb-2 space-y-2">
                        {navItems.map(({ icon: Icon, label, page }) => (
                            <button
                                key={page}
                                onClick={() => handleNavigate(page)}
                                className="flex items-center gap-3 w-full hover:bg-white/20 px-4 py-3 rounded-lg transition"
                            >
                                <Icon className="w-5 h-5" />
                                <span>{label}</span>
                            </button>
                        ))}
                    </nav>
                )}
            </div>
        </header>
    );
}
