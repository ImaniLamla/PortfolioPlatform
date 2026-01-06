export default function ProjectCard({ project }) {
    return (
        <div className="max-w-120 min-w-95 min-h-120 p-4 mt-10 bg-[#8d9b6a] rounded-xl border shadow-2xl border-white transform transition duration-200 hover:scale-103">
            <h3 className="text-2xl font-semibold text-white text-center mb-16">
                {project.title}
            </h3>

            {(project.shortSummary || project.description) && (
                <p className="mt-2 text-xl text-white text-center mb-10">
                {project.shortSummary || project.description}
                </p>
            )}

            {project.techStack && (
                <p className="mt-4 text-sm text-white text-center">
                <span className="font-semibold">Tech:</span> {project.techStack}
                </p>
            )}

            {project.liveUrl && (
                <p className="mt-4 text-center">
                <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-blue-700 underline"
                >
                    View Project
                </a>
                </p>
            )}
        </div>
    );
}
