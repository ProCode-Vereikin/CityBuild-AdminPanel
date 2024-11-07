import React from 'react'

const Filter = ({ filters, setFilters }) => {
	// Handle change for text inputs and single-select options
	const handleChange = e => {
		const { name, value } = e.target
		setFilters(prevFilters => ({
			...prevFilters,
			[name]: value,
		}))
	}

	return (
		<div>
			<div className='flex flex-row flex-wrap lg:flex-col gap-4 items-start border-2 border-primary text-primary rounded p-1'>
				<div className='flex flex-row items-center gap-2'>
					<label className='text-lg font-medium'>Type: </label>
					<select name='type' value={filters.type} onChange={handleChange}>
						<option value=''>All Buildings</option>
						<option value='Building'>Building</option>
						<option value='House'>House</option>
					</select>
				</div>
				<div className='flex flex-row items-center gap-2'>
					<label className='text-lg font-medium'>Status: </label>
					<select name='status' value={filters.status} onChange={handleChange}>
						<option value=''>All Statuses</option>
						<option value='For Sale'>For Sale</option>
						<option value='Sold'>Sold</option>
						<option value='Rent'>Rent</option>
						<option value='Rented'>Rented</option>
					</select>
				</div>
				<div className='flex flex-row items-center gap-2'>
					<label className='text-lg font-medium'>City: </label>
					<input
						type='text'
						name='city'
						value={filters.city}
						placeholder='Search by city...'
						onChange={handleChange}
						className='border p-1 rounded'
					/>
				</div>
				<div className='flex flex-row items-center gap-2'>
					<label className='text-lg font-medium'>Address: </label>
					<input
						type='text'
						name='address'
						value={filters.address}
						placeholder='Search by address'
						onChange={handleChange}
						className='border p-1 rounded'
					/>
				</div>

				
				<div className='flex flex-row items-center gap-2'>
					<label className='text-lg font-medium'>Area: </label>
					<input
						type='number'
						name='areaFrom'
						value={filters.areaFrom || ''}
						placeholder='Area From'
						onChange={handleChange}
						className='w-24 border p-1 rounded'
					/>
					{' - '}
					<input
						type='number'
						name='areaTo'
						value={filters.areaTo || ''}
						placeholder='Area To'
						onChange={handleChange}
						className='w-24 border p-1 rounded'
					/>
				</div>

				
				<div className='flex flex-row items-center gap-2'>
					<label className='text-lg font-medium'>Price: </label>
					<input
						type='number'
						name='priceFrom'
						value={filters.priceFrom || ''}
						placeholder='Price From'
						onChange={handleChange}
						className='w-24 border p-1 rounded'
					/>
					{' - '}
					<input
						type='number'
						name='priceTo'
						value={filters.priceTo || ''}
						placeholder='Price To'
						onChange={handleChange}
						className='w-24 border p-1 rounded'
					/>
				</div>
				<div className='flex flex-row items-center gap-2'>
					<label className='text-lg font-medium'>Parking: </label>
					<select
						name='parking'
						value={filters.parking}
						onChange={handleChange}
					>
						<option value=''>Any</option>
						<option value='Underground parking'>Underground parking</option>
						<option value='Garage'>Garage</option>
						<option value='Street parking'>Street parking</option>
						<option value='None'>None</option>
					</select>
				</div>
				<div className='flex w-full items-center justify-center mt-5'>
					<button
						onClick={() =>
							setFilters({
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
						} // Reset filters
						className='px-4 py-2 bg-red-500 text-white rounded w-[200px] mb-3'
					>
						Reset
					</button>
				</div>
			</div>
		</div>
	)
}

export default Filter
