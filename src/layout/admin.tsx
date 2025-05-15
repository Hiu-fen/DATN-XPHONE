import { Outlet } from 'react-router-dom';
import AdminHeader from '../components/admin/Aside/header';
import AdminSidebar from '../components/admin/Aside/sidebar';

const AdminLayout = () => {
    return (
        <main className="min-h-screen bg-gray-50">
            <AdminHeader />
            <div className="flex">
                <AdminSidebar />
                <div className="content w-full lg:w-4/5 p-5">
                    <div className="bg-white rounded-lg shadow-sm p-6 min-h-[calc(100vh-120px)]">
                        <Outlet />
                    </div>

                </div>
            </div>
        </main>
    );
};
export default AdminLayout