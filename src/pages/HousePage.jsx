import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { db } from '../firebase/firebaseConfig'
import { doc, getDoc } from 'firebase/firestore'
import { Navigation, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const HousePage = () => {
	// Get the house ID from the URL params
	const { id } = useParams()
	// State to store the house data
	const [house, setHouse] = useState(null)
	// State to manage loading state
	const [loading, setLoading] = useState(true)
	// Navigation hook to redirect if needed
	const navigate = useNavigate()

	// Fetch the house data from Firestore
	useEffect(() => {
		const fetchHouse = async () => {
			// Adjust the collection name to match your Firestore structure
			const docRef = doc(db, 'buildings', id)
			// Fetch document by ID
			const docSnap = await getDoc(docRef)
			if (docSnap.exists()) {
				// Set house data in state if document exists
				setHouse(docSnap.data())
			} else {
				console.log('No such document!')
			}
			// Set loading to false after data fetch is complete
			setLoading(false)
		}

		// Call the function to fetch house data
		fetchHouse()
	}, [id]) // Re-run the effect if `id` changes

	// Display a loading message while data is being fetched
	if (loading) return <div>Loading...</div>
	// Display a message if no house is found
	if (!house) return <div>No house found.</div>

	return (
		<div className='mx-1 sm:mx-[3%]'>
			<div>
				<button
					className='w-[150px] bg-primary text-white py-2 px-3 flex items-center justify-center mt-3 rounded-xl cursor-pointer'
					onClick={() => navigate('/')}
				>
					View property
				</button>
			</div>

			<h1 className='text-xl font-semibold my-5'>
				{house.typeBuilding} Details
			</h1>
			<div className='flex flex-col border border-zinc-500 rounded p-5 gap-6'>
				<div className='flex flex-row flex-wrap gap-5'>
					<div className='w-[350px]'>
						<img src={house.image} alt={house.city} />
					</div>
					<div className='flex flex-col items-start gap-4'>
						<p className='text-lg font-medium'>City: {house.city}</p>
						<p className='text-lg font-medium'>Address: {house.address}</p>
						<p className='text-lg font-medium'>
							Status: {house.buildingStatus}
						</p>
						<p className='text-lg font-medium'>Rooms: {house.hauseRooms}</p>
						<p className='text-lg font-medium'>Area (m²): {house.hauseArea}</p>
						<p className='text-lg font-medium'>Parking: {house.parking}</p>
						<p className='text-lg font-medium'>Price: ${house.price}</p>
						<p className='text-lg font-medium'>
							Description: {house.description}
						</p>
					</div>
				</div>
				<div className='flex flex-col items-start gap-4'>
					<p className='text-lg font-medium'>House images:</p>
					<div className='w-[400px] flex items-center justify-center'>
						<Swiper
							modules={[Navigation, Pagination]}
							spaceBetween={2}
							slidesPerView={1}
							navigation
							pagination={{ clickable: true }}
						>
							{house.hauseImages.map((item, index) => (
								<SwiperSlide key={index}>
									<div className='flex items-center justify-center'>
										<img
											className='max-w-[300px] max-h-[200px]'
											src={item}
											alt=''
										/>
									</div>
								</SwiperSlide>
							))}
						</Swiper>
					</div>
				</div>
			</div>
		</div>
	)
}

export default HousePage
