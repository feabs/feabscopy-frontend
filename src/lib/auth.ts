
// This is a mock authentication utility.
// In a real application, this would interact with your authentication provider (e.g., Firebase Auth, NextAuth.js).
import type { ActiveCopyAccountInterface } from '@/app/investments/page';
import { addDays } from 'date-fns';

/**
 * Simulates checking the authentication status of a user.
 * Replace this with your actual server-side authentication logic.
 * For example, you might check for a valid session cookie.
 */
export async function checkAuthStatus(): Promise<boolean> {
  // For demonstration purposes, we'll simulate a 50/50 chance of being authenticated.
  // In a real app, this would be a proper check.
  // return Math.random() > 0.5;

  // For stable testing of layouts, let's assume user is initially not authenticated for / and authenticated for /dashboard
  // This function would typically be more sophisticated, checking cookies or tokens.
  // This specific mock will be hard to use for redirect logic in root page.tsx without more context.
  // For now, let's assume it's always return false for the root redirect to /login for now
  return false;
}

export interface VirtualAccount {
  bankName: string;
  accountNumber: string;
  accountName: string;
  reference?: string;
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  bvn?: string;
  bvnPhoneNumber?: string;
  residentialAddress?: string;
  ngnWalletStatus: 'none' | 'created' | 'pending_creation';
  virtualAccountDetails?: VirtualAccount | null;
  kycStatus: 'pending' | 'approved' | 'rejected' | 'none';
  ngnBalance: number;
  usdBalance: number;
  isAdmin?: boolean;
  accumulatedProfit?: number;
  activeCopyAccounts?: ActiveCopyAccountInterface[];
}

const defaultMockAdminUser: UserProfile = {
  id: 'admin-user-001',
  firstName: 'Admin',
  lastName: 'User',
  email: 'admin@feabscopy.com',
  phone: '+2348031234567',
  residentialAddress: '1 Admin Way, Admin City, Nigeria',
  bvn: '12345678901',
  bvnPhoneNumber: '08031234567',
  ngnWalletStatus: 'created',
  virtualAccountDetails: {
    bankName: 'WEMA BANK',
    accountNumber: '9905380079',
    accountName: 'Admin User - FeabsCopy',
    reference: 'URF_MOCK_REFERENCE_123'
  },
  kycStatus: 'approved',
  ngnBalance: 1000000.00,
  usdBalance: 50000.00,
  accumulatedProfit: 0,
  activeCopyAccounts: [],
  isAdmin: true,
};

export async function getCurrentUser(): Promise<UserProfile | null> {
  if (typeof window !== 'undefined') {
    const storedUser = getMockUserFromStorage();
    if (storedUser) return storedUser;
  }
  const mockAdminUser = defaultMockAdminUser;
  if (typeof window !== 'undefined') {
    localStorage.setItem('mockUser', JSON.stringify(mockAdminUser));
  }
  return mockAdminUser;
}

export const updateMockUserInStorage = (updatedProfile: Partial<UserProfile>) => {
  if (typeof window !== 'undefined') {
    const existingUserString = localStorage.getItem('mockUser');
    let userToUpdate: UserProfile | null = null;

    if (existingUserString) {
        try {
            userToUpdate = JSON.parse(existingUserString) as UserProfile;
        } catch (e) {
            console.error("Error parsing mock user from localStorage during update", e);
            userToUpdate = { ...defaultMockAdminUser }; 
        }
    } else {
         userToUpdate = { ...defaultMockAdminUser };
    }

    const mergedUser = {
        ...userToUpdate,
        ...updatedProfile,
        accumulatedProfit: updatedProfile.accumulatedProfit ?? userToUpdate?.accumulatedProfit ?? 0,
        activeCopyAccounts: (updatedProfile.activeCopyAccounts ?? userToUpdate?.activeCopyAccounts ?? []).map(acc => ({
            id: acc.id || `mock_acc_id_${Date.now()}_${Math.random()}`,
            planName: acc.planName || "Unknown Plan",
            investedAmount: acc.investedAmount ?? 0,
            currentCapital: acc.currentCapital ?? (acc.investedAmount ?? 0),
            profitOrLoss: acc.profitOrLoss ?? 0,
            maturityDate: acc.maturityDate || addDays(new Date(), 30).toISOString(),
            status: acc.status || "Active",
            planCopyFactor: acc.planCopyFactor ?? 0.01, 
            startDate: acc.startDate || new Date().toISOString(),
        })),
        ngnBalance: updatedProfile.ngnBalance ?? userToUpdate?.ngnBalance ?? 0,
        usdBalance: updatedProfile.usdBalance ?? userToUpdate?.usdBalance ?? 0,
    } as UserProfile;

    localStorage.setItem('mockUser', JSON.stringify(mergedUser));
    window.dispatchEvent(new StorageEvent('storage', { key: 'mockUser', newValue: JSON.stringify(mergedUser), storageArea: localStorage }));
  }
};

export const getMockUserFromStorage = (): UserProfile | null => {
  if (typeof window !== 'undefined') {
    const userString = localStorage.getItem('mockUser');
    if (userString) {
      try {
        const user = JSON.parse(userString) as UserProfile;
        
        const normalizedActiveAccounts = (user.activeCopyAccounts || []).map((acc: any) => ({ // Use 'any' for potentially malformed acc
          id: acc.id || `mock_acc_id_${Date.now()}_${Math.random()}`,
          planName: acc.planName || "Unknown Plan",
          investedAmount: typeof acc.investedAmount === 'number' ? acc.investedAmount : 0,
          currentCapital: typeof acc.currentCapital === 'number' ? acc.currentCapital : (typeof acc.investedAmount === 'number' ? acc.investedAmount : 0),
          profitOrLoss: typeof acc.profitOrLoss === 'number' ? acc.profitOrLoss : 0,
          maturityDate: acc.maturityDate || addDays(new Date(), 30).toISOString(),
          status: acc.status || "Active",
          planCopyFactor: typeof acc.planCopyFactor === 'number' ? acc.planCopyFactor : 0.01, // Default to 1% plan factor if missing
          startDate: acc.startDate || new Date().toISOString(),
        } as ActiveCopyAccountInterface));

        return {
            ...defaultMockAdminUser, // Start with defaults to ensure all base fields exist
            ...user, // Spread existing user data first
            ngnWalletStatus: user.ngnWalletStatus ?? 'none',
            kycStatus: user.kycStatus ?? 'none',
            ngnBalance: typeof user.ngnBalance === 'number' ? user.ngnBalance : 0,
            usdBalance: typeof user.usdBalance === 'number' ? user.usdBalance : 0,
            accumulatedProfit: typeof user.accumulatedProfit === 'number' ? user.accumulatedProfit : 0,
            activeCopyAccounts: normalizedActiveAccounts,
            isAdmin: typeof user.isAdmin === 'boolean' ? user.isAdmin : false, // Default isAdmin if missing
        };
      } catch (e) {
        console.error("Error parsing mock user from localStorage on get", e);
        const defaultUser = { ...defaultMockAdminUser, activeCopyAccounts: [] };
        localStorage.setItem('mockUser', JSON.stringify(defaultUser));
        return defaultUser;
      }
    } else {
        const defaultUser = { ...defaultMockAdminUser, activeCopyAccounts: [] };
        localStorage.setItem('mockUser', JSON.stringify(defaultUser));
        return defaultUser;
    }
  }
  return null;
};

// Initialize mock user if not present
if (typeof window !== 'undefined' && !localStorage.getItem('mockUser')) {
  localStorage.setItem('mockUser', JSON.stringify({...defaultMockAdminUser, activeCopyAccounts: []}));
}
    
