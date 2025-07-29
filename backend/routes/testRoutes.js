import express from 'express';
import { db } from '../firebase.js';
import { 
    collection, 
    addDoc, 
    getDocs, 
    query, 
    where, 
    doc, 
    getDoc, 
    updateDoc, 
    deleteDoc,
    arrayUnion,
    arrayRemove,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';

const router = express.Router();

// ADD THIS: Specific routes must come before generic ones

/**
 * @route   GET /api/tests/results/all
 * @desc    Get all test results for admin
 * @access  Admin
 */
router.get('/results/all', async (req, res) => {
    try {
        console.log('Fetching all test results from database');
        
        // Get all test results directly from collection
        const resultsRef = collection(db, 'testResults');
        const querySnapshot = await getDocs(resultsRef);
        
        if (querySnapshot.empty) {
            console.log('No test results found');
            return res.status(200).json({ 
                success: true, 
                results: [] 
            });
        }
        
        const results = [];
        for (const docSnapshot of querySnapshot.docs) {
            try {
                const resultData = docSnapshot.data();
                
                // Safely handle timestamp conversion
                const submittedAt = resultData.submittedAt?.toDate?.() 
                    ? resultData.submittedAt.toDate().toISOString() 
                    : null;
                    
                const updatedAt = resultData.updatedAt?.toDate?.() 
                    ? resultData.updatedAt.toDate().toISOString() 
                    : null;
                
                const result = {
                    id: docSnapshot.id,
                    ...resultData,
                    submittedAt,
                    updatedAt
                };
                
                // Get test details
                if (resultData.testId) {
                    try {
                        const testDocRef = doc(db, 'tests', resultData.testId);
                        const testDocSnapshot = await getDoc(testDocRef);
                        if (testDocSnapshot.exists()) {
                            result.test = {
                                id: testDocSnapshot.id,
                                title: testDocSnapshot.data().title || 'Untitled Test',
                                description: testDocSnapshot.data().description || ''
                            };
                        }
                    } catch (testError) {
                        console.error('Error fetching test details:', testError);
                    }
                }
                
                results.push(result);
            } catch (resultError) {
                console.error('Error processing user test result:', resultError);
                // Skip this result and continue with others
            }
        }
        
        console.log(`Found ${results.length} test results`);
        res.status(200).json({ 
            success: true, 
            results 
        });
    } catch (error) {
        console.error('Error fetching all test results:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch test results'
        });
    }
});

/**
 * @route   GET /api/tests/result/:resultId
 * @desc    Get detailed test result by result ID
 * @access  Public
 */
router.get('/result/:resultId', async (req, res) => {
    try {
        const { resultId } = req.params;
        console.log('Fetching detailed test result for result ID:', resultId);
        
        if (!resultId) {
            return res.status(400).json({ 
                success: false, 
                message: 'Result ID is required' 
            });
        }
        
        // Get the result document
        const resultRef = doc(db, 'testResults', resultId);
        const resultDoc = await getDoc(resultRef);
        
        if (!resultDoc.exists()) {
            return res.status(404).json({ 
                success: false, 
                message: 'Test result not found' 
            });
        }
        
        const resultData = resultDoc.data();
        
        // Safely handle timestamp conversion
        const submittedAt = resultData.submittedAt?.toDate?.() 
            ? resultData.submittedAt.toDate().toISOString() 
            : null;
            
        const updatedAt = resultData.updatedAt?.toDate?.() 
            ? resultData.updatedAt.toDate().toISOString() 
            : null;
        
        const result = {
            id: resultDoc.id,
            ...resultData,
            submittedAt,
            updatedAt
        };
        
        // Get test details
        if (resultData.testId) {
            try {
                const testDocRef = doc(db, 'tests', resultData.testId);
                const testDocSnapshot = await getDoc(testDocRef);
                if (testDocSnapshot.exists()) {
                    const testData = testDocSnapshot.data();
                    result.test = {
                        id: testDocSnapshot.id,
                        title: testData.title || 'Untitled Test',
                        description: testData.description || '',
                        questions: testData.questions || []
                    };
                }
            } catch (testError) {
                console.error('Error fetching test details:', testError);
            }
        }
        
        console.log(`Successfully fetched result details for ${resultId}`);
        res.status(200).json({ 
            success: true, 
            result 
        });
    } catch (error) {
        console.error('Error fetching detailed test result:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch detailed test result: ' + (error.message || 'Unknown error'),
            error: error.toString()
        });
    }
});

/**
 * @route   POST /api/tests/create
 * @desc    Create a new test
 * @access  Admin
 */
