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
    Timestamp,
    orderBy,
    limit 
} from 'firebase/firestore';

const router = express.Router();

/**
 * @route   POST /api/groups/create
 * @desc    Create a new group
 * @access  Public
 */
router.post('/create', async (req, res) => {
    try {
        const { name, description, creatorId, course, year } = req.body;
        
        console.log('Creating new group with data:', JSON.stringify(req.body, null, 2));

        if (!name || !creatorId) {
            console.log('Missing required fields:', { name, creatorId });
            return res.status(400).json({ 
                success: false, 
                message: 'Group name and creator ID are required' 
            });
        }

        // Create a new group document
        const groupData = {
            name,
            description: description || '',
            course: course || '',
            batchYear: year || new Date().getFullYear().toString(),
            creatorId,
            members: [creatorId], // Creator is automatically a member
            admins: [creatorId],  // Creator is automatically an admin
            updatedAt: serverTimestamp()
        };

        console.log('Group data to be added:', groupData);

        // Add document to Firestore
        const docRef = await addDoc(collection(db, 'groups'), groupData);

        res.status(201).json({ 
            success: true, 
            message: 'Group created successfully',
            groupId: docRef.id 
        });
    } catch (error) {
        console.error('Error creating group:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to create group',
            error: error.message 
        });
    }
});

// get all groups of joined by user



/**
 * @route   GET /api/groups/:groupId
 * @desc    Get details for a specific group
 * @access  Public
 */
router.get('/:groupId', async (req, res) => {
    try {
        const { groupId } = req.params;
        
        console.log('Fetching group details for:', groupId);

        const groupRef = doc(db, 'groups', groupId);
        const groupDoc = await getDoc(groupRef);
        
        if (!groupDoc.exists()) {
            return res.status(404).json({ 
                success: false, 
                message: 'Group not found' 
            });
        }

        const groupData = {
            id: groupDoc.id,
            ...groupDoc.data(),
            createdAt: groupDoc.data().createdAt?.toDate().toISOString() || null,
            updatedAt: groupDoc.data().updatedAt?.toDate().toISOString() || null
        };

        res.status(200).json({ 
            success: true, 
            group: groupData 
        });
    } catch (error) {
        console.error('Error fetching group details:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch group details',
            error: error.message 
        });
    }
});

/**
 * @route   POST /api/groups/join
 * @desc    Join an existing group
 * @access  Public
 */
router.post('/join', async (req, res) => {
    try {
        const { groupId, userId } = req.body;
        
        console.log('User joining group:', { groupId, userId });

        if (!groupId || !userId) {
            return res.status(400).json({ 
                success: false, 
                message: 'Group ID and User ID are required' 
            });
        }

        // Check if group exists
        const groupRef = doc(db, 'groups', groupId);
        const groupDoc = await getDoc(groupRef);
        
        if (!groupDoc.exists()) {
            return res.status(404).json({ 
                success: false, 
                message: 'Group not found' 
            });
        }

        // Check if user is already a member
        const groupData = groupDoc.data();
        if (groupData.members.includes(userId)) {
            return res.status(400).json({ 
                success: false, 
                message: 'User is already a member of this group' 
            });
        }

        // Add user to group members
        await updateDoc(groupRef, {
            members: arrayUnion(userId),
            updatedAt: serverTimestamp()
        });

        res.status(200).json({ 
            success: true, 
            message: 'Successfully joined the group' 
        });
    } catch (error) {
        console.error('Error joining group:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to join group',
            error: error.message 
        });
    }
});

/**
 * @route   POST /api/groups/leave
 * @desc    Leave a group
 * @access  Public
 */
router.post('/leave', async (req, res) => {
    try {
        const { groupId, userId } = req.body;
        
        console.log('User leaving group:', { groupId, userId });

        if (!groupId || !userId) {
            return res.status(400).json({ 
                success: false, 
                message: 'Group ID and User ID are required' 
            });
        }

        // Check if group exists
        const groupRef = doc(db, 'groups', groupId);
        const groupDoc = await getDoc(groupRef);
        
        if (!groupDoc.exists()) {
            return res.status(404).json({ 
                success: false, 
                message: 'Group not found' 
            });
        }

        // Check if user is a member
        const groupData = groupDoc.data();
        if (!groupData.members.includes(userId)) {
            return res.status(400).json({ 
                success: false, 
                message: 'User is not a member of this group' 
            });
        }

        // Check if user is the sole admin
        if (groupData.admins.includes(userId) && groupData.admins.length === 1 && groupData.members.length > 1) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cannot leave the group as you are the only admin. Please assign another admin first.' 
            });
        }

        // Remove user from group members and admins
        await updateDoc(groupRef, {
            members: arrayRemove(userId),
            admins: arrayRemove(userId),
            updatedAt: serverTimestamp()
        });

        res.status(200).json({ 
            success: true, 
            message: 'Successfully left the group' 
        });
    } catch (error) {
        console.error('Error leaving group:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to leave group',
            error: error.message 
        });
    }
});

