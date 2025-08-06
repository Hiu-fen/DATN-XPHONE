import { Outlet } from 'react-router-dom';
import AdminHeader from '../components/admin/Aside/header';
import AdminSidebar from '../components/admin/Aside/sidebar';

const AdminLayout = () => {
    return (
        <main className="min-h-screen bg-gray-50">
            <AdminHeader />

            {/* Wrapper responsive */}
            <div className="flex flex-col lg:flex-row max-w-screen-2xl mx-auto">
                {/* Sidebar */}
                <aside className="w-full lg:w-1/5 border-r bg-white">
                    <AdminSidebar />
                </aside>

                {/* Main content */}
                <section className="w-full lg:w-4/5 p-4 md:p-6 overflow-x-auto">
                    <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 min-h-[calc(100vh-120px)]">
                        <Outlet />
                    </div>
                </section>
            </div>
        </main>
    );
};

export default AdminLayout;
