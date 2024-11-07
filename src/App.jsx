import React from 'react'
import Home from './pages/Home'
import { Route, Routes } from 'react-router-dom'
import EditBuildings from './pages/EditBuildings'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Navbar from './components/Navbar'
import BuildingPage from './pages/BuildingPage'
import HousePage from './pages/HousePage'
import Footer from './components/Footer'

const App = () => {
	return (
		<div className=''>
			<AuthProvider>
				<Navbar />
				<Routes>
					<Route path='/login' element={<Login />} />
					<Route
						path='/'
						element={
							<ProtectedRoute>
								<Home />
							</ProtectedRoute>
						}
					/>
					<Route
						path='/editing'
						element={
							<ProtectedRoute>
								<EditBuildings />
							</ProtectedRoute>
						}
					/>
					<Route
						path='/building/:id'
						element={
							<ProtectedRoute>
								<BuildingPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path='/house/:id'
						element={
							<ProtectedRoute>
								<HousePage />
							</ProtectedRoute>
						}
					/>
				</Routes>
				<Footer />
			</AuthProvider>
		</div>
	)
}

export default App
