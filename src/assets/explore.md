# Real Estate

## Installation of dependencies

npm i react-router-dom swiper firebase react-paginate 

npm install --save @fortawesome/fontawesome-svg-core @fortawesome/free-solid-svg-icons @fortawesome/free-regular-svg-icons @fortawesome/free-brands-svg-icons @fortawesome/react-fontawesome

## tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
export default {
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			colors: {
				primary: '#0e2442',
			},
			gridTemplateColumns: {
				auto: 'repeat(auto-fill, minmax(330px, 1fr))',
			},
		},
	},
	plugins: [],
}
```

## Utilities for index.css
```css
@layer utilities {
  input[type='number']::-webkit-outer-spin-button,
  input[type='number']::-webkit-inner-spin-button {
    @apply appearance-none;
    margin: 0;
  }

  input[type='number'] {
    @apply [appearance:textfield];
  }
}
```

## Rules for Firestore

service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if request.auth != null;  // Allow read access to all authenticated users
      allow write, delete: if request.auth.uid == "enter your tokken account auth";  // Allow write and delete access only to the administrator.
    }
  }
}

## Rules for Storage

rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if request.auth != null;  // Allow read access to all authenticated users
      allow write: if request.auth.uid == "enter your tokken account auth";  // Allow write and delete access only to the administrator.
    }
  }
}

## Custom style for Swiper

```css
.swiper-button-prev:after, .swiper-button-next:after {
  font-size: 20px;
  color: #0e2442;
}

.swiper-pagination-bullet {
  background: #0e2442;
}
```
## AddForm.jsx
```javascript
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
```