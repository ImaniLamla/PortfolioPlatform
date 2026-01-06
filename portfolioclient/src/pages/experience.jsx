import { useState, useEffect } from 'react';
import axios from 'axios';                      // sends HTTP requests to Node/Express backend 
import { useSelector } from 'react-redux';      // reads data from redux store

export default function Experience() {

    // gets logged in user from Redux, profile data is tied to user's email
    const authUser = useSelector((state) => state.auth.user);

    // keeps experiences fields in local state 
    const [companyName, setCompanyName] = useState('');
    const [positionTitle, setPositionTitle] = useState('');
    const [description, setDescription] = useState('');

    // list of experience objects received from the backend 
    const [experiences, setExperiences] = useState([]);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {                                   // loads existing experiences for this user
    if (!authUser?.email) return;

    axios
        .get('http://localhost:8080/experiences', {
        params: { email: authUser.email },
        })
        .then((res) => {
        setExperiences(res.data || []);                 // populates the list of experiences retrieved from the GET request
        })
        .catch((err) => {
        console.error('Error loading experiences:', err);
        });
    }, [authUser]);

    const clearForm = () => {
        setCompanyName('');
        setPositionTitle('');
        setDescription('');
    };

    const submitHandler = (e) => {
    e.preventDefault();
    if (!authUser?.email) {
        setMessage('You must be signed in to add experience.');
        return;
    }

    setLoading(true);
    setMessage('');

    axios                                                               // POST request used to save a new experience
        .post('http://localhost:8080/experiences', {
        email: authUser.email,
        companyName,
        positionTitle,
        description,
        })
        .then((res) => {
        setMessage(res.data?.message ?? 'Experience added.');
        clearForm();

        return axios.get('http://localhost:8080/experiences', {         // reloads list with the new experience that was recently added
            params: { email: authUser.email },
        });
        })
        .then((res2) => {
        if (res2) setExperiences(res2.data || []);
        })
        .catch((err) => {
        console.error('Error saving experience:', err);
        setMessage(
            err.response?.data ?? 'There was an error saving experience.'
        );
        })
        .finally(() => {
        setLoading(false);
        });
    };

    const toggleExperiencePublish = (id, currentValue) => {         // PATCH request to change the is_published value to publish/unpublish the experience
    axios
    .patch(`http://localhost:8080/experiences/${id}/publish`, {
        isPublished: !currentValue,                                 // sets value to the opposite of what is was (false to true and true to false)
    })
    .then((res) => {
        const newValue = res.data.isPublished;

        setExperiences((prev) =>                                    // loops over experiences and updates isPublished for matching id, no need to rerender the page
        prev.map((exp) =>
            exp.id === id ? { ...exp, isPublished: newValue } : exp
        )
        );
    })
    .catch((err) => {
        console.error('Error toggling experience publish:', err);
        setMessage('Could not update publish status.');
    });
};


    return (
    <div className="px-6 md:px-16 lg:px-28">
        <h2 className="mt-10 text-2xl font-semibold text-center text-black">
        Experience
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

      {/* Form to add new experience */}
        <form
        className="max-w-3xl p-8 mx-auto bg-white border rounded-lg shadow-md border-[#8a9ea7]"
        onSubmit={submitHandler}
        >
        <label
            htmlFor="companyName"
            className="block mb-2 text-lg font-medium text-[#8a9ea7]"
        >
            Company Name
        </label>
        <input
            id="companyName"
            type="text"
            className="w-full h-9 p-2 mb-6 bg-white border rounded focus:outline-none focus:ring focus:ring-[#8a9ea7]"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
        />

        <label
            htmlFor="positionTitle"
            className="block mb-2 text-lg font-medium text-[#8a9ea7]"
        >
            Position Title
        </label>
        <input
            id="positionTitle"
            type="text"
            className="w-full h-9 p-2 mb-6 bg-white border rounded focus:outline-none focus:ring focus:ring-[#8a9ea7]"
            value={positionTitle}
            onChange={(e) => setPositionTitle(e.target.value)}
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

        {/*Button that clears all fields on the form*/}
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

            {/*Button that saves/submits the new experience*/}
            <button
            type="submit"
            className="px-4 py-2 text-sm text-white rounded cursor-pointer bg-[#8a9ea7] disabled:opacity-60"
            disabled={loading || !authUser?.email}
            >
            {loading ? 'Saving...' : 'Save Experience'}
            </button>
        </div>

        {message && (
            <p className="mt-4 text-center text-sm text-black">{message}</p>
        )}
        </form>

      {/* Lists the experience already in the database */}
        <div className="max-w-4xl mx-auto mt-10 mb-16">
        <h3 className="mb-4 text-xl font-semibold text-black">
            Your Experiences
        </h3>
        {experiences.length === 0 ? (                               // checks to see if there are any experiences 
            <p className="text-sm text-gray-600">
            No experiences added yet. Use the form above to add your first one.
            </p>
        ) : (
            <ul className="space-y-4">
            {experiences.map((exp) => (                             // map over experience list to render each one as list item
                <li
                key={exp.id}
                className="p-4 bg-white border rounded shadow-sm border-[#8a9ea7]"
                >
                <h4 className="text-lg font-semibold text-black">
                    {exp.positionTitle} @ {exp.companyName}         {/* Displays position @ company name  */}
                </h4>
                {exp.description && (                               // displays job description
                    <p className="mt-2 text-sm text-gray-800">
                    {exp.description}                               
                    </p>
                )}

                <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-gray-600">
                    {exp.isPublished ? 'Published (visible on public portfolio)' : 'Unpublished (hidden from public)'} {/* displays "published" if isPublished is true and vice versa */}
                    </span>
                    <button                                                                     // button that allows users to toggle Publish or Unpublish
                    type="button"
                    className="px-3 py-1 text-xs font-medium text-white rounded cursor-pointer bg-[#8a9ea7]"
                    onClick={() => toggleExperiencePublish(exp.id, exp.isPublished)}            //calls function that sends PATCH request and updates isPublished
                    >
                    {exp.isPublished ? 'Unpublish' : 'Publish'}
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
