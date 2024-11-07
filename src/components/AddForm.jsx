import React, { useReducer, useEffect, useMemo } from 'react'
import { db, storage } from '../firebase/firebaseConfig'
import { doc, setDoc, addDoc, collection } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

// Initial state for the form
const initialState = {
	typeBuilding: 'Choose', // Type of building, initialized to a default value
	buildingStatus: '', // Status of the building (e.g., For Sale, Under Construction)
	city: '', // City where the building is located
	address: '', // Address of the building
	image: null, // Image file for the building
	imagePreview: null, // Preview URL for building image
	apartments: 0, // Total number of apartments in the building
	numFloors: 1, // Number of floors in the building
	hauseRooms: 1, // Number of rooms in the house
	hauseArea: 0, // Area of the house in square meters
	parking: '', // Parking details
	price: 0, // Price of the building
	description: '', // Description of the building
	hauseImages: [], // Array to store multiple images of the house
	floors: [
		{
			floorNumber: 1, // Floor number
			numApartments: 1, // Number of apartments on this floor
			apartments: [
				{
					_id: '101', // Unique ID for the apartment
					type: 1, // Type of apartment (1-room, 2-room, etc.)
					area: 0, // Area of the apartment in square meters
					price: 0, // Price of the apartment
					status: '', // Status of the apartment (e.g., For Sale, Rent)
					description: '', // Description of the apartment
					images: [], // Array to store images of the apartment
					imagePreviews: [], // Array for preview URLs of apartment images
				},
			],
		},
	],
}

// Reducer function to handle all state changes in the form
const reducer = (state, action) => {
	switch (action.type) {
		case 'SET_FIELD':
			// Update a single field in the state
			return { ...state, [action.field]: action.value }
		case 'SET_FLOORS':
			// Update the entire floors array
			return { ...state, floors: action.value }
		case 'UPDATE_APARTMENTS':
			return {
				...state,
				floors: state.floors.map((floor, index) =>
					index === action.floorIndex
						? {
								...floor,
								apartments: floor.apartments.map((apartment, aptIndex) =>
									aptIndex === action.apartmentIndex
										? { ...apartment, [action.field]: action.value }
										: apartment
								),
						  }
						: floor
				),
			}
		case 'SET_BUILDING_IMAGE':
			// Set building image and preview
			return { ...state, image: action.value, imagePreview: action.preview }
		case 'SET_APARTMENT_IMAGES':
			return {
				...state,
				floors: state.floors.map((floor, index) =>
					index === action.floorIndex
						? {
								...floor,
								apartments: floor.apartments.map((apartment, aptIndex) =>
									aptIndex === action.apartmentIndex
										? {
												...apartment,
												images: action.value,
												imagePreviews: action.previews,
										  }
										: apartment
								),
						  }
						: floor
				),
			}
		case 'RESET_FORM':
			// Reset form to initial state
			return initialState
		default:
			return state
	}
}

