import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children }) => {
	// Get user and loading state from Auth context
	const { user, loading } = useAuth()

	// Display a loading message while checking authentication status
	if (loading) return <div>loading...</div>

	// If user is authenticated, render the children components
	// If not, redirect to the login page
	return user ? children : <Navigate to='/login' />
}

export default ProtectedRoute