/**
 * @route   GET /api/groups/user/:userId
 * @desc    Get all groups a user belongs to
 * @access  Public
 */
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        console.log('Fetching groups for user:', userId);

        const q = query(
            collection(db, 'groups'),
            where('members', 'array-contains', userId)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            return res.json({ 
                success: true, 
                groups: [],
                message: 'User is not a member of any groups' 
            });
        }
        
        const groups = [];
        querySnapshot.forEach(doc => {
            groups.push({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate().toISOString() || null,
                updatedAt: doc.data().updatedAt?.toDate().toISOString() || null
            });
        });
        
        res.status(200).json({ 
            success: true, 
            groups 
        });
    } catch (error) {
        console.error('Error fetching user groups:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch user groups',
            error: error.message 
        });
    }
});

/**
 * @route   POST /api/groups/update/:groupId
 * @desc    Update group details
 * @access  Public
 */
router.post('/update/:groupId', async (req, res) => {
    try {
        const { groupId } = req.params;
        const { name, code, description, course, batchYear, creatorId, members } = req.body;
        
        console.log('Updating group details:', { groupId, ...req.body });

        if (!groupId) {
            return res.status(400).json({ 
                success: false, 
                message: 'Group ID is required' 
            });
        }

        // Check if group exists
        const groupRef = doc(db, 'groups', groupId);
        const groupDoc = await getDoc(groupRef);
        
        if (!groupDoc.exists()) {
            return res.status(404).json({ 
                success: false, 
                message: 'Group not found' 
            });
        }

        // Get current group data
        const groupData = groupDoc.data();
        console.log('Current group data:', groupData);

        // Prepare update data
        const updateData = {
            updatedAt: serverTimestamp()
        };

        // Only update fields that are provided
        if (name) updateData.name = name;
        if (code) updateData.code = code;
        if (description !== undefined) updateData.description = description;
        if (course) updateData.course = course;
        if (batchYear) updateData.batchYear = batchYear;
        if (creatorId) updateData.creatorId = creatorId;
        
        // If members array is provided, update it
        if (members && Array.isArray(members)) {
            updateData.members = members;
        }

        console.log('Updating group with data:', updateData);

        // Update the group document
        await updateDoc(groupRef, updateData);

        console.log('Group updated successfully');
        res.status(200).json({ 
            success: true, 
            message: 'Group details updated successfully' 
        });
    } catch (error) {
        console.error('Error updating group:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack,
            code: error.code
        });
        
        res.status(500).json({ 
            success: false, 
            message: 'Failed to update group: ' + (error.message || 'Unknown error'),
            error: error.message 
        });
    }
});

/**
 * @route   POST /api/groups/:groupId/add-admin
 * @desc    Add admin to a group
 * @access  Public
 */
router.post('/:groupId/add-admin', async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userId, adminId } = req.body; // userId is the current admin, adminId is the user to promote
        
        console.log('Adding admin to group:', { groupId, userId, adminId });

        if (!groupId || !userId || !adminId) {
            return res.status(400).json({ 
                success: false, 
                message: 'Group ID, User ID and Admin ID are required' 
            });
        }

        // Check if group exists
        const groupRef = doc(db, 'groups', groupId);
        const groupDoc = await getDoc(groupRef);
        
        if (!groupDoc.exists()) {
            return res.status(404).json({ 
                success: false, 
                message: 'Group not found' 
            });
        }

        // Check if requester is an admin
        const groupData = groupDoc.data();
        if (!groupData.admins.includes(userId)) {
            return res.status(403).json({ 
                success: false, 
                message: 'Only group admins can add new admins' 
            });
        }

        // Check if user to promote is a member
        if (!groupData.members.includes(adminId)) {
            return res.status(400).json({ 
                success: false, 
                message: 'User must be a group member before being promoted to admin' 
            });
        }

        // Check if user is already an admin
        if (groupData.admins.includes(adminId)) {
            return res.status(400).json({ 
                success: false, 
                message: 'User is already an admin of this group' 
            });
        }

        // Add user to admins array
        await updateDoc(groupRef, {
            admins: arrayUnion(adminId),
            updatedAt: serverTimestamp()
        });

        res.status(200).json({ 
            success: true, 
            message: 'Successfully added user as admin' 
        });
    } catch (error) {
        console.error('Error adding admin to group:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to add admin',
            error: error.message 
        });
    }
});