router.post('/create', async (req, res) => {
    try {
        const { title, description, timeLimit, questions, createdBy } = req.body;
        
        console.log('Creating new test:', JSON.stringify(req.body, null, 2));

        if (!title || !questions || !questions.length) {
            return res.status(400).json({ 
                success: false, 
                message: 'Test title and questions are required' 
            });
        }

        // Create a new test document
        const testData = {
            title,
            description: description || '',
            timeLimit: timeLimit || 60, // Default 60 minutes
            questions,
            createdBy,
            isActive: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        // Add document to Firestore
        const docRef = await addDoc(collection(db, 'tests'), testData);
        console.log('Test created with ID:', docRef.id);

        res.status(201).json({ 
            success: true, 
            message: 'Test created successfully',
            testId: docRef.id 
        });
    } catch (error) {
        console.error('Error creating test:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to create test',
            error: error.message 
        });
    }
});

/**
 * @route   GET /api/tests
 * @desc    Get all tests
 * @access  Admin
 */
router.get('/', async (req, res) => {
    try {
        const testsRef = collection(db, 'tests');
        const querySnapshot = await getDocs(testsRef);
        
        if (querySnapshot.empty) {
            return res.json({ 
                success: true, 
                tests: [],
                message: 'No tests found' 
            });
        }
        
        const tests = [];
        querySnapshot.forEach(doc => {
            tests.push({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate().toISOString() || null,
                updatedAt: doc.data().updatedAt?.toDate().toISOString() || null
            });
        });
        
        res.status(200).json({ 
            success: true, 
            tests 
        });
    } catch (error) {
        console.error('Error fetching tests:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch tests',
            error: error.message 
        });
    }
});

/**
 * @route   GET /api/tests/:testId
 * @desc    Get test by ID
 * @access  Public
 */
router.get('/:testId', async (req, res) => {
    try {
        const { testId } = req.params;
        
        const testRef = doc(db, 'tests', testId);
        const testDoc = await getDoc(testRef);
        
        if (!testDoc.exists()) {
            return res.status(404).json({ 
                success: false, 
                message: 'Test not found' 
            });
        }
        
        const testData = {
            id: testDoc.id,
            ...testDoc.data(),
            createdAt: testDoc.data().createdAt?.toDate().toISOString() || null,
            updatedAt: testDoc.data().updatedAt?.toDate().toISOString() || null
        };
        
        res.status(200).json({ 
            success: true, 
            test: testData 
        });
    } catch (error) {
        console.error('Error fetching test:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch test',
            error: error.message 
        });
    }
});

/**
 * @route   PUT /api/tests/:testId
 * @desc    Update test
 * @access  Admin
 */
router.put('/:testId', async (req, res) => {
    try {
        const { testId } = req.params;
        const updateData = req.body;
        
        const testRef = doc(db, 'tests', testId);
        const testDoc = await getDoc(testRef);
        
        if (!testDoc.exists()) {
            return res.status(404).json({ 
                success: false, 
                message: 'Test not found' 
            });
        }
        
        // Add updated timestamp
        updateData.updatedAt = serverTimestamp();
        
        await updateDoc(testRef, updateData);
        
        res.status(200).json({ 
            success: true, 
            message: 'Test updated successfully' 
        });
    } catch (error) {
        console.error('Error updating test:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to update test',
            error: error.message 
        });
    }
});

/**
 * @route   DELETE /api/tests/:testId
 * @desc    Delete test
 * @access  Admin
 */
router.delete('/:testId', async (req, res) => {
    try {
        const { testId } = req.params;
        
        const testRef = doc(db, 'tests', testId);
        const testDoc = await getDoc(testRef);
        
        if (!testDoc.exists()) {
            return res.status(404).json({ 
                success: false, 
                message: 'Test not found' 
            });
        }
        
        await deleteDoc(testRef);
        
        res.status(200).json({ 
            success: true, 
            message: 'Test deleted successfully' 
        });
    } catch (error) {
        console.error('Error deleting test:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to delete test',
            error: error.message 
        });
    }
});

/**
 * @route   POST /api/tests/:testId/assign
 * @desc    Assign test to users
 * @access  Admin
 */
