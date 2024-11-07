import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const Login = () => {
	// State to store the entered email and password
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	// Destructure the login function from the authentication context
	const { login } = useAuth()
	// Initialize the navigate hook for page redirection
	const navigate = useNavigate()

	// Handle the login form submission
	const handleLogin = async e => {
		// Prevent the default form submit behavior (page reload)
		e.preventDefault()
		try {
			// Attempt to log in with the entered email and password
			await login(email, password)
			// Redirect to the home page after successful login
			navigate('/')
		} catch (error) {
			// Log any errors encountered during the login attempt
			console.error('Login error:', error.message)
		}
	}

	return (
		<div className='flex w-[100%] h-[90vh] items-center justify-center'>
			<form
				className='flex flex-col gap-9 bg-primary rounded-md p-8'
				onSubmit={handleLogin}
			>
				<div className='flex flex-col items-start'>
					<label className='text-lg font-semibold text-white'>Email</label>
					<input
						className='mt-2 w-full py-1 px-1 border-1 border-white rounded outline-none cursor-pointer focus:border-white focus:ring-2 focus:ring-white transition-all duration-200'
						type='email'
						placeholder='Enter your email'
						value={email}
						onChange={e => setEmail(e.target.value)}
						required
					/>
				</div>
				<div className='flex flex-col items-start'>
					<label className='text-lg font-semibold text-white'>Password</label>
					<input
						className='mt-2 w-full py-1 px-1 border-1 border-white rounded outline-none cursor-pointer focus:border-white focus:ring-2 focus:ring-white transition-all duration-200'
						type='password'
						placeholder='Enter your password'
						value={password}
						onChange={e => setPassword(e.target.value)}
						required
					/>
				</div>
				<button
					className='w-[200px] h-[35px] mt-3 bg-white text-primary text-lg font-semibold rounded hover:scale-105 transition-all duration-300'
					type='submit'
				>
					Enter
				</button>
			</form>
		</div>
	)
}

export default Login
