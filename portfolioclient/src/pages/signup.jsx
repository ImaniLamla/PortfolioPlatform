import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { signup } from '../store/authSlice'
import { Navigate } from 'react-router-dom';


function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [profileName, setProfileName] = useState('');
    const user = useSelector((state) => state.auth?.user ?? false) 
    const error = useSelector((state) => state.auth?.error ?? false)
    const dispatch = useDispatch();


    const apiCall = () => {
    axios.get('http://localhost:8080').then((data) => {
      //this console.log will be in our frontend console
        console.log(data)
    })
    }

    /*
    const submitHandler = e => {
    e.preventDefault()
    axios.post('http://localhost:8080/signup', {email: email, password: password, profileName: profileName})
    .then((res) => {
       // console.log(data)
        setEmail('')
        setPassword('')
        setProfileName('')
        setUser(res.data.profileName)
    })
    .catch((err) => {
        console.error('Signup error:', err);
    });
    }
    */

    const submitHandler = e => {
    e.preventDefault()
    dispatch(signup({email, password, profileName}))
    .then((res) => {
        setEmail('')
        setPassword('')
        setProfileName('')
    })
    }


    return (
    <div>
        <form className='mx-auto border-2 p-9 md:p-12 w-72 md:w-96 border-[#8a9ea7] mt-36 h-auto' onSubmit={submitHandler}>
        <h3 className='pb-6 text-2xl text-center text-[#8a9ea7] font-semibold'>Sign Up</h3>

        <label className='block mb-1 text-xl text-[#8a9ea7]' htmlFor='email'>Email</label>
        <input className='w-full h-8 p-1 mb-6 bg-white focus:outline-none' id='email' type='text' value={email} onChange={(e) => setEmail(e.target.value)}/>
        <label className='block mb-1 text-xl text-[#8a9ea7]' htmlFor='password'>Password</label>
        <input className='w-full h-8 p-1 mb-6 bg-white focus:outline-none' id='password' type='password' value={password} onChange={(e) => setPassword(e.target.value)}/>
        <label className='block mb-1 text-xl text-[#8a9ea7]' htmlFor='profileName'>Profile Name</label>
        <input className='w-full h-8 p-1 mb-6 bg-white focus:outline-none' id='profileName' type='text' value={profileName} onChange={(e) => setProfileName(e.target.value)}/>
        
        <div className='flex justify-between'>
            <button className='px-3 py-1 rounded-sm bg-[#8a9ea7] text-white cursor-pointer' type='button'>Cancel</button>
            <button className='px-3 py-1 rounded-sm bg-[#8a9ea7] text-white cursor-pointer' type='submit'>Submit</button>
        </div>

        {error ? <p className='pt-10 text-center text-red-600'>{error}</p>: null}
        {user ? <Navigate to='/dashboard' replace={true} /> : null }

        </form>
    </div>
    );

}

export default Signup;