router.post('/:testId/assign', async (req, res) => {
    try {
        const { testId } = req.params;
        const { userIds } = req.body;
        
        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'User IDs array is required' 
            });
        }
        
        const testRef = doc(db, 'tests', testId);
        const testDoc = await getDoc(testRef);
        
        if (!testDoc.exists()) {
            return res.status(404).json({ 
                success: false, 
                message: 'Test not found' 
            });
        }
        
        // Create test assignments for each user
        const batch = [];
        for (const userId of userIds) {
            const assignmentData = {
                testId,
                userId,
                status: 'assigned', // assigned, started, completed
                assignedAt: serverTimestamp(),
                dueDate: null, // Optional: Set a due date
                updatedAt: serverTimestamp()
            };
            
            batch.push(addDoc(collection(db, 'testAssignments'), assignmentData));
        }
        
        // Execute all assignments in parallel
        await Promise.all(batch);
        
        res.status(200).json({ 
            success: true, 
            message: `Test assigned to ${userIds.length} users successfully` 
        });
    } catch (error) {
        console.error('Error assigning test:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to assign test',
            error: error.message 
        });
    }
});

/**
 * @route   GET /api/tests/assigned/:userId
 * @desc    Get assigned tests for a user
 * @access  Public
 */
router.get('/assigned/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const q = query(
            collection(db, 'testAssignments'),
            where('userId', '==', userId)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            return res.json({ 
                success: true, 
                assignments: [],
                message: 'No assigned tests found for this user' 
            });
        }
        
        const assignments = [];
        for (const docSnapshot of querySnapshot.docs) {
            const assignment = {
                id: docSnapshot.id,
                ...docSnapshot.data(),
                assignedAt: docSnapshot.data().assignedAt?.toDate().toISOString() || null,
                dueDate: docSnapshot.data().dueDate?.toDate().toISOString() || null,
                updatedAt: docSnapshot.data().updatedAt?.toDate().toISOString() || null
            };
            
            // Get test details
            const testId = docSnapshot.data().testId;
            if (testId) {
                const testDocRef = doc(db, 'tests', testId);
                const testDocSnapshot = await getDoc(testDocRef);
                if (testDocSnapshot.exists()) {
                    assignment.test = {
                        id: testDocSnapshot.id,
                        title: testDocSnapshot.data().title,
                        description: testDocSnapshot.data().description,
                        timeLimit: testDocSnapshot.data().timeLimit
                    };
                }
            }
            
            assignments.push(assignment);
        }
        
        res.status(200).json({ 
            success: true, 
            assignments 
        });
    } catch (error) {
        console.error('Error fetching assigned tests:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch assigned tests',
            error: error.message 
        });
    }
});

/**
 * @route   POST /api/tests/:testId/start
 * @desc    Start a test for a user
 * @access  Public
 */
