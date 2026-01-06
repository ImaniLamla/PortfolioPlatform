export default function ExperienceCard({ experience }) {
    return (


        // displays card with job position, company name and job description
        <div className="max-w-120 min-w-95 min-h-120 p-4 bg-[#e8dfe0] rounded-xl border shadow-xl border-white">
            <h3 className="text-2xl font-semibold text-black text-center mb-8">
                {experience.positionTitle} @ {experience.companyName}
            </h3>

            {experience.description && (
                <p className="mt-2 text-xl text-gray-800 text-center">
                {experience.description}
                </p>
            )}
            </div>
    );
}
