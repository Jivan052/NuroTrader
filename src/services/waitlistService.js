import { database, firestore } from '../../firebase';
import { ref, set, get, push, query, orderByChild, equalTo, update } from 'firebase/database';
import { collection, addDoc, getDocs, query as firestoreQuery, where, orderBy, limit, doc, getDoc, updateDoc } from 'firebase/firestore';

class WaitlistService {
  /**
   * Add a user to the waiting list in both Firestore and Realtime Database
   */
  async addToWaitlist(userData) {
    try {
      const { walletAddress, name, email, reason, referralCode = null } = userData;
      const timestamp = new Date().toISOString();
      
      // Check if user already exists in waiting list by wallet address
      const exists = await this.checkIfUserExists(walletAddress);
      if (exists) {
        return { success: false, message: 'User already on waiting list' };
      }
      
      // Add to Firestore
      const firestoreData = {
        walletAddress,
        name,
        email,
        reason,
        referralCode,
        joinedAt: timestamp,
        status: 'pending', // pending, approved, rejected
      };
      
      const docRef = await addDoc(collection(firestore, 'waitlist'), firestoreData);
      
      // Add to Realtime Database (for faster queries and real-time updates)
      const realtimeDbData = {
        ...firestoreData,
        firestoreId: docRef.id
      };
      
      await set(ref(database, `waitlist/${walletAddress}`), realtimeDbData);
      
      return { 
        success: true, 
        message: 'Successfully added to waitlist',
        data: {
          id: docRef.id,
          ...firestoreData
        }
      };
    } catch (error) {
      console.error('Error adding user to waitlist:', error);
      return { success: false, message: error.message };
    }
  }
  
  /**
   * Check if a user already exists in the waitlist by wallet address
   */
  async checkIfUserExists(walletAddress) {
    try {
      const userRef = ref(database, `waitlist/${walletAddress}`);
      const snapshot = await get(userRef);
      return snapshot.exists();
    } catch (error) {
      console.error('Error checking if user exists:', error);
      throw error;
    }
  }
  
  /**
   * Get total count of users in the waitlist
   */
  async getWaitlistCount() {
    try {
      const waitlistRef = ref(database, 'waitlist');
      const snapshot = await get(waitlistRef);
      
      if (snapshot.exists()) {
        return Object.keys(snapshot.val()).length;
      }
      
      return 0;
    } catch (error) {
      console.error('Error getting waitlist count:', error);
      return 0;
    }
  }
  
  /**
   * Get list of users in the waitlist with pagination
   */
  async getWaitlistedUsers(page = 1, pageSize = 10) {
    try {
      // Get data from Firestore for more advanced querying capabilities
      const waitlistCollection = collection(firestore, 'waitlist');
      const q = firestoreQuery(
        waitlistCollection, 
        orderBy('joinedAt', 'desc'),
        limit(pageSize)
      );
      
      const querySnapshot = await getDocs(q);
      const users = [];
      
      querySnapshot.forEach((doc) => {
        users.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return { 
        success: true, 
        data: users,
        pagination: {
          page,
          pageSize,
          hasMore: users.length === pageSize
        }
      };
    } catch (error) {
      console.error('Error fetching waitlisted users:', error);
      return { success: false, message: error.message };
    }
  }
  
  /**
   * Get user by wallet address
   */
  async getUserByWalletAddress(walletAddress) {
    try {
      const userRef = ref(database, `waitlist/${walletAddress}`);
      const snapshot = await get(userRef);
      
      if (snapshot.exists()) {
        return {
          success: true,
          data: snapshot.val()
        };
      }
      
      return {
        success: false,
        message: 'User not found'
      };
    } catch (error) {
      console.error('Error getting user by wallet address:', error);
      return { success: false, message: error.message };
    }
  }
  
  /**
   * Update user status (approve or reject)
   */
  async updateUserStatus(walletAddress, status) {
    try {
      // First get the user to get the Firestore ID
      const userResult = await this.getUserByWalletAddress(walletAddress);
      if (!userResult.success) {
        return userResult;
      }
      
      const user = userResult.data;
      const firestoreId = user.firestoreId;
      
      // Update in Firestore
      const docRef = doc(firestore, 'waitlist', firestoreId);
      await updateDoc(docRef, { status });
      
      // Update in Realtime Database
      await update(ref(database, `waitlist/${walletAddress}`), { status });
      
      return {
        success: true,
        message: `User status updated to ${status}`
      };
    } catch (error) {
      console.error('Error updating user status:', error);
      return { success: false, message: error.message };
    }
  }
}

export const waitlistService = new WaitlistService();
export default waitlistService;
