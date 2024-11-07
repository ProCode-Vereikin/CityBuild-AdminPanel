import React from 'react'
import { useAuth } from '../context/AuthContext'
import { NavLink, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons'

const Navbar = () => {

  const {user, logout} = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
		try {
			await logout()
			navigate('/login') 
		} catch (error) {
			console.error('Ошибка при выходе:', error.message)
		}
	}

  return (
		<nav className='flex w-full px-5 py-4 bg-primary'>
			<div className='w-full'>
				{user ? (
					<div className='flex flex-col md:flex-row items-center md:justify-between'>
						<div className='flex flex-row items-center gap-5'>
							<NavLink to={'/'}>
								<h1 className='text-2xl font-bold text-white cursor-pointer'>
									CityBuild
								</h1>
							</NavLink>
							<p className='text-white font-bold'> - </p>
							<p className='text-white font-medium text-xl'>Admin Panel</p>
						</div>
						<div className='flex flex-row items-center gap-5'>
							<p className='text-white'>{user.email}</p>
							<div className='h-7 border-r-2 border-white'></div>
							<button onClick={handleLogout} className='ml-2'>
								<FontAwesomeIcon
									icon={faRightFromBracket}
									className='text-white text-xl'
									title='Out'
								/>
							</button>
						</div>
					</div>
				) : (
					<div className='flex flex-row items-center gap-5'>
						<h1 className='text-2xl font-bold text-white'>CityBuild</h1>
						<p className='text-white font-bold'> - </p>
						<p className='text-white font-medium text-xl'>Admin Panel</p>
					</div>
				)}
			</div>
		</nav>
	)
}

export default Navbar