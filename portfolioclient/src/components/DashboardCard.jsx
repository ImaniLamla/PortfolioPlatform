import { Link } from 'react-router-dom';

export default function DashboardCard({ title, description, to }) {

    {/* Card is wrapped in a React Router Link to navigate to other pages */}
    return (
    
    <Link to={to}>
        <div className="w-180 h-full p-6 bg-white rounded-lg shadow-lg border-2 border-[#8a9ea7] hover:shadow-xl hover:-translate-y-1 transition-transform duration-150 cursor-pointer">
            <h4 className="mb-2 text-xl font-semibold text-black">
                {title}
            </h4>
            <p className="text-sm text-gray-700">
                {description}
            </p>
            <p className="mt-4 text-sm font-medium text-[#8a9ea7]">
                Manage {title.toLowerCase()} →
            </p>
        </div>
    </Link>
    );
}
