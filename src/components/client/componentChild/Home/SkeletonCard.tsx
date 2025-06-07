// Hiển thị khi server đang tải dữ liệu
const SkeletonCard = () => {
    return (
        <div className="animate-pulse bg-white text-black rounded p-2 border">
            <div className="h-48 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-1"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-1"></div>
            <div className="h-5 bg-gray-300 rounded w-1/3"></div>
            <div className="mt-2 flex gap-1">
            <div className="h-5 w-12 bg-gray-200 rounded"></div>
            <div className="h-5 w-12 bg-gray-200 rounded"></div>
            </div>
        </div>
    )
}

export default SkeletonCard