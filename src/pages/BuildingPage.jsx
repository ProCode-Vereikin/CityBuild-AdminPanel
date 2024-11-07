import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { db } from '../firebase/firebaseConfig'
import { doc, getDoc } from 'firebase/firestore'
import { Navigation, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const BuildingPage = () => {
	// Get the building ID from the URL parameters
	const { id } = useParams()
	// Store building data in state
	const [building, setBuilding] = useState(null)
	// Track loading state
	const [loading, setLoading] = useState(true)
	// Use for programmatic navigation
	const navigate = useNavigate()

	// Fetch building data from Firestore when component mounts
	useEffect(() => {
		const fetchBuilding = async () => {
			// Reference to specific document in 'buildings' collection
			const docRef = doc(db, 'buildings', id)
			// Fetch document data
			const docSnap = await getDoc(docRef)
			if (docSnap.exists()) {
				// Set building data if document exists
				setBuilding(docSnap.data())
			} else {
				// Set building data if document exists
				console.log('No such document!')
			}
			// Stop loading once data is fetched
			setLoading(false)
		}

		// Call the fetch function
		fetchBuilding()
	}, [id])

	// Display loading message while data is being fetched
	if (loading) return <div>Loading...</div>
	// Display message if no building data is found
	if (!building) return <div>No building found.</div>

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
				{building.typeBuilding} Details
			</h1>
			<div className='flex flex-col border border-zinc-500 rounded p-5 gap-6'>
				<div className='flex flex-row gap-5'>
					<div className='w-[350px]'>
						<img
							className='rounded-md'
							src={building.image}
							alt={building.city}
						/>
					</div>
					<div className='flex flex-col items-start gap-4'>
						<p className='text-lg font-medium'>City: {building.city}</p>
						<p className='text-lg font-medium'>Address: {building.address}</p>
						<p className='text-lg font-medium'>
							Status:{' '}
							<span
								className={`${
									building.buildingStatus === 'For Sale' ||
									building.buildingStatus === 'Rent'
										? 'text-green-500' // Зеленый для "For Sale" и "Rent"
										: building.buildingStatus === 'Sold' ||
										  building.buildingStatus === 'Rented'
										? 'text-red-500'
										: ''
								}`}
							>
								{building.buildingStatus}
							</span>
						</p>
						<p className='text-lg font-medium'>Floors: {building.numFloors}</p>
						<p className='text-lg font-medium'>
							Apartments: {building.apartments}
						</p>
						<p className='text-lg font-medium'>Parking: {building.parking}</p>
					</div>
				</div>
				<div className='flex flex-col gap-5'>
					{building.floors.map((item, index) => (
						<div key={index}>
							<div className='flex flex-col items-start gap-3'>
								<div className='flex flex-col md:flex-row gap-5'>
									<p className='text-lg font-bold'>Foolr: {item.floorNumber}</p>
									<p className='text-lg text-zinc-500'>
										Apartments: {item.numApartments}
									</p>
								</div>
								<div className='w-full grid grid-cols-auto gap-4 gap-y-6'>
									{item.apartments.map((appart, index) => (
										<div
											className='flex flex-col gap-5 border border-zinc-400 rounded-md p-5'
											key={index}
										>
											<div>
												<p className='text-lg font-medium'>
													{appart.type}-room
												</p>
												<p className='text-md font-medium'>
													Status:{' '}
													<span
														className={`${
															appart.status === 'For Sale' ||
															appart.status === 'Rent'
																? 'text-green-500' // Зеленый для "For Sale" и "Rent"
																: appart.status === 'Sold' ||
																  appart.status === 'Rented'
																? 'text-red-500'
																: ''
														}`}
													>
														{appart.status}
													</span>
												</p>
												<p className='text-md font-medium'>
													Area (m²): {appart.area}
												</p>
												<p className='text-md font-medium'>
													Price: ${appart.price}
												</p>
												<p className='font-medium text-sm'>
													Description: {appart.description}
												</p>
											</div>
											<div className='flex items-center justify-center'>
												<Swiper
													modules={[Navigation, Pagination]}
													spaceBetween={2}
													slidesPerView={1}
													navigation
													pagination={{ clickable: true }}
												>
													{appart.images.map((roomImg, index) => (
														<SwiperSlide key={index}>
															<div className='flex items-center justify-center'>
																<img
																	className='max-w-[300px] max-h-[200px]'
																	src={roomImg}
																	alt=''
																/>
															</div>
														</SwiperSlide>
													))}
												</Swiper>
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	)
}

export default BuildingPage
