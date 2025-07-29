import express from 'express';
import { 
  addDoc, 
  doc, 
  setDoc, 
  getDoc,
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  Timestamp
} from 'firebase/firestore';

import { db, auth } from '../firebase.js';
import { getAuth } from 'firebase/auth';
const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      password, 
      studentId 
    } = req.body;
    console.log('Registration request:', req.body);

    const userData = {
      firstName,
      lastName,
      email,
      studentId,
      password,
      role: 'user', // Set default role as user
      createdAt: Timestamp.now(),
    };
    const existingUserQuery = query(
      collection(db, "users"),
      where('email', '==', email)
    );

    const existingUserSnapshot = await getDocs(existingUserQuery);
    if (!existingUserSnapshot.empty) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const result = await addDoc(collection(db, "users"), userData);
    res.status(201).json({
      message: 'Registration successful'
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(400).json({error});
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    console.log('Login request:', req.body);

    const userQuery = query(
      collection(db, "users"),
      where('email', '==', email),
      where('password', '==', password)
    );

    const querySnapshot = await getDocs(userQuery);
    if (querySnapshot.empty) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    // Remove sensitive data before sending to client
    const { password: userPassword, ...safeUserData } = userData;

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: userDoc.id,
        ...safeUserData
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(400).json({ error: error.message });
  }
});

router.post('/auth/google', async (req, res) => {
  try {
    console.log('Google login request:', req.body);
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: 'Missing ID token' });
    }

    const decodedToken = await getAuth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    console.log('Decoded token:', decodedToken);

    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    let userData;
    
    if (!userSnap.exists()) {
      // New user, create with default role
      const [firstName, lastName] = name.split(' ');
      userData = {
        email,
        firstName,
        lastName,
        profileImage: picture,
        role: 'user', // Default role for new Google users
        createdAt: Timestamp.now()
      };
      
      await setDoc(userRef, userData);
    } else {
      userData = userSnap.data();
    }
    
    console.log('User data:', userData);
    
    // Return user info including role
    res.status(200).json({
      message: 'Google login successful',
      user: { 
        id: uid,
        email, 
        name, 
        picture,
        role: userData.role || 'user'
      }
    });

  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ error: 'Invalid token or server error' });
  }
});

// code to get all the users

router.get('/getUsers', async (req, res) => {
  try {
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    const usersList = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.status(200).json(usersList);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
}
);

router.get('/:userId/details', async (req, res) => {
  try {
    // get user details
    const { userId } = req.params;
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      return res.status(404).json({ message: 'User not found' });
    }
    const userData = userSnap.data();
    // Remove sensitive data before sending to client
    const { password, ...safeUserData } = userData;
    res.status(200).json({
      user: {
        id: userSnap.id,
        ...safeUserData
      }
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
});

export default router;