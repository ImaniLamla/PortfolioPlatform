import { useState, useEffect } from 'react';
import axios from 'axios';                              // sends HTTP requests to Node/Express backend 
import { useSelector } from 'react-redux';              // reads data from redux store

export default function Awards() {

    // gets logged in user from Redux, profile data is tied to user's email
    const authUser = useSelector((state) => state.auth.user);

    // keeps awards fields in local state 
    const [title, setTitle] = useState('');
    const [issuer, setIssuer] = useState('');
    const [description, setDescription] = useState('');
    const [issueDate, setIssueDate] = useState('');      // YYYY-MM-dd

    // list of experience objects received from the backend 
    const [awards, setAwards] = useState([]);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {                                   // Load existing awards for this user
    if (!authUser?.email) return;

    axios
        .get('http://localhost:8080/awards', {
        params: { email: authUser.email },
        })
        .then((res) => {
        setAwards(res.data || []);                      // populates the list of awards retrieved from the GET request
        })
        .catch((err) => {
        console.error('Error loading awards:', err);
        });
    }, [authUser]);

    const clearForm = () => {
        setTitle('');
        setIssuer('');
        setDescription('');
        setIssueDate('');
    };

    const submitHandler = (e) => {
    e.preventDefault();
    if (!authUser?.email) {
        setMessage('You must be signed in to add awards.');
        return;
    }

    setLoading(true);
    setMessage('');

    axios
        .post('http://localhost:8080/awards', {                     // POST request used to save a new award
        email: authUser.email,
        title,
        issuer,
        description,
        issuedDate: issueDate,
        })
        .then((res) => {
        setMessage(res.data?.message ?? 'Award added.');
        clearForm();

        // reload list
        return axios.get('http://localhost:8080/awards', {          // reloads list with the new award that was recently added
            params: { email: authUser.email },
        });
        })
        .then((res2) => {
        if (res2) setAwards(res2.data || []);
        })
        .catch((err) => {
        console.error('Error saving award:', err);
        setMessage(
            err.response?.data ?? 'There was an error saving award.'
        );
        })
        .finally(() => {
        setLoading(false);
        });
    };

    const toggleAwardPublish = (id, currentValue) => {                  // PATCH request to change the is_published value to publish/unpublish the award
    axios
    .patch(`http://localhost:8080/awards/${id}/publish`, {              
        isPublished: !currentValue,                                     // sets value to the opposite of what is was (false to true and true to false)
    })
    .then((res) => {
        const newValue = res.data.isPublished;
        setAwards((prev) =>                                             // loops over awards and updates isPublished for matching id, no need to rerender the page
        prev.map((awd) =>
            awd.id === id ? { ...awd, isPublished: newValue } : awd
        )
        );
    })
    .catch((err) => {
        console.error('Error toggling award publish:', err);
        setMessage('Could not update award publish status.');
    });
};


    return (
    <div className="px-6 md:px-16 lg:px-28">
        <h2 className="mt-10 text-2xl font-semibold text-center text-black">
        Awards
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
            Award Title
        </label>
        <input
            id="title"
            type="text"
            className="w-full h-9 p-2 mb-6 bg-white border rounded focus:outline-none focus:ring focus:ring-[#8a9ea7]"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
        />

        <label
            htmlFor="issuer"
            className="block mb-2 text-lg font-medium text-[#8a9ea7]"
        >
            Award Issuer
        </label>
        <input
            id="issuer"
            type="text"
            className="w-full h-9 p-2 mb-6 bg-white border rounded focus:outline-none focus:ring focus:ring-[#8a9ea7]"
            value={issuer}
            onChange={(e) => setIssuer(e.target.value)}
        />

        <label
            htmlFor="issueDate"
            className="block mb-2 text-lg font-medium text-[#8a9ea7]"
        >
            Issued Date
        </label>
        <input
            id="issueDate"
            type="date"
            className="w-full h-9 p-2 mb-6 bg-white border rounded focus:outline-none focus:ring focus:ring-[#8a9ea7]"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
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

        {/* Buttons that clear the fields and saves the new awards fields*/}
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
            {loading ? 'Saving...' : 'Save Award'}
            </button>
        </div>

        {message && (
            <p className="mt-4 text-center text-sm text-black">{message}</p>
        )}
        </form>

        {/* Lists the awards already in the database*/}
        <div className="max-w-4xl mx-auto mt-10 mb-16">
        <h3 className="mb-4 text-xl font-semibold text-black">
            Your Awards
        </h3>
        {awards.length === 0 ? (                                                    // checks to see if there are any awards for the user
            <p className="text-sm text-gray-600">
            No awards added yet. Use the form above to add your first one.
            </p>
        ) : (
            <ul className="space-y-4">
            {awards.map((awd) => (                                                  // map over awards list to render each item as a list item 
                <li
                key={awd.id}
                className="p-4 bg-white border rounded shadow-sm border-[#8a9ea7]"
                >
                <h4 className="text-lg font-semibold text-black">
                    {awd.title} @ {awd.issuer}                                      {/* Displays the award title @ award issuer */}
                </h4>

                {awd.issuedDate && (                                                // will render is issuedDate exists
                    <p className="mt-1 text-sm text-gray-700">
                    Issued:{' '}
                    {new Date(awd.issuedDate).toLocaleDateString('en-US', {         // converts date from YYYY-MM-DD to YYYY-month-DD
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                    })}
                    </p>
                )}

                {awd.description && (                                               // displays the award description
                    <p className="mt-2 text-sm text-gray-800">
                    {awd.description}
                    </p>
                )}

                <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-gray-600">
                    {awd.isPublished ? 'Published (visible on public portfolio)' : 'Unpublished (hidden from public)'}  {/* displays "published" if isPublished is true and vice versa */}
                    </span>
                    <button                                                                                             // button that allows users to toggle Publish or Unpublish
                    type="button"
                    className="px-3 py-1 text-xs font-medium text-white rounded cursor-pointer bg-[#8a9ea7]"
                    onClick={() => toggleAwardPublish(awd.id, awd.isPublished)}                                         //calls function that sends PATCH request and updates isPublished
                    >
                    {awd.isPublished ? 'Unpublish' : 'Publish'}
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
