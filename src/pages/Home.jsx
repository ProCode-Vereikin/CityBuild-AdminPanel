import React, { useState } from 'react'
import ViewCard from '../components/ViewCard'
import AddForm from '../components/AddForm'

const Home = () => {
	const [show, setShow] = useState(<ViewCard />)

	return (
		<div className='mx-1 sm:mx-[3%]'>
			<div className='flex flex-row items-center gap-8'>
				<button
					className='w-[150px] bg-primary text-white py-2 px-3 flex items-center justify-center mt-3 rounded-xl cursor-pointer'
					onClick={() => setShow(<ViewCard />)}
				>
					View property
				</button>
				<button
					className='w-[150px] bg-primary text-white py-2 px-3 flex items-center justify-center mt-3 rounded-xl cursor-pointer'
					onClick={() => setShow(<AddForm />)}
				>
					Add property
				</button>
			</div>

			<div className='mt-5'>{show}</div>
		</div>
	)
}

export default Home
