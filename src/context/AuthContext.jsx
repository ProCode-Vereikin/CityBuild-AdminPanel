import React, { createContext, useContext, useEffect, useState } from 'react'
import { auth } from '../firebase/firebaseConfig'
import {
	onAuthStateChanged,
	signInWithEmailAndPassword,
	signOut,
} from 'firebase/auth'

// Create authentication context
const AuthContext = createContext()

// Specify the UID allowed to access the application
const ALLOWED_UID = 'JusfU0l6TERNB2YJhsh1nsbmME03';

export const AuthProvider = ({ children }) => {
	// State to store current user
	const [user, setUser] = useState(null)
	// Loading indicator for auth state
	const [loading, setLoading] = useState(true)

	// Monitor authentication state changes
	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, currentUser => {
			// Check if the UID of the authenticated user matches the allowed UID
			if (currentUser && currentUser.uid === ALLOWED_UID) {
				// Set user if UID matches
				setUser(currentUser)
			} else {
				// Set user to null if UID doesn't match
				setUser(null)
			}
			// Stop loading once the auth state is determined
			setLoading(false)
		})
		// Clean up listener on unmount
		return unsubscribe
	}, [])

	// Function to handle user login
	const login = (email, password) => {
		return signInWithEmailAndPassword(auth, email, password)
	}

	// Function to handle user logout
	const logout = () => {
		return signOut(auth)
	}

	// Provide user data and auth functions to child components
	return (
		<AuthContext.Provider value={{ user, login, logout, loading }}>
			{!loading && children}
		</AuthContext.Provider>
	)
}

// Custom hook to access the AuthContext
export const useAuth = () => useContext(AuthContext)
