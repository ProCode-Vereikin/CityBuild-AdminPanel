import React, { useEffect, useState } from 'react'
import { collection, deleteDoc, getDocs, doc } from 'firebase/firestore'
import { db } from '../firebase/firebaseConfig'
import { Link, useNavigate } from 'react-router-dom'
import ReactPaginate from 'react-paginate'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Filter from './Filter'
import {
	faEye,
	faLeftLong,
	faPenToSquare,
	faRightLong,
	faTrash,
} from '@fortawesome/free-solid-svg-icons'

const ViewCard = () => {
	// Array of buildings data
	const [buildings, setBuildings] = useState([])
	// Loading indicator
	const [loading, setLoading] = useState(true)
	// Current page for pagination
	const [currentPage, setCurrentPage] = useState(0)
	// Filter criteria for buildings
	const [filters, setFilters] = useState({
		type: '',
		status: '',
		city: '',
		address: '',
		areaFrom: 0,
		areaTo: 0,
		priceFrom: 0,
		priceTo: 0,
		parking: '',
	})
	// Modal for delete confirmation
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
	// Selected building for deletion
	const [buildingToDelete, setBuildingToDelete] = useState(null)
	// Number of items per page for pagination
	const itemsPerPage = 10
	const navigate = useNavigate()

	// Fetch buildings data from Firestore
	useEffect(() => {
		const fetchBuildings = async () => {
			try {
				console.log('Fetching buildings data...')
				const querySnapshot = await getDocs(collection(db, 'buildings'))

				// Check if the collection has any documents
				if (querySnapshot.empty) {
					console.log('No buildings found in Firestore.')
					setLoading(false)
					return
				}

				const buildingsArray = querySnapshot.docs.map(doc => ({
					id: doc.id,
					...doc.data(),
				}))

				// Log data for verification
				console.log('Buildings data:', buildingsArray)

				setBuildings(buildingsArray)
			} catch (error) {
				console.error('Error fetching buildings data:', error)
			} finally {
				// Set loading to false after fetching data
				setLoading(false)
			}
		}

		fetchBuildings()
	}, [])

	// Handle delete button click to open confirmation modal
	const handleDeleteClick = building => {
		setBuildingToDelete(building)
		setIsDeleteModalOpen(true)
	}

	// Confirm deletion of a building
	const confirmDelete = async () => {
		try {
			if (buildingToDelete) {
				await deleteDoc(doc(db, 'buildings', buildingToDelete.id))
				setBuildings(buildings.filter(b => b.id !== buildingToDelete.id))
				// Close delete modal
				setIsDeleteModalOpen(false)
				// Clear selected building
				setBuildingToDelete(null)
			}
		} catch (error) {
			console.log('Error deleted document:', error)
		}
	}

	// Cancel deletion and close modal
	const cancelDelete = () => {
		setIsDeleteModalOpen(false)
		setBuildingToDelete(null)
	}

	// Filter function to match buildings based on filter criteria
	const isMatch = (building, filter) => {
		const {
			type,
			status,
			city,
			address,
			areaFrom,
			areaTo,
			priceFrom,
			priceTo,
			parking,
		} = filter

		return (
			(!type || building.typeBuilding === type) &&
			(!status || building.buildingStatus === status) &&
			(!city || building.city.toLowerCase().includes(city.toLowerCase())) &&
			(!address ||
				building.address.toLowerCase().includes(address.toLowerCase())) &&
			(!areaFrom || building.hauseArea >= areaFrom) &&
			(!areaTo || building.hauseArea <= areaTo) &&
			(!priceFrom || building.price >= priceFrom) &&
			(!priceTo || building.price <= priceTo) &&
			(!parking || building.parking === parking)
		)
	}

	// Filter buildings based on user-selected criteria
	const filteredBuildings = buildings.filter(building =>
		isMatch(building, filters)
	)

	// Check if loading or no data is present
	if (loading) {
		return <div>Loading...</div>
	}

	if (!Array.isArray(buildings) || buildings.length === 0) {
		return <div>No buildings found.</div>
	}

	// Logic to display buildings on the current page
	const offset = currentPage * itemsPerPage
	const currentBuildings = filteredBuildings.slice(
		offset,
		offset + itemsPerPage
	)

	// Handle page change for pagination
	const handlePageClick = event => {
		setCurrentPage(event.selected)
	}

	// Navigate to the editing page with selected building data
	const handleEdit = building => {
		navigate('/editing', { state: { building } })
	}

	return (
		<div className='flex flex-col w-full'>
			{/* modal window */}
			{isDeleteModalOpen && (
				<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center'>
					<div className='bg-primary p-8 rounded shadow-md'>
						<p className='text-white font-medium text-lg'>
							Are you sure you want to delete the building?
						</p>
						<div className='flex justify-between mt-5'>
							<button
								onClick={confirmDelete}
								className='w-[150px] px-4 py-2 bg-red-500 text-white rounded'
							>
								Yes
							</button>
							<button
								onClick={cancelDelete}
								className='w-[150px] px-4 py-2 bg-green-500 text-white rounded'
							>
								No
							</button>
						</div>
					</div>
				</div>
			)}

			<div className='flex flex-col lg:grid lg:grid-cols-[1fr_4fr] gap-3'>
				<Filter filters={filters} setFilters={setFilters} />
				<div className='w-full grid grid-cols-auto gap-4 gap-y-6'>
					{/* currentBuildings */}
					{currentBuildings.map(building => {
						let forSaleCount = 0
						let soldCount = 0
						let rentCount = 0
						let rentedCount = 0
						let floorCount = 0

						if (building.floors && Array.isArray(building.floors)) {
							building.floors.forEach(floor => {
								floorCount++
								if (floor.apartments && Array.isArray(floor.apartments)) {
									floor.apartments.forEach(apartment => {
										if (apartment.status === 'For Sale') {
											forSaleCount++
										} else if (apartment.status === 'Sold') {
											soldCount++
										} else if (apartment.status === 'Rent') {
											rentCount++
										} else if (apartment.status === 'Rented') {
											rentedCount++
										}
									})
								}
							})
						}

						return (
							<div
								key={building.id}
								className='py-1.5 px-1.5 border border-primary rounded'
							>
								{building.typeBuilding === 'Building' ? (
									<div className='flex flex-col flex-wrap items-start gap-5'>
										{/* ########################  Card for Building  ######################## */}
										{/* Main Building Image */}
										<div className='flex flex-col gap-5'>
											{building.image && (
												<div className='w-full flex items-center justify-center'>
													<img
														src={building.image}
														alt='Building'
														className='rounded'
													/>
												</div>
											)}
											<div className='flex flex-col flex-wrap items-start'>
												<p className='text-md'>Type: {building.typeBuilding}</p>
												<p className='text-md'>City: {building.city}</p>
												<p className='text-md'>Address: {building.address}</p>
												<p className='text-md'>
													Status:{' '}
													<span
														className={`${
															building.buildingStatus === 'For Sale' ||
															building.buildingStatus === 'Rent'
																? 'text-green-500'
																: building.buildingStatus === 'Sold' ||
																  building.buildingStatus === 'Rented'
																? 'text-red-500'
																: ''
														}`}
													>
														{building.buildingStatus}
													</span>
												</p>
												<p className='text-md'>
													Number of Floors: {floorCount}
												</p>
												<p className='text-md'>
													Number of Apartments: {building.apartments}
												</p>
												<p className='text-md'>Parking: {building.parking}</p>

												{building.buildingStatus === 'For Sale' ? (
													<div>
														<p className='text-md'>
															Apartment for sale:{' '}
															<span className='text-green-400'>
																{forSaleCount}
															</span>
														</p>
														<p className='text-md'>
															Apartment sold:{' '}
															<span className='text-red-500'>{soldCount}</span>
														</p>
													</div>
												) : (
													''
												)}

												{building.buildingStatus === 'Rent' ? (
													<div>
														<p className='text-md'>
															Apartment for rent:{' '}
															<span className='text-green-500'>
																{rentCount}
															</span>
														</p>
														<p className='text-md'>
															Apartment rented:{' '}
															<span className='text-red-500'>
																{rentedCount}
															</span>
														</p>
													</div>
												) : (
													''
												)}
											</div>
										</div>
										<div className='w-full flex flex-row items-center justify-around'>
											<Link to={`/building/${building.id}`}>
												<button
													className='w-[50px] h-[50px] bg-blue-500 text-white rounded flex items-center justify-center'
													title='View'
												>
													<FontAwesomeIcon icon={faEye} />
												</button>
											</Link>

											<button
												className='w-[50px] h-[50px] bg-blue-500 text-white rounded flex items-center justify-center'
												title='Edit'
												onClick={() => handleEdit(building)}
											>
												<FontAwesomeIcon icon={faPenToSquare} />
											</button>
											<button
												className='w-[50px] h-[50px] bg-red-500 text-white rounded flex items-center justify-center'
												title='Delete'
												onClick={() => handleDeleteClick(building)}
											>
												<FontAwesomeIcon icon={faTrash} />
											</button>
										</div>
									</div>
								) : (
									<div className='flex flex-col flex-wrap items-start gap-5'>
										{/* ########################  Card for House  ######################## */}
										{/* Main House Image */}
										<div className='flex flex-col gap-5'>
											{building.image && (
												<div>
													<img
														src={building.image}
														alt='Building'
														className='rounded'
													/>
												</div>
											)}

											<div className='flex flex-col flex-wrap items-start'>
												<p className='text-md'>Type: {building.typeBuilding}</p>
												<p className='text-md'>City: {building.city}</p>
												<p className='text-md'>Address: {building.address}</p>
												<p className='text-md'>
													Status:{' '}
													<span
														className={`${
															building.buildingStatus === 'For Sale' ||
															building.buildingStatus === 'Rent'
																? 'text-green-500'
																: building.buildingStatus === 'Sold' ||
																  building.buildingStatus === 'Rented'
																? 'text-red-500'
																: 'text-gray-500'
														}`}
													>
														{building.buildingStatus}
													</span>
												</p>
												<p className='text-md'>Rooms: {building.hauseRooms}</p>
												<p className='text-md'>
													Area (m²): {building.hauseArea}
												</p>
												<p className='text-md'>Parking: {building.parking}</p>
												<p className='text-md'>Price: ${building.price}</p>
												<br />
											</div>
										</div>
										<div className='w-full flex flex-row items-center justify-around'>
											<Link to={`/house/${building.id}`}>
												<button
													className='w-[50px] h-[50px] bg-blue-500 text-white rounded flex items-center justify-center'
													title='View'
												>
													<FontAwesomeIcon icon={faEye} />
												</button>
											</Link>
											<button
												className='w-[50px] h-[50px] bg-blue-500 text-white rounded flex items-center justify-center'
												title='Edit'
												onClick={() => handleEdit(building)}
											>
												<FontAwesomeIcon icon={faPenToSquare} />
											</button>
											<button
												className='w-[50px] h-[50px] bg-red-500 text-white rounded flex items-center justify-center'
												title='Delete'
												onClick={() => handleDeleteClick(building)}
											>
												<FontAwesomeIcon icon={faTrash} />
											</button>
										</div>
									</div>
								)}
							</div>
						)
					})}
				</div>
			</div>
			<div className='flex items-center justify-center mt-2'>
				<ReactPaginate
					previousLabel={<FontAwesomeIcon icon={faLeftLong} />}
					nextLabel={<FontAwesomeIcon icon={faRightLong} />}
					breakLabel={'...'}
					breakClassName={'break-me'}
					pageCount={Math.ceil(filteredBuildings.length / itemsPerPage)}
					marginPagesDisplayed={2}
					pageRangeDisplayed={5}
					onPageChange={handlePageClick}
					containerClassName={'pagination'}
					activeClassName={'active'}
					className='flex gap-7 mt-8 mb-8'
				/>
			</div>
		</div>
	)
}

export default ViewCard
