import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'


const firebaseConfig = {
	apiKey: 'AIzaSyCz8P7vwZyH8gbK4lkJfxYAF0GDmoJYY08',
	authDomain: 'turmbau-a9b98.firebaseapp.com',
	projectId: 'turmbau-a9b98',
	storageBucket: 'turmbau-a9b98.appspot.com',
	messagingSenderId: '830015396642',
	appId: '1:830015396642:web:6063f8c94f7c99512ca37b',
	measurementId: 'G-CK8WVERRD4',
}


const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)

export { auth, db, storage }
