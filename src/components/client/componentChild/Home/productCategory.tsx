import { Link } from 'react-router-dom';

const ProductCategory = () => {
  return (
    <div className="py-4 mx-24">
      <h3 className="text-center text-3xl font-semibold my-6">Danh mục nổi bật</h3>
      <div className="grid grid-cols-6 gap-4">
        {/* Danh mục 1 */}
        <Link to="#" className="bg-gray-300 rounded-2xl shadow p-4 flex flex-col items-center hover:bg-gray-900 hover:text-white">
          <img
            src="./src/assets/category1.webp" 
            alt="Danh mục 1"
            className="mb-2 w-20 h-20 object-cover"
          />
          <span className="text-center font-medium">Danh mục 1</span>
        </Link>

        <Link to="#" className="bg-gray-300 rounded-2xl shadow p-4 flex flex-col items-center hover:bg-gray-900 hover:text-white">
          <img
            src="./src/assets/category1.webp" 
            alt="Danh mục 1"
            className="mb-2 w-20 h-20 object-cover"
          />
          <span className="text-center font-medium">Danh mục 1</span>
        </Link>

        <Link to="#" className="bg-gray-300 rounded-2xl shadow p-4 flex flex-col items-center hover:bg-gray-900 hover:text-white">
          <img
            src="./src/assets/category1.webp" 
            alt="Danh mục 1"
            className="mb-2 w-20 h-20 object-cover"
          />
          <span className="text-center font-medium">Danh mục 1</span>
        </Link>

        <Link to="#" className="bg-gray-300 rounded-2xl shadow p-4 flex flex-col items-center hover:bg-gray-900 hover:text-white">
          <img
            src="./src/assets/category1.webp" 
            alt="Danh mục 1"
            className="mb-2 w-20 h-20 object-cover"
          />
          <span className="text-center font-medium">Danh mục 1</span>
        </Link>

        <Link to="#" className="bg-gray-300 rounded-2xl shadow p-4 flex flex-col items-center hover:bg-gray-900 hover:text-white">
          <img
            src="./src/assets/category1.webp" 
            alt="Danh mục 1"
            className="mb-2 w-20 h-20 object-cover"
          />
          <span className="text-center font-medium">Danh mục 1</span>
        </Link>

        <Link to="#" className="bg-gray-300 rounded-2xl shadow p-4 flex flex-col items-center hover:bg-gray-900 hover:text-white">
          <img
            src="./src/assets/category1.webp" 
            alt="Danh mục 1"
            className="mb-2 w-20 h-20 object-cover"
          />
          <span className="text-center font-medium">Danh mục 1</span>
        </Link>
      </div>
    </div>
  )
}

export default ProductCategory