/**
 * @route   DELETE /api/groups/:groupId
 * @desc    Delete a group
 * @access  Public
 */
router.delete('/:groupId', async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userId } = req.query;
        
        console.log('Deleting group:', { groupId, userId });

        if (!groupId || !userId) {
            return res.status(400).json({ 
                success: false, 
                message: 'Group ID and User ID are required' 
            });
        }

        // Check if group exists
        const groupRef = doc(db, 'groups', groupId);
        const groupDoc = await getDoc(groupRef);
        
        if (!groupDoc.exists()) {
            return res.status(404).json({ 
                success: false, 
                message: 'Group not found' 
            });
        }

        // Check if requester is an admin
        const groupData = groupDoc.data();
        if (!groupData.admins.includes(userId)) {
            return res.status(403).json({ 
                success: false, 
                message: 'Only group admins can delete the group' 
            });
        }

        // Delete the group
        await deleteDoc(groupRef);

        res.status(200).json({ 
            success: true, 
            message: 'Group deleted successfully' 
        });
    } catch (error) {
        console.error('Error deleting group:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to delete group',
            error: error.message 
        });
    }
});

/**
 * @route   POST /api/groups/:groupId/remove-member
 * @desc    Remove a member from a group
 * @access  Public
 */
router.post('/:groupId/remove-member', async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userId, memberId } = req.body; // userId is the admin, memberId is the user to remove
        
        console.log('Removing member from group:', { groupId, userId, memberId });

        if (!groupId || !userId || !memberId) {
            return res.status(400).json({ 
                success: false, 
                message: 'Group ID, User ID and Member ID are required' 
            });
        }

        // Check if group exists
        const groupRef = doc(db, 'groups', groupId);
        const groupDoc = await getDoc(groupRef);
        
        if (!groupDoc.exists()) {
            return res.status(404).json({ 
                success: false, 
                message: 'Group not found' 
            });
        }

        // Check if requester is an admin
        const groupData = groupDoc.data();
        if (!groupData.admins.includes(userId)) {
            return res.status(403).json({ 
                success: false, 
                message: 'Only group admins can remove members' 
            });
        }

        // Check if user to remove is a member
        if (!groupData.members.includes(memberId)) {
            return res.status(400).json({ 
                success: false, 
                message: 'User is not a member of this group' 
            });
        }

        // Prevent removing the last admin
        if (groupData.admins.includes(memberId) && groupData.admins.length === 1) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cannot remove the last admin from the group' 
            });
        }

        // Remove member from group and from admins if applicable
        await updateDoc(groupRef, {
            members: arrayRemove(memberId),
            admins: arrayRemove(memberId),
            updatedAt: serverTimestamp()
        });

        res.status(200).json({ 
            success: true, 
            message: 'Successfully removed member from group' 
        });
    } catch (error) {
        console.error('Error removing member from group:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to remove member',
            error: error.message 
        });
    }
});

/**
 * @route   GET /api/groups/joined/:userId
 * @desc    Get all groups joined by a user
 * @access  Public
 */
router.get('/joined/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        console.log('Fetching groups joined by user:', userId);

        if (!userId) {
            return res.status(400).json({ 
                success: false, 
                message: 'User ID is required' 
            });
        }

        const q = query(
            collection(db, 'groups'),
            where('members', 'array-contains', userId)
        );
        
        const querySnapshot = await getDocs(q);
        console.log(`Found ${querySnapshot.size} groups joined by user ${userId}`);
        
        if (querySnapshot.empty) {
            return res.status(200).json({ 
                success: true, 
                groups: [],
                message: 'User has not joined any groups' 
            });
        }
        
        const groups = [];
        querySnapshot.forEach(doc => {
            groups.push({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate().toISOString() || null,
                updatedAt: doc.data().updatedAt?.toDate().toISOString() || null
            });
        });
        
        return res.status(200).json({ 
            success: true, 
            groups,
            message: `Found ${groups.length} groups joined by the user`
        });
    } catch (error) {
        console.error('Error fetching joined groups:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack,
            code: error.code
        });
        
        return res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch joined groups: ' + (error.message || 'Unknown error'),
            errorCode: error.code || 'UNKNOWN_ERROR',
            error: error.toString()
        });
    }
});

