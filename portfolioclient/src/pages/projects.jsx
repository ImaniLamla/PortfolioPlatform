// src/pages/projects.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

export default function Projects() {
    const authUser = useSelector((state) => state.auth.user);

    const [title, setTitle] = useState('');
    const [shortSummary, setShortSummary] = useState('');
    const [description, setDescription] = useState('');
    const [techStack, setTechStack] = useState('');
    const [liveUrl, setLiveUrl] = useState('');
    const [tagsInput, setTagsInput] = useState(''); // "React, Node, MySQL"

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Load existing projects for this user
    useEffect(() => {
    if (!authUser?.email) return;

    axios
        .get('http://localhost:8080/projects', {
        params: { email: authUser.email },
        })
        .then((res) => {
        setProjects(res.data || []);
        })
        .catch((err) => {
        console.error('Error loading projects:', err);
        });
    }, [authUser]);

    const clearForm = () => {
    setTitle('');
    setShortSummary('');
    setDescription('');
    setTechStack('');
    setLiveUrl('');
    setTagsInput('');
    };

    const submitHandler = (e) => {
    e.preventDefault();
    if (!authUser?.email) {
        setMessage('You must be signed in to add projects.');
        return;
        }

    setLoading(true);
    setMessage('');

    axios
        .post('http://localhost:8080/projects', {
        email: authUser.email,
        title,
        shortSummary,
        description,
        techStack,
        liveUrl,
        tags: tagsInput, // send comma-separated string
        })
        .then((res) => {
        setMessage(res.data?.message ?? 'Project added.');
        clearForm();

        // reload projects
        return axios.get('http://localhost:8080/projects', {
            params: { email: authUser.email },
        });
        })
        .then((res2) => {
        if (res2) setProjects(res2.data || []);
        })
        .catch((err) => {
        console.error('Error saving project:', err);
        setMessage(
            err.response?.data ?? 'There was an error saving the project.'
        );
        })
        .finally(() => {
        setLoading(false);
        });
    };

    const toggleProjectPublish = (id, currentValue) => {
    axios
    .patch(`http://localhost:8080/projects/${id}/publish`, {
        isPublished: !currentValue,
    })
    .then((res) => {
        const newValue = res.data.isPublished;
        setProjects((prev) =>
        prev.map((proj) =>
            proj.id === id ? { ...proj, isPublished: newValue } : proj
        )
        );
    })
    .catch((err) => {
        console.error('Error toggling project publish:', err);
        setMessage('Could not update project publish status.');
    });
};


    return (
    <div className="px-6 md:px-16 lg:px-28">
        <h2 className="mt-10 text-2xl font-semibold text-center text-black">
        Projects
        </h2>

        {authUser ? (
        <p className="mt-2 mb-8 text-center text-gray-800">
            Signed in as{' '}
            <span className="font-medium">{authUser.profileName}</span> 
        </p>
        ) : (
        <p className="mt-2 mb-8 text-center text-red-600">
            You are not signed in.
        </p>
        )}

      {/* Form */}
        <form
        className="max-w-3xl p-8 mx-auto bg-white border rounded-lg shadow-md border-[#8a9ea7]"
        onSubmit={submitHandler}
        >
        <label
            htmlFor="title"
            className="block mb-2 text-lg font-medium text-[#8a9ea7]"
        >
            Project Title
        </label>
        <input
            id="title"
            type="text"
            className="w-full h-9 p-2 mb-6 bg-white border rounded focus:outline-none focus:ring focus:ring-[#8a9ea7]"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
        />

        <label
            htmlFor="shortSummary"
            className="block mb-2 text-lg font-medium text-[#8a9ea7]"
        >
            Short Summary
        </label>
        <input
            id="shortSummary"
            type="text"
            className="w-full h-9 p-2 mb-6 bg-white border rounded focus:outline-none focus:ring focus:ring-[#8a9ea7]"
            value={shortSummary}
            onChange={(e) => setShortSummary(e.target.value)}
        />

        <label
            htmlFor="description"
            className="block mb-2 text-lg font-medium text-[#8a9ea7]"
        >
            Description
        </label>
        <textarea
            id="description"
            className="w-full h-24 p-2 mb-6 bg-white border rounded focus:outline-none focus:ring focus:ring-[#8a9ea7]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
        />

        <label
            htmlFor="techStack"
            className="block mb-2 text-lg font-medium text-[#8a9ea7]"
        >
            Tech Stack (e.g. React, Node, MySQL)
        </label>
        <input
            id="techStack"
            type="text"
            className="w-full h-9 p-2 mb-6 bg-white border rounded focus:outline-none focus:ring focus:ring-[#8a9ea7]"
            value={techStack}
            onChange={(e) => setTechStack(e.target.value)}
        />

        <label
            htmlFor="liveUrl"
            className="block mb-2 text-lg font-medium text-[#8a9ea7]"
        >
            Live URL
        </label>
        <input
            id="liveUrl"
            type="text"
            className="w-full h-9 p-2 mb-6 bg-white border rounded focus:outline-none focus:ring focus:ring-[#8a9ea7]"
            value={liveUrl}
            onChange={(e) => setLiveUrl(e.target.value)}
        />

        <label
            htmlFor="tags"
            className="block mb-2 text-lg font-medium text-[#8a9ea7]"
        >
            Tags (comma separated)
        </label>
        <input
            id="tags"
            type="text"
            placeholder="React, Node, UX, Portfolio"
            className="w-full h-9 p-2 mb-6 bg-white border rounded focus:outline-none focus:ring focus:ring-[#8a9ea7]"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
        />

        <div className="flex justify-end mt-4 space-x-4">
            <button
            type="button"
            className="px-4 py-2 text-sm rounded bg-gray-300 cursor-pointer"
            onClick={() => {
                clearForm();
                setMessage('');
            }}
            >
            Clear
            </button>
            <button
            type="submit"
            className="px-4 py-2 text-sm text-white rounded cursor-pointer bg-[#8a9ea7] disabled:opacity-60"
            disabled={loading || !authUser?.email}
            >
            {loading ? 'Saving...' : 'Save Project'}
            </button>
        </div>

        {message && (
            <p className="mt-4 text-center text-sm text-black">{message}</p>
        )}
        </form>

      {/* List of projects */}
        <div className="max-w-4xl mx-auto mt-10 mb-16">
        <h3 className="mb-4 text-xl font-semibold text-black">
            Your Projects
        </h3>
        {projects.length === 0 ? (
            <p className="text-sm text-gray-600">
            No projects added yet. Use the form above to add your first one.
            </p>
        ) : (
            <ul className="space-y-4">
            {projects.map((proj) => (
                <li
                key={proj.id}
                className="p-4 bg-white border rounded shadow-sm border-[#8a9ea7]"
                >
                <h4 className="text-lg font-semibold text-black">
                    {proj.title}
                </h4>

                {proj.shortSummary && (
                    <p className="mt-1 text-sm text-gray-800">
                    {proj.shortSummary}
                    </p>
                )}

                <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-gray-600">
                    {proj.isPublished ? 'Published (visible on public portfolio)' : 'Unpublished (hidden from public)'}
                    </span>
                    <button
                    type="button"
                    className="px-3 py-1 text-xs font-medium text-white rounded cursor-pointer bg-[#8a9ea7]"
                    onClick={() => toggleProjectPublish(proj.id, proj.isPublished)}
                    >
                    {proj.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                </div>
                </li>
            ))}
            </ul>
        )}
        </div>
    </div>
    );
}
