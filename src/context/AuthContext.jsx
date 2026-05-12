import * as React from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = React.createContext();

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            
            // SECURITY GATE: Automatic logout for blocked entities
            if (userData.status === 'Blocked') {
              console.warn("Blocked user attempt detected. Terminating session...");
              await signOut(auth);
              setUser(null);
              setLoading(false);
              return;
            }

            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              ...userData
            });
          } else {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              role: 'user',
              name: firebaseUser.displayName || 'User',
              balance: 0,
              depositedBalance: 0,
              winningBalance: 0,
              bonusBalance: 0
            });
          }
        } catch (err) {
          console.error("Auth hydration error:", err);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signup = async (email, password, additionalData) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      const isReferralValid = additionalData.referral?.toUpperCase() === 'LOTTERY777';
      const bonus = isReferralValid ? 50 : 0;

      // Save additional user data to Firestore
      const userData = {
        name: additionalData.name || '',
        mobile: additionalData.mobile || '',
        referral: additionalData.referral || '',
        referralApplied: isReferralValid,
        role: 'user',
        depositedBalance: 0,
        winningBalance: 0,
        bonusBalance: bonus,
        balance: bonus, // Initial total balance
        status: 'Active',
        createdAt: new Date().toISOString()
      };
      
      await setDoc(doc(db, 'users', firebaseUser.uid), userData);
      
      return { success: true };
    } catch (error) {
      console.error("Signup error:", error);
      return { success: false, message: error.message };
    }
  };

  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error) {
      // Special Auto-Provisioning for Default Mock Accounts
      const isDefaultAdmin = email === 'admin@lottery.com' && password === 'admin123';
      const isDefaultUser = email === 'user@lottery.com' && password === 'user123';

      if (isDefaultAdmin || isDefaultUser) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
          console.log(`Auto-provisioning default ${isDefaultAdmin ? 'admin' : 'user'} account...`);
          try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;
            await setDoc(doc(db, 'users', firebaseUser.uid), {
              name: isDefaultAdmin ? 'Super Admin' : 'Test User',
              mobile: isDefaultAdmin ? '0000000000' : '9999999999',
              role: isDefaultAdmin ? 'admin' : 'user',
              balance: isDefaultAdmin ? 999999 : 0,
              status: 'Active',
              createdAt: new Date().toISOString()
            });
            return { success: true };
          } catch (signupError) {
            // If creation fails because user already exists but password was wrong, fall through to wrong password error
            if (signupError.code !== 'auth/email-already-in-use') {
              console.error("Default account setup failed:", signupError);
              return { success: false, message: "Setup failed. Please try again or use Signup." };
            }
          }
        }
      }
      
      console.error("Login error:", error);

      // Check for Mobile Reset Sync
      const mobileMatch = email.match(/^(\d{10})@/);
      if (mobileMatch) {
        const mobile = mobileMatch[1];
        const q = query(collection(db, 'users'), where('mobile', '==', mobile));
        const snap = await getDocs(q);
        
        if (!snap.empty) {
          const userData = snap.docs[0].data();
          // If a temp password exists from an OTP reset, and it matches what was entered
          if (userData.passwordUpdateRequested && userData.tempPassword === password) {
             return { 
               success: false, 
               message: "OTP VERIFICATION SYNC: Your new password is set in the system but needs one-time Admin activation. Please contact support." 
             };
          }
        }
      }

      let message = "Invalid ID or Password. Please try again.";
      if (error.code === 'auth/network-request-failed') message = "Network error. Check your connection.";
      
      return { success: false, message: message };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      // Hard reload to prevent framer-motion AnimatePresence routing bugs
      window.location.href = '/login';
      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      return { success: false, message: error.message };
    }
  };

  const updateBalance = async (amount) => {
    if (!user) return;
    const newBalance = (user.balance || 0) + amount;
    const updatedUser = { ...user, balance: newBalance };
    
    try {
      await setDoc(doc(db, 'users', user.uid), { balance: newBalance }, { merge: true });
      setUser(updatedUser);
    } catch (error) {
      console.error("Update balance error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateBalance, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

