import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../store/authSlice.jsx'

export default function Navigation() {
    const loggedIn = useSelector((state) => state.auth?.isLoggedIn ?? false)
    const dispatch = useDispatch()
    return (
        <nav className='flex items-center justify-between w-full h-20 py-2 text-black border-b px-28 mb-36 bg-[#8a9ea7] border-[#8a9ea7]'>
            <Link to='/' className='text-4xl font-medium text-white'>
                <p>Imani Lamla</p>
            </Link>
            {loggedIn ?
                <ul className='flex items-center h-16 text-2xl text-white'>
                    <li className='pl-10'> <Link to='/profile'>Profile</Link></li>
                    <li className='pl-10'> <Link to='/projects'>Projects</Link></li>
                    <li className='pl-10'> <Link to='/experience'>Experience</Link></li>
                    <li className='pl-10'> <Link to='/awards'>Awards</Link></li>
                    <li className='pl-20'><Link to='/' onClick={() => dispatch(logout())}>Logout</Link></li>
                </ul>
                :
                <ul className='flex items-center h-16 text-2xl pr-10'>
                    <li className='pl-10'> <Link to='/signup'>Sign Up</Link></li>
                    <li className='pl-10'> <Link to='/signin'>Sign In</Link></li>
                </ul>
            }
        </nav>
    )
}