const AddForm = () => {
	// Initialize state with reducer
	const [state, dispatch] = useReducer(reducer, initialState)

	useEffect(() => {
		// Log state changes for debugging
		console.log(state)
	}, [state])

	// Function to handle changes in form fields
	const handleChange = (field, value) => {
		dispatch({ type: 'SET_FIELD', field, value })
	}

	// Update typeBuilding field
	const handleTypeBuildingChange = e => {
		handleChange('typeBuilding', e.target.value)
	}

	// Handle the change in number of floors
	const handleFloorsChange = e => {
		// Parse input value as an integer
		const number = parseInt(e.target.value, 10)
		if (isNaN(number)) {
			// Log error for invalid input
			console.error('Invalid number:', number)
			return
		}

		// Create an array of floors based on the input number
		const newFloors = Array.from({ length: number }, (v, i) => ({
			floorNumber: i + 1,
			numApartments: 1,
			apartments: Array.from({ length: 1 }, (v, aptIndex) => ({
				// Generate unique ID for apartment
				_id: `${i + 1}_${(aptIndex + 1).toString().padStart(2, '0')}`,
				type: 1,
				area: 0,
				price: 0,
				status: '',
				description: '',
				images: [],
				imagePreviews: [],
			})),
		}))

		// Log the new floors array
		console.log('New Floors:', newFloors)
		// Update the number of floors in the state
		handleChange('numFloors', number)
		// Update floors array in state
		dispatch({ type: 'SET_FLOORS', value: newFloors })
	}

	// Function to handle changes in the number of apartments on each floor
	const handleApartmentsSelectChange = (e, floorIndex) => {
		const number = parseInt(e.target.value, 10)
		if (isNaN(number)) {
			// Log error for invalid input
			console.error('Invalid number:', number)
			return
		}

		// Update the apartments array on the specified floor
		const updatedFloors = state.floors.map((floor, index) =>
			index === floorIndex
				? {
						...floor,
						numApartments: number,
						apartments: Array.from({ length: number }, (v, aptIndex) => ({
							_id: `${floor.floorNumber}_${(aptIndex + 1)
								.toString()
								.padStart(2, '0')}`, // Generate unique ID for each apartment
							type: 1,
							area: 0,
							price: 0,
							status: '',
							description: '',
							images: [],
							imagePreviews: [],
						})),
				  }
				: floor
		)

		// Log the updated floors array
		console.log('Updated Floors:', updatedFloors)
		// Dispatch the updated floors array
		dispatch({ type: 'SET_FLOORS', value: updatedFloors })
	}

	// Handle change in apartment details
	const handleApartmentChange = (e, floorIndex, apartmentIndex, field) => {
		// Get image files if the field is images
		const value =
			field === 'images' ? Array.from(e.target.files) : e.target.value
		dispatch({
			type: 'UPDATE_APARTMENTS',
			floorIndex,
			apartmentIndex,
			field,
			value,
		})
	}

	// Handle building image upload
	const handleBuildingImageChange = e => {
		const image = e.target.files[0]
		// Create preview URL for the image
		const preview = URL.createObjectURL(image)
		// Dispatch action to update building image
		dispatch({ type: 'SET_BUILDING_IMAGE', value: image, preview })
	}

	// Handle multiple house images upload
	const handleHauseImagesChange = e => {
		const images = Array.from(e.target.files)
		// Generate preview URLs
		const previews = images.map(image => URL.createObjectURL(image))
		handleChange('hauseImages', images)
		// Update previews in state
		dispatch({ type: 'SET_FIELD', field: 'imagePreviews', value: previews })
	}

	// Handle apartment images upload
	const handleApartmentImagesChange = (e, floorIndex, apartmentIndex) => {
		const images = Array.from(e.target.files)
		const previews = images.map(image => URL.createObjectURL(image))
		dispatch({
			type: 'SET_APARTMENT_IMAGES',
			floorIndex,
			apartmentIndex,
			value: images,
			previews,
		})
	}

	// Memoized list of floors to avoid re-rendering
	const memoizedFloors = useMemo(() => {
		return state.floors.map((floor, floorIndex) => (
			<div
				key={floorIndex}
				className='border-2 border-zinc-500 p-4 rounded-lg mb-4'
			>
				<h3 className='text-lg text-zinc-600 font-medium mb-4'>
					Floor {floor.floorNumber}
				</h3>
				<div className='flex flex-row items-center gap-3'>
					<label className='text-md text-zinc-600 font-medium'>
						Number of Apartments:
					</label>
					<input
						className='hover:border hover:border-zinc-500 hover:rounded cursor-pointer'
						type='number'
						value={floor.numApartments}
						onChange={e => handleApartmentsSelectChange(e, floorIndex)}
					/>
				</div>
				{floor.apartments.map((apartment, apartmentIndex) => (
					<div
						key={apartmentIndex}
						className='flex flex-col items-start gap-3 mt-5 border border-zinc-400 rounded p-4'
					>
						<h4 className='text-md text-zinc-600 font-medium'>
							Apartment {apartmentIndex + 1}
						</h4>
						<div className='flex flex-row flex-wrap items-center gap-10'>
							<div className='flex flex-row items-center gap-3'>
								<label className='text-md text-zinc-600 font-medium'>
									Type:
								</label>
								<select
									className='hover:border hover:border-zinc-500 hover:rounded cursor-pointer'
									value={apartment.type}
									onChange={e =>
										handleApartmentChange(e, floorIndex, apartmentIndex, 'type')
									}
								>
									<option value={1}>1-room</option>
									<option value={2}>2-room</option>
									<option value={3}>3-room</option>
									<option value={4}>4-room</option>
									<option value={5}>5-room</option>
									<option value={6}>6-room</option>
									<option value={7}>7-room</option>
									<option value={8}>8-room</option>
								</select>
							</div>
							<div className='flex flex-row items-center gap-3'>
								<label className='text-md text-zinc-600 font-medium'>
									Area (m²):
								</label>
								<input
									className='w-[100px] hover:border hover:border-zinc-500 hover:rounded cursor-pointer'
									type='number'
									value={apartment.area}
									onChange={e =>
										handleApartmentChange(e, floorIndex, apartmentIndex, 'area')
									}
								/>
							</div>
							<div className='flex flex-row items-center gap-3'>
								<label className='text-md text-zinc-600 font-medium'>
									Status:
								</label>
								<select
									className='hover:border hover:border-zinc-500 hover:rounded cursor-pointer'
									value={apartment.status}
									onChange={e =>
										handleApartmentChange(
											e,
											floorIndex,
											apartmentIndex,
											'status'
										)
									}
								>
									<option value=''>Any</option>
									<option value='For Sale'>For Sale</option>
									<option value='Rent'>Rent</option>
									<option value='Sold'>Sold</option>
									<option value='Rented'>Rented</option>
								</select>
							</div>
							<div className='flex flex-row items-center gap-3'>
								<label className='text-md text-zinc-600 font-medium'>
									Price ($):
								</label>
								<input
									className='hover:border hover:border-zinc-500 hover:rounded cursor-pointer'
									type='number'
									value={apartment.price}
									onChange={e =>
										handleApartmentChange(
											e,
											floorIndex,
											apartmentIndex,
											'price'
										)
									}
								/>
							</div>
						</div>
						<div className='flex flex-row items-start gap-3'>
							<label className='text-md text-zinc-600 font-medium'>
								Description:
							</label>
							<textarea
								className='border border-zinc-300 rounded cursor-pointer resize-none'
								rows={3}
								value={apartment.description}
								onChange={e =>
									handleApartmentChange(
										e,
										floorIndex,
										apartmentIndex,
										'description'
									)
								}
							/>
						</div>
						<div className='flex flex-col md:flex-row items-start gap-3'>
							<label className='text-md text-zinc-600 font-medium'>
								Upload Apartment Images:
							</label>
							<input
								type='file'
								multiple
								onChange={e =>
									handleApartmentImagesChange(e, floorIndex, apartmentIndex)
								}
							/>
						</div>
						<div className='flex'>
							{apartment.imagePreviews.map((preview, index) => (
								<img
									key={index}
									src={preview}
									alt={`Apartment ${apartmentIndex + 1}`}
									className='h-20 w-20 object-cover rounded mr-2'
								/>
							))}
						</div>
					</div>
				))}
			</div>
		))
	}, [state.floors])

	// ####################################################################################################
	// Code for form submission to the database
	const handleSubmit = async e => {
		// Prevent default form submission behavio
		e.preventDefault()

		try {
			// Add document to Firestore to get document ID
			const docRef = await addDoc(collection(db, 'buildings'), {
				typeBuilding: state.typeBuilding,
			})

			// Upload the main building image
			let buildingImageUrl = ''
			if (state.image) {
				const buildingImageRef = ref(
					storage,
					`buildings/${state.address}/${state.image.name}`
				)
				await uploadBytes(buildingImageRef, state.image)
				buildingImageUrl = await getDownloadURL(buildingImageRef)
			}

			
			let hauseImagesUrls = []
			if (state.hauseImages && state.hauseImages.length > 0) {
				hauseImagesUrls = await Promise.all(
					state.hauseImages.map(async image => {
						const hauseImageRef = ref(
							storage,
							`houses/${state.address}/${image.name}`
						)
						await uploadBytes(hauseImageRef, image)
						return await getDownloadURL(hauseImageRef)
					})
				)
			}

			
			const updatedFloors = await Promise.all(
				state.floors.map(async floor => {
					const updatedApartments = await Promise.all(
						floor.apartments.map(async apartment => {
							let apartmentImagesUrls = []
							if (apartment.images && apartment.images.length > 0) {
								apartmentImagesUrls = await Promise.all(
									apartment.images.map(async image => {
										const apartmentImageRef = ref(
											storage,
											`apartments/${docRef.id}/${floor.floorNumber}/${apartment._id}/${image.name}`
										)
										await uploadBytes(apartmentImageRef, image)
										return await getDownloadURL(apartmentImageRef)
									})
								)
							}

							// Создание объекта квартиры с URL изображений
							return {
								...apartment,
								images: apartmentImagesUrls, // только ссылки на изображения
							}
						})
					)
					return { ...floor, apartments: updatedApartments }
				})
			)

			// Обновленный объект buildingData только с URL-адресами изображений
			const buildingData = {
				typeBuilding: state.typeBuilding,
				buildingStatus: state.buildingStatus,
				city: state.city,
				address: state.address,
				parking: state.parking,
				apartments: state.apartments,
				hauseRooms: state.hauseRooms,
				hauseArea: state.hauseArea,
				price: state.price,
				numFloors: state.numFloors,
				description: state.description,
				image: buildingImageUrl, 
				hauseImages: hauseImagesUrls, 
				floors: updatedFloors, 
				createdAt: new Date(),
			}

			
			await setDoc(doc(db, 'buildings', docRef.id), buildingData, {
				merge: true,
			})

			// reset state of form
			dispatch({ type: 'RESET_FORM' })

			console.log('Данные здания успешно сохранены и форма сброшена!')
		} catch (error) {
			console.error('Ошибка при сохранении данных: ', error)
		}
	}

	// ##############################################################################################################################

	return (
		<div className='border-2 border-primary rounded p-4'>
			<div className='flex flex-row items-center gap-3'>
				{/* Поле выбора типа здания */}
				<label className='text-lg text-zinc-600 font-medium'>
					Type Building:
				</label>
				<select
					className='hover:border hover:border-zinc-400 hover:rounded cursor-pointer'
					value={state.typeBuilding}
					onChange={handleTypeBuildingChange}
				>
					<option value='Choose'>Choose</option>
					<option value='Building'>Building</option>
					<option value='House'>House</option>
				</select>
			</div>
			
			{state.typeBuilding !== 'Choose' && (
				<form className='flex flex-col gap-4 mt-4' onSubmit={handleSubmit}>
					<div>
						{state.typeBuilding === 'Building' ? (
							<div className='flex flex-col gap-4'>
								<div className='flex flex-row items-center gap-3'>
									<label className='text-lg text-zinc-600 font-medium'>
										Building status:
									</label>
									<select
										className='hover:border hover:border-zinc-400 hover:rounded cursor-pointer'
										value={state.buildingStatus}
										onChange={e =>
											handleChange('buildingStatus', e.target.value)
										}
									>
										<option value=''>Any</option>
										<option value='For Sale'>For Sale</option>
										<option value='Rent'>Rent</option>
										<option value='Sold'>Sold</option>
										<option value='Rented'>Rented</option>
									</select>
								</div>
								<div className='flex flex-row items-center gap-3'>
									<label className='text-lg text-zinc-600 font-medium'>
										City:
									</label>
									<input
										className='hover:border hover:border-zinc-400 hover:rounded cursor-pointer'
										type='text'
										value={state.city}
										onChange={e => handleChange('city', e.target.value)}
										placeholder='City'
									/>
								</div>
								<div className='flex flex-row items-center gap-3'>
									<label className='text-lg text-zinc-600 font-medium'>
										Address:
									</label>
									<input
										className='hover:border hover:border-zinc-400 hover:rounded cursor-pointer'
										type='text'
										value={state.address}
										onChange={e => handleChange('address', e.target.value)}
										placeholder='Address'
									/>
								</div>
								<div className='flex flex-row items-center gap-3'>
									<label className='text-lg text-zinc-600 font-medium'>
										Upload Building Image:
									</label>
									<input type='file' onChange={handleBuildingImageChange} />
									{state.imagePreview && (
										<img
											src={state.imagePreview}
											alt='Building Preview'
											width='200'
											className='mt-2'
										/>
									)}
								</div>
								<div className='flex flex-row items-center gap-3'>
									<label className='text-lg text-zinc-600 font-medium'>
										Apartments:
									</label>
									<input
										className='hover:border hover:border-zinc-400 hover:rounded cursor-pointer'
										type='number'
										value={state.apartments}
										onChange={e =>
											handleChange('apartments', Number(e.target.value))
										}
									/>
								</div>
								<div className='flex flex-row items-center gap-3'>
									<label className='text-lg text-zinc-600 font-medium'>
										Parking:
									</label>
									<select
										className='hover:border hover:border-zinc-400 hover:rounded cursor-pointer'
										value={state.parking}
										onChange={e => handleChange('parking', e.target.value)}
									>
										<option value=''>Any</option>
										<option value='Underground parking'>
											Underground parking
										</option>
										<option value='Garage'>Garage</option>
										<option value='Street parking'>Street parking</option>
										<option value='None'>None</option>
									</select>
								</div>
								<div className='flex flex-row items-center gap-3'>
									<label className='text-lg text-zinc-600 font-medium'>
										Enter Number of Floors:
									</label>
									<input
										className='hover:border hover:border-zinc-400 hover:rounded cursor-pointer'
										type='number'
										value={state.numFloors}
										onChange={handleFloorsChange}
										min='1'
									/>
								</div>
								{memoizedFloors}
							</div>
						) : (
							<div className='flex flex-col gap-4'>
								{/* form for house */}
								<div className='flex flex-row items-center gap-3'>
									<label className='text-lg text-zinc-600 font-medium'>
										Building status:
									</label>
									<select
										className='hover:border hover:border-zinc-400 hover:rounded cursor-pointer'
										value={state.buildingStatus}
										onChange={e =>
											handleChange('buildingStatus', e.target.value)
										}
									>
										<option value=''>Any</option>
										<option value='For Sale'>For Sale</option>
										<option value='Rent'>Rent</option>
										<option value='Sold'>Sold</option>
										<option value='Rented'>Rented</option>
									</select>
								</div>
								<div className='flex flex-row items-center gap-3'>
									<label className='text-lg text-zinc-600 font-medium'>
										City:
									</label>
									<input
										className='hover:border hover:border-zinc-400 hover:rounded cursor-pointer'
										type='text'
										value={state.city}
										onChange={e => handleChange('city', e.target.value)}
										placeholder='City'
									/>
								</div>
								<div className='flex flex-row items-center gap-3'>
									<label className='text-lg text-zinc-600 font-medium'>
										Address:
									</label>
									<input
										className='hover:border hover:border-zinc-400 hover:rounded cursor-pointer'
										type='text'
										value={state.address}
										onChange={e => handleChange('address', e.target.value)}
										placeholder='Address'
									/>
								</div>

								<div className='flex flex-row items-center gap-3'>
									<label className='text-lg text-zinc-600 font-medium'>
										Upload house Image:
									</label>
									<input type='file' onChange={handleBuildingImageChange} />
									{state.imagePreview && (
										<img
											src={state.imagePreview}
											alt='Building Preview'
											width='200'
											className='mt-2'
										/>
									)}
								</div>

								<div className='flex flex-row items-center gap-3'>
									<label className='text-lg text-zinc-600 font-medium'>
										Parking:
									</label>
									<select
										className='hover:border hover:border-zinc-400 hover:rounded cursor-pointer'
										value={state.parking}
										onChange={e => handleChange('parking', e.target.value)}
									>
										<option value=''>Any</option>
										<option value='Underground parking'>
											Underground parking
										</option>
										<option value='Garage'>Garage</option>
										<option value='Street parking'>Street parking</option>
										<option value='None'>None</option>
									</select>
								</div>
								<div className='flex flex-row items-center gap-3'>
									<label className='text-lg text-zinc-600 font-medium'>
										Rooms:
									</label>
									<input
										className='w-[100px] hover:border hover:border-zinc-400 hover:rounded cursor-pointer'
										type='number'
										value={state.hauseRooms}
										onChange={e =>
											handleChange('hauseRooms', Number(e.target.value))
										}
									/>
								</div>

								<div className='flex flex-row items-center gap-3'>
									<label className='text-lg text-zinc-600 font-medium'>
										Area (m²):
									</label>
									<input
										className='w-[100px] hover:border hover:border-zinc-400 hover:rounded cursor-pointer'
										type='number'
										value={state.hauseArea}
										onChange={e =>
											handleChange('hauseArea', Number(e.target.value))
										}
									/>
								</div>

								<div className='flex flex-row items-center gap-3'>
									<label className='text-lg text-zinc-600 font-medium'>
										Price ($):
									</label>
									<input
										className='hover:border hover:border-zinc-400 hover:rounded cursor-pointer'
										type='number'
										value={state.price}
										onChange={e =>
											handleChange('price', Number(e.target.value))
										}
									/>
								</div>

								<div className='flex flex-row items-center gap-3'>
									<label className='text-lg text-zinc-600 font-medium'>
										Description:
									</label>
									<textarea
										className='border border-zinc-500 rounded cursor-pointer resize-none'
										rows={3}
										value={state.description}
										onChange={e => handleChange('description', e.target.value)}
									></textarea>
								</div>

								<div className='flex flex-row items-center gap-3'>
									<label className='text-lg text-zinc-600 font-medium'>
										Upload rooms Images:
									</label>
									<input
										type='file'
										multiple
										onChange={handleHauseImagesChange}
									/>
									{state.imagePreviews?.length > 0 && (
										<div className='flex gap-2 mt-2'>
											{state.imagePreviews.map((preview, i) => (
												<img
													key={i}
													src={preview}
													alt={`Building Preview ${i + 1}`}
													width='100'
												/>
											))}
										</div>
									)}
								</div>
							</div>
						)}
					</div>

					<button
						className='w-[180px] h-[50px] rounded bg-blue-500 text-white text-lg font-medium mt-5'
						type='submit'
					>
						Submit
					</button>
				</form>
			)}
		</div>
	)
}

export default AddForm
