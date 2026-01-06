import { useState, useEffect } from 'react';
import axios from 'axios';                      // sends HTTP requests to Node/Express backend 
import { useSelector } from 'react-redux';      // reads data from redux store

export default function Profile() {

    // gets logged in user from Redux, profile data is tied to user's email
    const authUser = useSelector((state) => state.auth.user);

    // keeps profile fields in local state 
    const [bio, setBio] = useState('');
    const [resumeUrl, setResumeUrl] = useState('');
    const [githubUrl, setGithubUrl] = useState('');
    const [linkedinUrl, setLinkedinUrl] = useState('');
    const [profilePictureUrl, setProfilePictureUrl] = useState('');

    const [loading, setLoading] = useState(false);                      // used while request is in progress
    const [message, setMessage] = useState('');                         // shows feedback

    useEffect(() => {                                                   // loads existing profile data when the user is available
    if (!authUser?.email) return;

    axios
        .get('http://localhost:8080/profile', {                         // sends GET request to backend route and looks up user by email
        params: { email: authUser.email },
        })
        .then((res) => {
        const p = res.data;
        setBio(p.bio ?? '');
        setResumeUrl(p.resumeUrl ?? '');
        setGithubUrl(p.githubUrl ?? '');
        setLinkedinUrl(p.linkedinUrl ?? '');
        setProfilePictureUrl(p.profilePictureUrl ?? '');
        })
        .catch((err) => {
        console.error('Error loading profile:', err);
        });
    }, [authUser]);

    const handleProfilePictureChange = (e) => {                         // converts selected image file to data URL
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();                                // uses FileReader to convert it to a base64 string
        reader.onload = () => {
            setProfilePictureUrl(reader.result);
            setMessage('Profile picture selected.');
        };
        reader.onerror = () => {
            console.error('Error reading image file');
            setMessage('Error reading profile picture file.');
        };
        reader.readAsDataURL(file);
    };

    const handleResumeChange = (e) => {                                 // converts selected resume file to data URL
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            setResumeUrl(reader.result);
            setMessage('Resume selected.');
        };
        reader.onerror = () => {
            console.error('Error reading resume file');
            setMessage('Error reading resume file.');
        };
        reader.readAsDataURL(file);
    };

    const submitHandler = (e) => {                                      // handles submitting the form and saving the profile
    e.preventDefault();
    if (!authUser?.email) {
        setMessage('You must be signed in to save your profile.');
        return;
    }

    setLoading(true);
    setMessage('');

    axios
        .post('http://localhost:8080/profile', {                        // sends POST request to save the data
        email: authUser.email,
        bio,
        resumeUrl,          
        githubUrl,
        linkedinUrl,
        profilePictureUrl,  
        })
        .then((res) => {
            setMessage(res.data?.message ?? 'Profile saved successfully.');
        })
        .catch((err) => {
        console.error('Error saving profile:', err);
        setMessage(
            err.response?.data ?? 'There was an error saving your profile.'
        );
        })
        .finally(() => {
        setLoading(false);
        });
    };

    return (
    <div className="px-6 md:px-16 lg:px-28">
        <h2 className="mt-10 text-2xl font-semibold text-center text-black">
        Edit Profile
        </h2>

        {authUser ? (                                                   // checks if user is signed in
        <p className="mt-2 mb-8 text-center text-gray-800">
            Signed in as{' '}
            <span className="font-medium">{authUser.profileName}</span> 
        </p>
        ) : (
        <p className="mt-2 mb-8 text-center text-red-600">
            You are not signed in.
        </p>
        )}

        <form                                                          // renders a form with fields
        className="max-w-3xl p-8 mx-auto bg-white border rounded-lg shadow-md border-[#8a9ea7] mb-10"
        onSubmit={submitHandler}
        >
        {/* Bio */}
        <label
            htmlFor="bio"
            className="block mb-2 text-lg font-medium text-[#8a9ea7]"
        >
            Bio
        </label>
        <textarea
            id="bio"
            className="w-full h-32 p-2 mb-6 bg-white border rounded focus:outline-none focus:ring focus:ring-[#8a9ea7]"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
        />

        {/* Resume  */}
        <label
            htmlFor="resumeFile"
            className="block mb-2 text-lg font-medium text-[#8a9ea7]"
        >
            Resume (upload file)
        </label>
        <input
            id="resumeFile"
            type="file"
            accept=".pdf,.doc,.docx"
            className="w-full mb-3 text-sm"
            onChange={handleResumeChange}
            />
        {resumeUrl && (                                                     // allows you to view resume if one is already loaded
            <p className="mb-6 text-sm">
            Current resume:{' '}
            <a
                href={resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="underline text-[#8a9ea7]"
            >
                View resume
            </a>
            </p>
        )}

        {/* GitHub */}
        <label
            htmlFor="githubUrl"
            className="block mb-2 text-lg font-medium text-[#8a9ea7]"
        >
            GitHub URL
        </label>
        <input
            id="githubUrl"
            type="text"
            className="w-full h-9 p-2 mb-6 bg-white border rounded focus:outline-none focus:ring focus:ring-[#8a9ea7]"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            placeholder="https://github.com/username"
        />

        {/* LinkedIn */}
        <label
            htmlFor="linkedinUrl"
            className="block mb-2 text-lg font-medium text-[#8a9ea7]"
        >
            LinkedIn URL
        </label>
        <input
            id="linkedinUrl"
            type="text"
            className="w-full h-9 p-2 mb-6 bg-white border rounded focus:outline-none focus:ring focus:ring-[#8a9ea7]"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            placeholder="https://linkedin.com/in/username"
        />

        {/* Profile picture */}
        <label
            htmlFor="profilePictureFile"
            className="block mb-2 text-lg font-medium text-[#8a9ea7]"
        >
            Profile Picture (upload image)
        </label>
        <input
            id="profilePictureFile"
            type="file"
            accept="image/*"
            className="w-full mb-3 text-sm"
            onChange={handleProfilePictureChange}
        />
        {profilePictureUrl && (                                                 // displays a small preview of the image if one is already uploaded
            <div className="flex items-center mb-6 space-x-4">
            <img
                src={profilePictureUrl}
                alt="Profile preview"
                className="w-16 h-16 border rounded-full object-cover"
            />
            <span className="text-sm text-gray-700">Current profile picture</span>
            </div>
        )}

        {/* button that clears the fields*/}
        <div className="flex justify-end mt-4 space-x-4">                           
            <button
            type="button"
            className="px-4 py-2 text-sm rounded bg-gray-300 cursor-pointer"
            onClick={() => {
                setBio('');
                setResumeUrl('');
                setGithubUrl('');
                setLinkedinUrl('');
                setProfilePictureUrl('');
                setMessage('');
            }}
            >
            Clear
            </button>

            <button                                                             // save button
            type="submit"
            className="px-4 py-2 text-sm rounded bg-[#8a9ea7] text-white cursor-pointer disabled:opacity-60"
            disabled={loading || !authUser?.email}                              // disabled when loading or user not logged in
            >
            {loading ? 'Saving...' : 'Save Profile'}
            </button>
        </div>

        {message && (
            <p className="mt-4 text-center text-sm text-black">{message}</p>
        )}
        </form>
    </div>
    );
}
