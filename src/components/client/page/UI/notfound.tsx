const NotFound = () => {
    return (
        <div className="min-h-screen from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4 py-8">
            <div className="max-w-4xl mx-auto text-center">
                {/* Illustration Container */}
                <div className="mb-8 flex justify-center">
                    <div className="relative">
                        {/* (Giữ nguyên phần SVG của bạn) */}
                        {/* ... SVG astronaut code ... */}
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-6">
                    {/* 404 Number */}
                    <div className="relative">
                        <h1 className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r via-green-600 to-indigo-600 animate-pulse">
                            404
                        </h1>
                        <div className="absolute inset-0 text-8xl md:text-9xl font-black text-blue-200 opacity-20 -z-10 transform translate-x-1 translate-y-1">
                            404
                        </div>
                    </div>

                    {/* Title */}
                    <h4 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 leading-tight">
                        Oops! The page you're looking for doesn't exist.
                    </h4>
                    {/* Description */}
                    <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        Có thể sản phẩm đã hết hàng hoặc đường dẫn không chính xác.
                        Hãy quay về trang chủ để khám phá những mẫu điện thoại mới nhất.
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                        <a
                            href="/"
                            className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-full hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center gap-2"
                        >
                            <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Về trang chủ
                        </a>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default NotFound;
