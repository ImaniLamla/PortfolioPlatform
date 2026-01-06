import { useEffect, useState, useRef } from 'react';
import axios from 'axios';                                    // used to call Node/Express backend

// local assets for GitHub and LinkedIn icons
import githubLogo from './assets/github_logo.png';
import linkedinLogo from './assets/linkedin_logo3.png';

// components used to display experiences, projects and awards
import ExperienceCard from './components/ExperienceCard';
import ProjectCard from './components/ProjectCard';
import AwardCard from './components/AwardCard';

function App() {
  const [profile, setProfile] = useState(null);             // object holding public profile fields
  const [projects, setProjects] = useState([]);             // list of public projects
  const [experiences, setExperiences] = useState([]);       // list of public experiences
  const [awards, setAwards] = useState([]);                 // list of public awards

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const experiencesRef = useRef(null);                      // ref to the scrollable container of experience cards
  const projectsRef = useRef(null);                         // ref to the scrollable container of project cards
  const SCROLL_AMOUNT = 400;                                // # of pixels per click

  // generic scroll helper
  const scrollContainer = (ref, direction = 1) => {         // ref is the ref bound to scrollable div, 
    if (!ref.current) return;                               // ref.current is the current DOM element
    ref.current.scrollBy({                                  // smoothly scrolls horizontally
      left: direction * SCROLL_AMOUNT,
      behavior: 'smooth',
    });
  };

  const normalizeUrl = (url) => {                           // checks if URLs start with http:// or https:// 
    if (!url) return '';
    if (!/^https?:\/\//i.test(url)) {                       // if it doesn't start with http:// or https://, add https://
      return `https://${url}`;
    }
    return url;
  };

  // fetches public portfolio data
  useEffect(() => {
    setLoading(true);                                       // sets loading 
    setError('');

    // email identifies which user’s public portfolio to show and links public page to a specific user in the database
    const PUBLIC_EMAIL = 'YOUR_EMAIL@gmail.com';
    const params = { email: PUBLIC_EMAIL };

    // GET request to load public data
    const profileReq     = axios.get('http://localhost:8080/public/profile',     { params });
    const projectsReq    = axios.get('http://localhost:8080/public/projects',    { params });
    const experiencesReq = axios.get('http://localhost:8080/public/experiences', { params });
    const awardsReq      = axios.get('http://localhost:8080/public/awards',      { params });

    // runs the GET requests in parallel
    Promise.all([profileReq, projectsReq, experiencesReq, awardsReq])
      .then(([profileRes, projectsRes, experiencesRes, awardsRes]) => {   // de-structures the results to set each piece of state:
        setProfile(profileRes.data);
        setProjects(projectsRes.data || []);
        setExperiences(experiencesRes.data || []);
        setAwards(awardsRes.data || []);
      })
      .catch((err) => {
        console.error('Error loading public portfolio:', err);
        setError('There was an error loading this portfolio.');
      })
      .finally(() => {
        setLoading(false);                                                // sets loading to false so UI can render
      });
  }, []);

  // displays if page is still fetching public portfolio data
  if (loading) {
    return <p className="text-center mt-10 text-gray-600">Loading portfolio...</p>;
  }

  // displays error message if unable to load public portfolio data
  if (error) {
    return <p className="text-center mt-10 text-red-600">{error}</p>;
  }

  return(

    <div className="min-h-screen w-full flex flex-col">

      {/* PUBLIC PROFILE: Only renders if public profile loads */}
      {profile && (
      <header className="mt-10 mb-10 flex flex-col items-center px-6 md:px-16 lg:px-28">

        {/* Profile Image, Name, and Tagline */}
        <div className="flex items-center gap-4">
          {profile.profilePictureUrl && (
            <img
              src={profile.profilePictureUrl}
              alt="profile image"
              className="w-100 h-100 rounded-full object-cover slide-in-left shadow-2xl"
            />
          )}

          <div className="flex flex-col gap-5 slide-in-right">
            <h1 className="text-9xl font-semibold text-[#8d9b6a]">
              Imani Lamla
            </h1>

            <p className="mt-1 text-3xl italic text-gray-700 text-black">
              Computer Science student crafting intuitive, human-centered interfaces.
            </p>

          </div>
        </div>

        {/* Social Links: sets icons as links to GitHub and LinkedIn sites, shows icons and labels */}
        <div className="mt-10 flex items-center gap-4 mb-0 pb-0">
          {profile.githubUrl && (
            <a
              href={normalizeUrl(profile.githubUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 text-sm text-gray-700 hover:text-black"
            >
              <img
              src={githubLogo}
              alt="GitHub"
              className="w-13 h-13 object-contain"
            />
              <span>GitHub</span>
            </a>
          )}

          {profile.linkedinUrl && (
            <a
              href={normalizeUrl(profile.linkedinUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-0 text-sm text-gray-700 hover:text-black"
            >
              <img
              src={linkedinLogo}
              alt="LinkedIn"
              className="w-21 h-21 object-contain"
            />
              <span>LinkedIn</span>
            </a>
          )}
        </div>

      </header>
    )}


    {/* PUBLIC EXPERIENCE */}
    <section className="relative w-full bg-[#7f97a3] py-12 mt-16">
      <div className="max-w-[1400px] mx-auto px-8">
        <h2 className="mb-10 text-6xl font-semibold text-white text-center">
          My Experience
        </h2>

        {/* Scrollable section */}
        {experiences.length > 1 && (                                    // arrows render when there's more than 1 experience
          <button
            type="button"
            onClick={() => scrollContainer(experiencesRef, -1)}         //scrolls left
            className="hidden md:flex items-center justify-center absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 text-white hover:bg-black/70 transition"
          >
            ‹
          </button>
        )}

        {experiences.length > 1 && (                                    // arrows render when there's more than 1 experience
          <button
            type="button"
            onClick={() => scrollContainer(experiencesRef, 1)}          // scrolls right
            className="hidden md:flex items-center justify-center absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 text-white hover:bg-black/70 transition"
          >
            ›
          </button>
        )}

        <div
          ref={experiencesRef}                                         // connects the DOM node to the ref so the scroll helper can call .scrollBy
          className="mt-6 overflow-x-auto hide-scrollbar"
        >
          <div className="flex gap-10 md:gap-18 pb-6">
            {experiences.length === 0 ? (                              // checks if there are any experiences
              <p className="text-sm text-gray-100 text-center w-full">
                No experiences to display.
              </p>
            ) : (
              experiences.map((exp) => (                               // maps list of experiences to ExperienceCard component
                <div
                  key={exp.id}
                  className="flex-shrink-0 w-[340px] md:w-[380px]"
                >
                  <ExperienceCard experience={exp} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>


    {/* PUBLIC PROJECTS: similar to public experiences */}
    <section className="relative w-full bg-[#e8dfe0] py-12 mt-0">
      <div className="max-w-[1400px] mx-auto px-8">
        <h2 className="mb-10 text-6xl font-semibold text-[#8a9ea7] text-center">
          My Projects
        </h2>

        {projects.length > 1 && (
          <button
            type="button"
            onClick={() => scrollContainer(projectsRef, -1)}
            className="hidden md:flex items-center justify-center absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 text-white hover:bg-black/70 transition"
          >
            ‹
          </button>
        )}

        {projects.length > 1 && (
          <button
            type="button"
            onClick={() => scrollContainer(projectsRef, 1)}
            className="hidden md:flex items-center justify-center absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 text-white hover:bg-black/70 transition"
          >
            ›
          </button>
        )}

        <div
          ref={projectsRef}
          className="mt-6 overflow-x-auto hide-scrollbar pl-5"
        >
          <div className="flex gap-10 md:gap-18 pb-6">
            {projects.length === 0 ? (
              <p className="text-sm text-gray-100 text-center w-full">
                No projects to display.
              </p>
            ) : (
              projects.map((proj) => (
                <div
                  key={proj.id}
                  className="flex-shrink-0 w-[340px] md:w-[380px] "
                >
                  <ProjectCard project={proj} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>


    
    {/* PUBLIC Awards: passes awards to AwardCard */}
    <section className="relative w-full bg-[#dab692] py-0 mt-16">
      <div className="w-full mx-auto px-8">                                     
            <AwardCard awards={awards} />                             
      </div>
    </section>




    {/* PUBLIC BIO */}
    <section className="relative w-full bg-[#e8dfe0] py-0 mt-16">
      <div className="w-full mx-auto px-60 mb-20">
        <h2 className="mb-10 text-6xl font-semibold text-[#8a9ea7] text-center">
          About Me
        </h2>
        {profile?.bio && (                                // displays profile bio only once it's done loading
          <p className="text-3xl text-gray-800 leading-relaxed slide-in-bio">
            {profile.bio}
          </p>
        )}
      </div>
    </section>


    </div>
  )
}
export default App;

