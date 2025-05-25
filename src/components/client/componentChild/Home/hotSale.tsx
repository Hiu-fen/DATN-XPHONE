import { FaFire, FaEye, FaHeart, FaArrowRight  } from "react-icons/fa";

function HotSaleSection() {
  return (
    <div className="bg-gradient-to-b from-red-600 to-red-500 text-white py-4 px-4 mx-24 rounded-lg">
        <div className="flex items-center justify-start mb-4 space-x-3">
            <h2 className="text-xl font-bold hover:text-yellow-400">HOT SALE CUỐI TUẦN</h2>
            <FaFire size={24} color="orange" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-2">
            <div className="bg-white text-black rounded p-2">
                <div className="bg-gray-200 mb-2 relative rounded overflow-hidden group" style={{ position: "relative" }}>
                    <img
                        src="./src/assets/sp1.webp"
                        alt="iPhone 12 mini 128GB"
                        className="w-full h-full object-cover rounded transition duration-500 ease-in-out group-hover:-translate-y-1"
                    />

                    <div
                        className="absolute top-0 right-0 h-full flex flex-col items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-tr rounded-br"
                        style={{ width: "50px" }}
                    >
                        <div className="w-10 h-10 bg-white border-gray-400 border rounded-full flex items-center justify-center cursor-pointer hover:bg-black hover:text-white transition-colors">
                            <FaEye size={20}/>
                        </div>
                        <div className="w-10 h-10 bg-white border-gray-400 border rounded-full flex items-center justify-center cursor-pointer hover:bg-black hover:text-white transition-colors">
                            <FaHeart size={20}/>
                        </div>
                    </div>
                </div>


                <div className="font-bold text-lg">iPhone 12 mini 128GB</div>
                <div className="text-gray-500 text-sm line-through">19.990.000đ</div>
                <div className="text-red-500 text-lg font-semibold">Giá: 14.990.000đ</div>

                <div className="text-xs text-gray-700 py-4 bg-gray-100 rounded-lg mt-2">
                Giảm trực tiếp 40%, tối đa <strong className="text-red-500">600.000 VNĐ</strong> khi mở thẻ TP Bank EVO.
                </div>

                <div className="mt-3 relative">
                    <div className="w-full bg-gray-200 rounded-full h-6 relative overflow-hidden">
                        <div
                        className="bg-red-500 h-6 rounded-full absolute top-0 left-0 z-0"
                        style={{ width: "62%" }}
                        ></div>

                        <div className="absolute top-1/2 left-2 transform -translate-y-1/2 z-10">
                            <FaFire className="text-yellow-300" size={14} />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center text-xs text-white font-semibold z-20">
                        Đã bán: 312
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white text-black rounded p-2">
                <div className="bg-gray-200 mb-2 relative rounded overflow-hidden group" style={{ position: "relative" }}>
                    <img
                        src="./src/assets/sp1.webp"
                        alt="iPhone 12 mini 128GB"
                        className="w-full h-full object-cover rounded transition duration-500 ease-in-out group-hover:-translate-y-1"
                    />

                    <div
                        className="absolute top-0 right-0 h-full flex flex-col items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-tr rounded-br"
                        style={{ width: "50px" }}
                    >
                        <div className="w-10 h-10 bg-white border-gray-400 border rounded-full flex items-center justify-center cursor-pointer hover:bg-black hover:text-white transition-colors">
                            <FaEye size={20}/>
                        </div>
                        <div className="w-10 h-10 bg-white border-gray-400 border rounded-full flex items-center justify-center cursor-pointer hover:bg-black hover:text-white transition-colors">
                            <FaHeart size={20}/>
                        </div>
                    </div>
                </div>


                <div className="font-bold text-lg">iPhone 12 mini 128GB</div>
                <div className="text-gray-500 text-sm line-through">19.990.000đ</div>
                <div className="text-red-500 text-lg font-semibold">Giá: 14.990.000đ</div>

                <div className="text-xs text-gray-700 py-4 bg-gray-100 rounded-lg mt-2">
                Giảm trực tiếp 40%, tối đa <strong className="text-red-500">600.000 VNĐ</strong> khi mở thẻ TP Bank EVO.
                </div>

                <div className="mt-3 relative">
                    <div className="w-full bg-gray-200 rounded-full h-6 relative overflow-hidden">
                        <div
                        className="bg-red-500 h-6 rounded-full absolute top-0 left-0 z-0"
                        style={{ width: "62%" }}
                        ></div>

                        <div className="absolute top-1/2 left-2 transform -translate-y-1/2 z-10">
                            <FaFire className="text-yellow-300" size={14} />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center text-xs text-white font-semibold z-20">
                        Đã bán: 312
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white text-black rounded p-2">
                <div className="bg-gray-200 mb-2 relative rounded overflow-hidden group" style={{ position: "relative" }}>
                    <img
                        src="./src/assets/sp1.webp"
                        alt="iPhone 12 mini 128GB"
                        className="w-full h-full object-cover rounded transition duration-500 ease-in-out group-hover:-translate-y-1"
                    />

                    <div
                        className="absolute top-0 right-0 h-full flex flex-col items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-tr rounded-br"
                        style={{ width: "50px" }}
                    >
                        <div className="w-10 h-10 bg-white border-gray-400 border rounded-full flex items-center justify-center cursor-pointer hover:bg-black hover:text-white transition-colors">
                            <FaEye size={20}/>
                        </div>
                        <div className="w-10 h-10 bg-white border-gray-400 border rounded-full flex items-center justify-center cursor-pointer hover:bg-black hover:text-white transition-colors">
                            <FaHeart size={20}/>
                        </div>
                    </div>
                </div>


                <div className="font-bold text-lg">iPhone 12 mini 128GB</div>
                <div className="text-gray-500 text-sm line-through">19.990.000đ</div>
                <div className="text-red-500 text-lg font-semibold">Giá: 14.990.000đ</div>

                <div className="text-xs text-gray-700 py-4 bg-gray-100 rounded-lg mt-2">
                Giảm trực tiếp 40%, tối đa <strong className="text-red-500">600.000 VNĐ</strong> khi mở thẻ TP Bank EVO.
                </div>

                <div className="mt-3 relative">
                    <div className="w-full bg-gray-200 rounded-full h-6 relative overflow-hidden">
                        <div
                        className="bg-red-500 h-6 rounded-full absolute top-0 left-0 z-0"
                        style={{ width: "62%" }}
                        ></div>

                        <div className="absolute top-1/2 left-2 transform -translate-y-1/2 z-10">
                            <FaFire className="text-yellow-300" size={14} />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center text-xs text-white font-semibold z-20">
                        Đã bán: 312
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white text-black rounded p-2">
                <div className="bg-gray-200 mb-2 relative rounded overflow-hidden group" style={{ position: "relative" }}>
                    <img
                        src="./src/assets/sp1.webp"
                        alt="iPhone 12 mini 128GB"
                        className="w-full h-full object-cover rounded transition duration-500 ease-in-out group-hover:-translate-y-1"
                    />

                    <div
                        className="absolute top-0 right-0 h-full flex flex-col items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-tr rounded-br"
                        style={{ width: "50px" }}
                    >
                        <div className="w-10 h-10 bg-white border-gray-400 border rounded-full flex items-center justify-center cursor-pointer hover:bg-black hover:text-white transition-colors">
                            <FaEye size={20}/>
                        </div>
                        <div className="w-10 h-10 bg-white border-gray-400 border rounded-full flex items-center justify-center cursor-pointer hover:bg-black hover:text-white transition-colors">
                            <FaHeart size={20}/>
                        </div>
                    </div>
                </div>


                <div className="font-bold text-lg">iPhone 12 mini 128GB</div>
                <div className="text-gray-500 text-sm line-through">19.990.000đ</div>
                <div className="text-red-500 text-lg font-semibold">Giá: 14.990.000đ</div>

                <div className="text-xs text-gray-700 py-4 bg-gray-100 rounded-lg mt-2">
                Giảm trực tiếp 40%, tối đa <strong className="text-red-500">600.000 VNĐ</strong> khi mở thẻ TP Bank EVO.
                </div>

                <div className="mt-3 relative">
                    <div className="w-full bg-gray-200 rounded-full h-6 relative overflow-hidden">
                        <div
                        className="bg-red-500 h-6 rounded-full absolute top-0 left-0 z-0"
                        style={{ width: "62%" }}
                        ></div>

                        <div className="absolute top-1/2 left-2 transform -translate-y-1/2 z-10">
                            <FaFire className="text-yellow-300" size={14} />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center text-xs text-white font-semibold z-20">
                        Đã bán: 312
                        </div>
                    </div>
                </div>
            </div>

        {/* Có thể thêm sản phẩm khác tương tự */}
        </div>

        <div className="text-center mt-6">  
            <button className="bg-red-500 text-white px-4 py-2 border border-transparent rounded inline-flex items-center justify-center gap-2 transition-colors hover:bg-black hover:border-white">
                Xem tất cả
                <FaArrowRight />
            </button>
        </div>

    </div>
  )
}

export default HotSaleSection