/**
 * @route   POST /api/groups/:groupId/messages
 * @desc    Send a message to a group
 * @access  Public
 */
router.post('/:groupId/messages', async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userId, username, content } = req.body;
        
        console.log('Sending message to group:', groupId);

        if (!groupId || !userId || !content) {
            return res.status(400).json({ 
                success: false, 
                message: 'Group ID, User ID and message content are required' 
            });
        }

        // Check if group exists
        const groupRef = doc(db, 'groups', groupId);
        const groupDoc = await getDoc(groupRef);
        
        if (!groupDoc.exists()) {
            return res.status(404).json({ 
                success: false, 
                message: 'Group not found' 
            });
        }

        // Check if user is a member of the group
        const groupData = groupDoc.data();
        if (!groupData.members.includes(userId)) {
            return res.status(403).json({ 
                success: false, 
                message: 'Only group members can send messages' 
            });
        }

        // Create message document
        const messageData = {
            groupId,
            userId,
            username,
            content,
            timestamp: serverTimestamp(),
            read: false
        };

        console.log('Message data to be added:', messageData);

        // Add document to Firestore
        const docRef = await addDoc(collection(db, 'groupMessages'), messageData);
        console.log('Message sent successfully with ID:', docRef.id);

        return res.status(201).json({ 
            success: true, 
            message: 'Message sent successfully',
            messageId: docRef.id 
        });
    } catch (error) {
        console.error('Error sending message:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack,
            code: error.code
        });
        
        return res.status(500).json({ 
            success: false, 
            message: 'Failed to send message: ' + (error.message || 'Unknown error'),
            errorCode: error.code || 'UNKNOWN_ERROR',
            error: error.toString()
        });
    }
});

/**
 * @route   GET /api/groups/:groupId/messages
 * @desc    Get messages for a group
 * @access  Public
 */
router.get('/:groupId/messages', async (req, res) => {
    try {
        const { groupId } = req.params;
        const { limit: msgLimit = 100 } = req.query;
        
        console.log('Fetching messages for group:', groupId);

        if (!groupId) {
            return res.status(400).json({ 
                success: false, 
                message: 'Group ID is required' 
            });
        }

        // Check if group exists
        const groupRef = doc(db, 'groups', groupId);
        const groupDoc = await getDoc(groupRef);
        
        if (!groupDoc.exists()) {
            return res.status(404).json({ 
                success: false, 
                message: 'Group not found' 
            });
        }

        // Query for messages
        try {
            const q = query(
                collection(db, 'groupMessages'),
                where('groupId', '==', groupId),
                orderBy('timestamp', 'asc'),
                limit(parseInt(msgLimit))
            );

            const querySnapshot = await getDocs(q);
            
            // Check if there are no messages in the group
            if (querySnapshot.empty) {
                console.log(`No messages found for group ${groupId}`);
                return res.status(200).json({ 
                    success: true, 
                    messages: [],
                    message: 'No messages in this group yet'
                });
            }
            
            const messages = [];
            querySnapshot.forEach(doc => {
                messages.push({
                    id: doc.id,
                    ...doc.data(),
                    // Convert timestamp to ISO string
                    timestamp: doc.data().timestamp?.toDate().toISOString() || null
                });
            });

            console.log(`Found ${messages.length} messages for group ${groupId}`);
            return res.status(200).json({ 
                success: true, 
                messages 
            });
        } catch (error) {
            // Handle Firestore index error specifically
            if (error.code === 'failed-precondition' && error.message.includes('index')) {
                console.error('Missing Firestore index for query. Please create a composite index for groupId and timestamp.');
                
                // Fallback query without ordering when index doesn't exist
                try {
                    console.log('Attempting fallback query without ordering');
                    const fallbackQuery = query(
                        collection(db, 'groupMessages'),
                        where('groupId', '==', groupId)
                    );
                    
                    const fallbackSnapshot = await getDocs(fallbackQuery);
                    
                    if (fallbackSnapshot.empty) {
                        return res.status(200).json({ 
                            success: true, 
                            messages: [],
                            message: 'No messages in this group yet'
                        });
                    }
                    
                    // Convert documents to messages and sort manually
                    let messages = [];
                    fallbackSnapshot.forEach(doc => {
                        messages.push({
                            id: doc.id,
                            ...doc.data(),
                            timestamp: doc.data().timestamp?.toDate().toISOString() || null
                        });
                    });
                    
                    // Sort manually by timestamp
                    messages.sort((a, b) => {
                        if (!a.timestamp) return -1;
                        if (!b.timestamp) return 1;
                        return new Date(a.timestamp) - new Date(b.timestamp);
                    });
                    
                    // Apply limit after sorting
                    if (msgLimit) {
                        messages = messages.slice(0, parseInt(msgLimit));
                    }
                    
                    console.log(`Found ${messages.length} messages for group ${groupId} (fallback method)`);
                    return res.status(200).json({ 
                        success: true, 
                        messages,
                        indexMissing: true
                    });
                    
                } catch (fallbackError) {
                    throw fallbackError; // If fallback also fails, throw to outer catch
                }
            }
            throw error; // Re-throw if it's not an index error
        }
    } catch (error) {
        console.error('Error fetching messages:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack,
            code: error.code
        });
        
        return res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch messages: ' + (error.message || 'Unknown error'),
            errorCode: error.code || 'UNKNOWN_ERROR',
            error: error.toString()
        });
    }
});

