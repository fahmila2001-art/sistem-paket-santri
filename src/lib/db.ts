import { Package, Profile } from './types';

const PACKAGES_KEY = 'sistem_paket_santri_packages';
const PROFILES_KEY = 'sistem_paket_santri_profiles';
const SESSION_KEY = 'sistem_paket_santri_session';

// Initialize with some dummy data if empty
function initializeData() {
  if (!localStorage.getItem(PACKAGES_KEY)) {
    const dummyPackages: Package[] = [
      {
        id: '1',
        recipient_name: 'Ahmad Santoso',
        recipient_room: 'Kamar 12',
        sender_name: 'Budi (Ayah)',
        sender_relation: 'Orang Tua',
        contents: 'Makanan dan Pakaian',
        received_at: new Date(Date.now() - 100000000).toISOString(),
        received_by: 'satpam_1',
        notes: null,
        picked_up_by: null,
        pickup_method: null,
        picker_name: null,
        picker_relation: null,
        picked_up_at: null,
        status: 'masuk',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '2',
        recipient_name: 'Zaki Rabbani',
        recipient_room: 'Kamar 15',
        sender_name: 'Shopee',
        sender_relation: 'Kurir',
        contents: 'Buku Pelajaran',
        received_at: new Date(Date.now() - 200000000).toISOString(),
        received_by: 'satpam_1',
        notes: null,
        picked_up_by: 'Zaki Rabbani',
        pickup_method: 'pemilik',
        picker_name: null,
        picker_relation: null,
        picked_up_at: new Date().toISOString(),
        status: 'diambil',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ];
    localStorage.setItem(PACKAGES_KEY, JSON.stringify(dummyPackages));
  }

  if (!localStorage.getItem(PROFILES_KEY)) {
    const dummyProfile: Profile = {
      id: 'satpam_1',
      full_name: 'Pak Satpam (Dummy)',
      role: 'satpam',
      created_at: new Date().toISOString(),
    };
    localStorage.setItem(PROFILES_KEY, JSON.stringify([dummyProfile]));
  }
}

initializeData();

export const db = {
  getPackages: async () => {
    const data = localStorage.getItem(PACKAGES_KEY);
    return JSON.parse(data || '[]') as Package[];
  },
  
  insertPackage: async (pkg: Partial<Package>) => {
    const packages = await db.getPackages();
    const newPackage: Package = {
      ...pkg,
      id: Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as Package;
    packages.push(newPackage);
    localStorage.setItem(PACKAGES_KEY, JSON.stringify(packages));
    return { data: newPackage, error: null };
  },

  updatePackage: async (id: string, updates: Partial<Package>) => {
    const packages = await db.getPackages();
    const index = packages.findIndex(p => p.id === id);
    if (index === -1) return { error: 'Not found' };
    
    packages[index] = { ...packages[index], ...updates, updated_at: new Date().toISOString() };
    localStorage.setItem(PACKAGES_KEY, JSON.stringify(packages));
    return { data: packages[index], error: null };
  },

  // Mock Auth
  auth: {
    signIn: async ({ email, password }: { email: string, password?: string }) => {
      // Allow any email to login for dummy purposes
      const user = { id: 'satpam_1', email };
      localStorage.setItem(SESSION_KEY, JSON.stringify({ user }));
      return { data: { user }, error: null };
    },
    signUp: async ({ email, password }: { email: string, password?: string }) => {
      const user = { id: 'satpam_1', email };
      localStorage.setItem(SESSION_KEY, JSON.stringify({ user }));
      return { data: { user }, error: null };
    },
    signOut: async () => {
      localStorage.removeItem(SESSION_KEY);
      return { error: null };
    },
    getSession: async () => {
      const session = localStorage.getItem(SESSION_KEY);
      return { data: { session: session ? JSON.parse(session) : null } };
    },
    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      // Mock subscription
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
  },

  // Mock Profiles
  getProfile: async (userId: string) => {
    const data = localStorage.getItem(PROFILES_KEY);
    const profiles = JSON.parse(data || '[]') as Profile[];
    const profile = profiles.find(p => p.id === userId);
    return { data: profile || null, error: null };
  }
};
