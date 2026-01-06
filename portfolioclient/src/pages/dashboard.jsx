import { useSelector } from "react-redux";
import DashboardCard from "../components/DashboardCard";    

const Dashboard = () => {
    
    {/* Looks at Redux store and gives current user object or false*/}
    const user = useSelector((state) => state.auth?.user ?? false)
    return (
        <div>
            {/* Greets the current logged in user to their dashboard */}
            {user ? <h4 className="text-xl text-center text-black pb-5"> Hello, {user.profileName}! </h4> : null} 
            <h3 className="pb-15 text-2xl text-center text-black"> Welcome to your Portfolio Dashboard </h3>

             {/* Displays cards of what they can edit on the dashboard */}
            <div className="flex justify-center">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <DashboardCard
                    title="Profile"
                    description="Update your bio, links, and profile picture."
                    to="/profile" /* path to navigate to */
                    />

                    <DashboardCard
                    title="Projects"
                    description="Add or edit the projects shown on your portfolio."
                    to="/projects"
                    />

                    <DashboardCard
                    title="Experience"
                    description="Manage jobs and internships that appear on your site."
                    to="/experience"
                    />

                    <DashboardCard
                    title="Awards"
                    description="Showcase your awards, honors, and recognitions."
                    to="/awards"
                    />

                </div>
            </div>
            
        </div>
    )
}
export default Dashboard