/**
 * @route   POST /api/groups/:groupId/documents
 * @desc    Save document information for a group
 * @access  Public
 */
router.post('/:groupId/documents', async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userId, username, fileName, fileUrl, fileType, fileSize } = req.body;
        
        console.log('Saving document info to group:', groupId);

        if (!groupId || !userId || !fileName || !fileUrl) {
            return res.status(400).json({ 
                success: false, 
                message: 'Group ID, User ID, file name and file URL are required' 
            });
        }

        // Check if group exists
        const groupRef = doc(db, 'groups', groupId);
        const groupDoc = await getDoc(groupRef);
        
        if (!groupDoc.exists()) {
            return res.status(404).json({ 
                success: false, 
                message: 'Group not found' 
            });
        }

        // Check if user is a member of the group
        const groupData = groupDoc.data();
        if (!groupData.members.includes(userId)) {
            return res.status(403).json({ 
                success: false, 
                message: 'Only group members can share documents' 
            });
        }

        // Create message document with document type
        const messageData = {
            groupId,
            userId,
            username,
            type: 'document',
            fileName,
            fileUrl,
            fileType,
            fileSize,
            timestamp: serverTimestamp(),
            read: false
        };

        // Add document to Firestore
        const docRef = await addDoc(collection(db, 'groupMessages'), messageData);
        console.log('Document message saved successfully with ID:', docRef.id);

        return res.status(201).json({ 
            success: true, 
            message: 'Document shared successfully',
            documentId: docRef.id 
        });
    } catch (error) {
        console.error('Error sharing document:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack,
            code: error.code
        });
        
        return res.status(500).json({ 
            success: false, 
            message: 'Failed to share document: ' + (error.message || 'Unknown error'),
            errorCode: error.code || 'UNKNOWN_ERROR',
            error: error.toString()
        });
    }
});

/**
 * @route   POST /api/groups/:groupId/members
 * @desc    Add a member to the group
 * @access  Public
 */
router.post('/:groupId/members', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;
    
    console.log("Add member request:", { groupId, userId, body: req.body });
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    // Get the group
    const groupRef = doc(db, 'groups', groupId);
    const groupDoc = await getDoc(groupRef);
    
    if (!groupDoc.exists()) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }
    
    const groupData = groupDoc.data();
    console.log("Group data:", groupData);
    
    // Check if user is already a member
    if (groupData.members && groupData.members.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this group'
      });
    }
    
    // Add the user to the group's members array
    const updatedMembers = [...(groupData.members || []), userId];
    console.log("Updated members list:", updatedMembers);
    
    await updateDoc(groupRef, {
      members: updatedMembers,
      updatedAt: serverTimestamp()
    });
    
    return res.status(200).json({
      success: true,
      message: 'User added to group successfully'
    });
  } catch (error) {
    console.error('Error adding member to group:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add member to group',
      error: error.message
    });
  }
});

// Export the router as a named export for better compatibility
export default router;