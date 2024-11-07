import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { storage, db } from '../firebase/firebaseConfig' // Убедитесь, что этот путь правильный
import {
	ref,
	deleteObject,
	listAll,
	uploadBytesResumable,
	getDownloadURL,
} from 'firebase/storage'
import { doc, updateDoc } from 'firebase/firestore'

const EditBuildings = () => {
	// Retrieve building data from the previous page (via location state)
	const location = useLocation()
	// Get building object if exists
	const { building } = location.state || {}
	// Local state to manage building data
	const [buildingData, setBuildingData] = useState(building || {})
	// Local state to manage image file
	const [image, setImage] = useState(null)
	// Track upload progress
	const [uploadProgress, setUploadProgress] = useState(0)
	// Navigation hook to redirect after updating
	const navigate = useNavigate()

	// Function to update regular fields in the building data
	const handleInputChange = e => {
		const { name, value } = e.target
		// Update specific field in building data
		setBuildingData(prevState => ({
			...prevState,
			[name]: value,
		}))
	}

	// Function to update nested data (e.g., apartments within floors)
	const handleNestedInputChange = (
		floorIndex,
		apartmentIndex,
		field,
		value
	) => {
		// Create a copy of floors data to mutate
		const updatedFloors = [...buildingData.floors]
		updatedFloors[floorIndex].apartments[apartmentIndex][field] = value
		setBuildingData({ ...buildingData, floors: updatedFloors })
	}

	// Function to handle image file selection
	const handleImageUpload = e => {
		const selectedImage = e.target.files[0]
		// Store selected image in state
		setImage(selectedImage)
	}

	// Function to handle form submission, including image upload
	const handleSubmit = async e => {
		// Prevent default form submission
		e.preventDefault()
		try {
			// If an image is selected, upload it to Firebase Storage
			if (image) {
				// Delete the old image folder first
				const oldFolderRef = ref(storage, `buildings/${buildingData.address}/`)
				// Function to delete old folder
				await deleteFolder(oldFolderRef)

				// Upload the new image to Firebase Storage
				const storageRef = ref(
					storage,
					`buildings/${buildingData.address}/${image.name}`
				)
				const uploadTask = uploadBytesResumable(storageRef, image)

				// Track upload progress
				uploadTask.on(
					'state_changed',
					snapshot => {
						const progress =
							(snapshot.bytesTransferred / snapshot.totalBytes) * 100
						// Update progress
						setUploadProgress(progress)
					},
					error => {
						// Handle upload error
						console.error('Error uploading image:', error)
					},
					async () => {
						// Once upload is complete, get the image URL
						const imageUrl = await getDownloadURL(uploadTask.snapshot.ref)
						console.log('Image uploaded successfully:', imageUrl)

						// Update the Firestore document with the new image URL
						const buildingRef = doc(db, 'buildings', buildingData.id)
						await updateDoc(buildingRef, {
							...buildingData,
							image: imageUrl,
						})
						console.log('Building updated successfully')
						// Navigate back to home or other page
						navigate('/')
					}
				)
			} else {
				// If no image is selected, update only other fields
				const buildingRef = doc(db, 'buildings', buildingData.id)
				// Update without changing image
				await updateDoc(buildingRef, buildingData)
				console.log('Building updated successfully')
				// Navigate after update
				navigate('/')
			}
		} catch (error) {
			// Log error if updating fails
			console.error('Error updating building:', error)
		}
	}

	// Function to delete old folder and images from Firebase Storage
	const deleteFolder = async folderRef => {
		// Get all items in the folder
		const list = await listAll(folderRef)
		// Delete all items
		const deletePromises = list.items.map(item => deleteObject(item))
		// Ensure all items are deleted
		await Promise.all(deletePromises)
		console.log('Old folder deleted successfully')
	}

	return (
		<div className='mx-1 sm:mx-[3%]'>
			<h1 className='text-xl font-bold my-4'>Editing of a Building</h1>
			<form
				className='border-2 border-primary p-4 rounded'
				onSubmit={handleSubmit}
			>
				{buildingData.typeBuilding === 'Building' ? (
					<div className='flex flex-col items-start gap-5'>
						<div>
							<p className='text-lg font-medium'>{buildingData.typeBuilding}</p>
						</div>

						<div className='flex flex-row items-center gap-3'>
							<label
								htmlFor='city'
								className='text-lg text-zinc-600 font-medium'
							>
								City:
							</label>
							<input
								type='text'
								name='city'
								value={buildingData.city}
								onChange={handleInputChange}
								className='hover:border hover:border-zinc-400 hover:rounded cursor-pointer'
							/>
						</div>

						<div className='flex flex-row items-center gap-3'>
							<label
								htmlFor='address'
								className='text-lg text-zinc-600 font-medium'
							>
								Address
							</label>
							<input
								type='text'
								name='address'
								value={buildingData.address}
								onChange={handleInputChange}
								className='hover:border hover:border-zinc-400 hover:rounded cursor-pointer'
							/>
						</div>

						{/* Загрузка изображения */}
						<div className='flex flex-col md:flex-row items-center gap-3'>
							<label
								htmlFor='imageUpload'
								className='text-lg text-zinc-600 font-medium'
							>
								Upload Image:
							</label>
							<input
								type='file'
								onChange={handleImageUpload}
								className='mt-1 block w-full'
							/>
							{uploadProgress > 0 && (
								<div className='mt-2'>
									<progress value={uploadProgress} max='100'>
										{uploadProgress}%
									</progress>
								</div>
							)}
							{buildingData.imageUrl && (
								<div className='mt-4'>
									<img
										src={buildingData.imageUrl}
										alt='Building'
										className='w-32 h-32 object-cover'
									/>
								</div>
							)}
						</div>

						<div className='flex flex-col md:flex-row items-center gap-3'>
							<label
								htmlFor='description'
								className='text-lg text-zinc-600 font-medium'
							>
								Description:
							</label>
							<textarea
								name='description'
								value={buildingData.description}
								onChange={handleInputChange}
								className='border border-zinc-500 rounded cursor-pointer resize-none'
								rows={3}
							/>
						</div>

						{/* Поля вложенных данных (например, квартиры на этажах) */}
						{buildingData.floors &&
							buildingData.floors.map((floor, floorIndex) => (
								<div
									key={floorIndex}
									className='border-2 border-zinc-500 p-4 rounded-lg mb-4 w-full'
								>
									<div className='flex flex-col items-start'>
										<h2 className='text-lg text-zinc-600 font-medium mb-4'>
											Floor {floor.floorNumber}
										</h2>
										{floor.apartments.map((apartment, apartmentIndex) => (
											<div
												key={apartmentIndex}
												className='flex flex-row flex-wrap items-start gap-5 mt-5 border border-zinc-400 rounded p-4 w-full'
											>
												<div className='flex flex-row items-center gap-3'>
													<label
														htmlFor={`apartment-${apartmentIndex}`}
														className='text-md text-zinc-600 font-medium'
													>
														Apartment {apartment.type}-room
													</label>
													<input
														type='number'
														value={apartment.type}
														onChange={e =>
															handleNestedInputChange(
																floorIndex,
																apartmentIndex,
																'type',
																e.target.value
															)
														}
														className='w-[50px] hover:border hover:border-zinc-500 hover:rounded cursor-pointer'
													/>
												</div>
												<div className='flex flex-row items-center gap-3'>
													<label
														htmlFor={`apartment-price-${apartmentIndex}`}
														className='text-md text-zinc-600 font-medium'
													>
														Price:
													</label>
													<input
														type='number'
														value={apartment.price}
														onChange={e =>
															handleNestedInputChange(
																floorIndex,
																apartmentIndex,
																'price',
																e.target.value
															)
														}
														className='w-[80px] hover:border hover:border-zinc-500 hover:rounded cursor-pointer'
													/>
												</div>
												<div className='flex flex-row items-center gap-3'>
													<label
														htmlFor={`apartment-area-${apartmentIndex}`}
														className='text-md text-zinc-600 font-medium'
													>
														Area (m²):
													</label>
													<input
														type='number'
														value={apartment.area}
														onChange={e =>
															handleNestedInputChange(
																floorIndex,
																apartmentIndex,
																'area',
																e.target.value
															)
														}
														className='w-[50px] hover:border hover:border-zinc-500 hover:rounded cursor-pointer'
													/>
												</div>
												<div className='flex flex-row items-center gap-3'>
													<label
														htmlFor={`apartment-status-${apartmentIndex}`}
														className='text-md text-zinc-600 font-medium'
													>
														Status:
													</label>
													<select
														className='hover:border hover:border-zinc-500 hover:rounded cursor-pointer'
														value={apartment.status}
														onChange={e =>
															handleNestedInputChange(
																floorIndex,
																apartmentIndex,
																'status',
																e.target.value
															)
														}
													>
														<option value='For Sale'>For Sale</option>
														<option value='Rent'>Rent</option>
														<option value='Sold'>Sold</option>
														<option value='Rented'>Rented</option>
													</select>
												</div>
												<div className='flex flex-row items-start gap-3'>
													<label
														htmlFor={`apartment-description-${apartmentIndex}`}
														className='text-md text-zinc-600 font-medium'
													>
														Description:
													</label>
													<textarea
														className='border border-zinc-300 rounded cursor-pointer resize-none'
														rows={3}
														value={apartment.description}
														onChange={e =>
															handleNestedInputChange(
																floorIndex,
																apartmentIndex,
																'description',
																e.target.value
															)
														}
													></textarea>
												</div>
											</div>
										))}
									</div>
								</div>
							))}

						<button
							type='submit'
							className='w-[180px] h-[50px] rounded bg-blue-500 text-white text-lg font-medium mt-5'
						>
							Save Changes
						</button>
					</div>
				) : (
					<div className='flex flex-col gap-4'>
						<div className='flex flex-row items-center gap-3'>
							<p className='text-lg text-zinc-600 font-medium'>
								{buildingData.typeBuilding}
							</p>
						</div>

						<div className='flex flex-row items-center gap-3'>
							<label
								htmlFor='city'
								className='text-lg text-zinc-600 font-medium'
							>
								City:
							</label>
							<input
								type='text'
								name='city'
								value={buildingData.city}
								onChange={handleInputChange}
								className='hover:border hover:border-zinc-400 hover:rounded cursor-pointer'
							/>
						</div>

						<div className='flex flex-row items-center gap-3'>
							<label
								htmlFor='address'
								className='text-lg text-zinc-600 font-medium'
							>
								Address
							</label>
							<input
								type='text'
								name='address'
								value={buildingData.address}
								onChange={handleInputChange}
								className='hover:border hover:border-zinc-400 hover:rounded cursor-pointer'
							/>
						</div>

						{/* Загрузка изображения */}
						<div className='flex flex-row items-center gap-3'>
							<label
								htmlFor='imageUpload'
								className='w-[150px] text-lg text-zinc-600 font-medium'
							>
								Upload Image
							</label>
							<input
								type='file'
								onChange={handleImageUpload}
								className='mt-1 block w-full'
							/>
							{uploadProgress > 0 && (
								<div className='mt-2'>
									<progress value={uploadProgress} max='100'>
										{uploadProgress}%
									</progress>
								</div>
							)}
							{buildingData.imageUrl && (
								<div className='mt-4'>
									<img
										src={buildingData.imageUrl}
										alt='Building'
										className='w-32 h-32 object-cover'
									/>
								</div>
							)}
						</div>
						{/* Выбор статуса дома */}
						<div className='flex flex-row items-center gap-3'>
							<label
								htmlFor='buildingStatus'
								className='text-lg text-zinc-600 font-medium'
							>
								Status:
							</label>
							<select
								className='hover:border hover:border-zinc-400 hover:rounded cursor-pointer'
								name='buildingStatus'
								value={buildingData.buildingStatus}
								onChange={handleInputChange}
							>
								<option value='For Sale'>For Sale</option>
								<option value='Rent'>Rent</option>
								<option value='Sold'>Sold</option>
								<option value='Rented'>Rented</option>
							</select>
						</div>

						{/* выбор комнат для дома */}
						<div className='flex flex-row items-center gap-3'>
							<label
								htmlFor='hauseRooms'
								className='text-lg text-zinc-600 font-medium'
							>
								Rooms:{' '}
							</label>
							<input
								className='hover:border hover:border-zinc-400 hover:rounded cursor-pointer'
								type='number'
								name='hauseRooms'
								value={buildingData.hauseRooms}
								onChange={handleInputChange}
							/>
						</div>

						{/* выбор парковки для дома */}
						<div className='flex flex-row items-center gap-3'>
							<label
								htmlFor='parking'
								className='text-lg text-zinc-600 font-medium'
							>
								Parking:
							</label>
							<select
								className='hover:border hover:border-zinc-400 hover:rounded cursor-pointer'
								name='parking'
								value={buildingData.parking}
								onChange={handleInputChange}
							>
								<option value='Underground parking'>Underground parking</option>
								<option value='Garage'>Garage</option>
								<option value='Street parking'>Street parking</option>
								<option value='None'>None</option>
							</select>
						</div>

						{/* выбор площади для дома */}
						<div className='flex flex-row items-center gap-3'>
							<label
								htmlFor='hauseArea'
								className='text-lg text-zinc-600 font-medium'
							>
								Area:{' '}
							</label>
							<input
								className='hover:border hover:border-zinc-400 hover:rounded cursor-pointer'
								type='number'
								name='hauseArea'
								value={buildingData.hauseArea}
								onChange={handleInputChange}
							/>
						</div>

						{/* выбор цены для дома */}
						<div className='flex flex-row items-center gap-3'>
							<label
								htmlFor='price'
								className='text-lg text-zinc-600 font-medium'
							>
								Price:{' '}
							</label>
							<input
								className='hover:border hover:border-zinc-400 hover:rounded cursor-pointer'
								type='number'
								name='price'
								value={buildingData.price}
								onChange={handleInputChange}
							/>
						</div>

						<div className='flex flex-row items-center gap-3'>
							<label
								htmlFor='description'
								className='text-lg text-zinc-600 font-medium'
							>
								Description
							</label>
							<textarea
								name='description'
								value={buildingData.description}
								onChange={handleInputChange}
								className='border border-zinc-500 rounded cursor-pointer resize-none'
								rows={3}
								cols={40}
							/>
						</div>

						<button
							type='submit'
							className='w-[180px] h-[50px] rounded bg-blue-500 text-white text-lg font-medium mt-5'
						>
							Save Changes
						</button>
					</div>
				)}
			</form>
		</div>
	)
}

export default EditBuildings