router.post('/:testId/start', async (req, res) => {
    try {
        const { testId } = req.params;
        const { userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({ 
                success: false, 
                message: 'User ID is required' 
            });
        }
        
        // Find the assignment
        const q = query(
            collection(db, 'testAssignments'),
            where('testId', '==', testId),
            where('userId', '==', userId)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            return res.status(404).json({ 
                success: false, 
                message: 'Test assignment not found for this user' 
            });
        }
        
        const assignmentDoc = querySnapshot.docs[0];
        const assignmentRef = doc(db, 'testAssignments', assignmentDoc.id);
        
        if (assignmentDoc.data().status === 'completed') {
            return res.status(400).json({ 
                success: false, 
                message: 'This test has already been completed' 
            });
        }
        
        // Get the test details
        const testRef = doc(db, 'tests', testId);
        const testDoc = await getDoc(testRef);
        
        if (!testDoc.exists()) {
            return res.status(404).json({ 
                success: false, 
                message: 'Test not found' 
            });
        }
        
        const testData = testDoc.data();
        
        // Update assignment status to started
        await updateDoc(assignmentRef, {
            status: 'started',
            startedAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        
        // Strip answers from questions before sending to client
        const questionsWithoutAnswers = testData.questions.map(q => {
            const { correctAnswer, explanation, ...questionData } = q;
            return questionData;
        });
        
        res.status(200).json({ 
            success: true, 
            message: 'Test started successfully',
            test: {
                id: testDoc.id,
                title: testData.title,
                description: testData.description,
                timeLimit: testData.timeLimit,
                questions: questionsWithoutAnswers
            },
            startTime: new Date().toISOString(),
            assignmentId: assignmentDoc.id
        });
    } catch (error) {
        console.error('Error starting test:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to start test',
            error: error.message 
        });
    }
});

/**
 * @route   POST /api/tests/:testId/submit
 * @desc    Submit test answers
 * @access  Public
 */
router.post('/:testId/submit', async (req, res) => {
    try {
        const { testId } = req.params;
        const { userId, answers } = req.body;
        
        if (!userId || !answers || !Array.isArray(answers)) {
            return res.status(400).json({ 
                success: false, 
                message: 'User ID and answers array are required' 
            });
        }
        
        // Find the assignment
        const q = query(
            collection(db, 'testAssignments'),
            where('testId', '==', testId),
            where('userId', '==', userId)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            return res.status(404).json({ 
                success: false, 
                message: 'Test assignment not found for this user' 
            });
        }
        
        const assignmentDoc = querySnapshot.docs[0];
        const assignmentRef = doc(db, 'testAssignments', assignmentDoc.id);
        
        if (assignmentDoc.data().status === 'completed') {
            return res.status(400).json({ 
                success: false, 
                message: 'This test has already been completed' 
            });
        }
        
        // Get the test details for grading
        const testRef = doc(db, 'tests', testId);
        const testDoc = await getDoc(testRef);
        
        if (!testDoc.exists()) {
            return res.status(404).json({ 
                success: false, 
                message: 'Test not found' 
            });
        }
        
        const testData = testDoc.data();
        
        // Grade the test
        let score = 0;
        let totalPoints = 0;
        const gradedAnswers = [];
        
        for (const question of testData.questions) {
            const userAnswer = answers.find(a => a.questionId === question.id);
            const points = question.points || 1; // Default 1 point per question
            totalPoints += points;
            
            const gradedAnswer = {
                questionId: question.id,
                question: question.text,
                correctAnswer: question.correctAnswer,
                userAnswer: userAnswer ? userAnswer.answer : null,
                isCorrect: false,
                points,
                earnedPoints: 0
            };
            
            if (userAnswer && userAnswer.answer === question.correctAnswer) {
                score += points;
                gradedAnswer.isCorrect = true;
                gradedAnswer.earnedPoints = points;
            }
            
            gradedAnswers.push(gradedAnswer);
        }
        
        const percentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;
        
        // Create test result
        const resultData = {
            testId,
            userId,
            score,
            totalPoints,
            percentage,
            gradedAnswers,
            submittedAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };
        
        const resultRef = await addDoc(collection(db, 'testResults'), resultData);
        
        // Update assignment status to completed
        await updateDoc(assignmentRef, {
            status: 'completed',
            completedAt: serverTimestamp(),
            resultId: resultRef.id,
            updatedAt: serverTimestamp()
        });
        
        res.status(200).json({ 
            success: true, 
            message: 'Test submitted and graded successfully',
            result: {
                id: resultRef.id,
                score,
                totalPoints,
                percentage
            }
        });
    } catch (error) {
        console.error('Error submitting test:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to submit test',
            error: error.message 
        });
    }
});

/**
 * @route   GET /api/tests/results/:userId
 * @desc    Get test results for a user
 * @access  Public
 */
router.get('/results/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        console.log('Fetching test results for user:', userId);
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }
        
        const q = query(
            collection(db, 'testResults'),
            where('userId', '==', userId)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            console.log(`No test results found for user ${userId}`);
            return res.status(200).json({ 
                success: true, 
                results: [],
                message: 'No test results found for this user' 
            });
        }
        
        const results = [];
        for (const docSnapshot of querySnapshot.docs) {
            try {
                const resultData = docSnapshot.data();
                
                // Safely handle timestamp conversion
                const submittedAt = resultData.submittedAt?.toDate?.() 
                    ? resultData.submittedAt.toDate().toISOString() 
                    : null;
                    
                const updatedAt = resultData.updatedAt?.toDate?.() 
                    ? resultData.updatedAt.toDate().toISOString() 
                    : null;
                
                const result = {
                    id: docSnapshot.id,
                    ...resultData,
                    submittedAt,
                    updatedAt
                };
                
                // Get test details
                if (resultData.testId) {
                    try {
                        const testDocRef = doc(db, 'tests', resultData.testId);
                        const testDocSnapshot = await getDoc(testDocRef);
                        if (testDocSnapshot.exists()) {
                            result.test = {
                                id: testDocSnapshot.id,
                                title: testDocSnapshot.data().title || 'Untitled Test',
                                description: testDocSnapshot.data().description || ''
                            };
                        }
                    } catch (testError) {
                        console.error('Error fetching test details:', testError);
                    }
                }
                
                results.push(result);
            } catch (resultError) {
                console.error('Error processing user test result:', resultError);
                // Skip this result and continue with others
            }
        }
        
        console.log(`Found ${results.length} test results for user ${userId}`);
        res.status(200).json({ 
            success: true, 
            results 
        });
    } catch (error) {
        console.error('Error fetching test results for user:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch test results: ' + (error.message || 'Unknown error'),
            error: error.toString()
        });
    }
});

export default router;
