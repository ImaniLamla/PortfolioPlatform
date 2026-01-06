export default function AwardCard({ awards }) {
    if (!awards || awards.length === 0) return null;                            //checks if there are any published awards

    return (
        <section
        id="awards"
        className="bg-[#dab692] py-16 flex flex-col items-center"
        >
        <h2 className="mb-10 text-6xl font-semibold text-white text-center">
            My Awards
        </h2>

        <div className="flex flex-wrap justify-center gap-6 px-4">

            {/* Maps awards to small AwardCard: only displays award name */}
            {awards.map((award, index) => (
            <span
                key={award.id ?? award.title ?? index}
                className="award-pill inline-flex items-center justify-center px-8 py-3 rounded-full bg-[#8f5b34] text-white text-lg
                font-medium shadow-lg opacity-0 translate-y-3" style={{ animationDelay: `${index * 150}ms` }}>
                {award.title} 
            </span>
            ))}
        </div>
        </section>
    );
}
