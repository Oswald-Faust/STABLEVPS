"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  subscription: {
    planId: string;
    status: string;
    billingCycle: string;
    currentPeriodEnd?: string;
  };
  vps: {
    status: string;
    ipAddress?: string;
    rdpUsername?: string;
    rdpPassword?: string;
    location: string;
  };
  createdAt: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'settings'>('overview');
  const [editFormData, setEditFormData] = useState({
    ipAddress: '',
    rdpUsername: '',
    rdpPassword: '',
    status: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.status === 403 || response.status === 401) {
        router.push('/login');
        return;
      }
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setEditFormData({
      ipAddress: user.vps?.ipAddress || '',
      rdpUsername: user.vps?.rdpUsername || 'Administrator',
      rdpPassword: user.vps?.rdpPassword || '',
      status: user.vps?.status || 'provisioning',
    });
  };

  const handleSave = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`/api/admin/users/${selectedUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vps: {
            ...selectedUser.vps,
            ipAddress: editFormData.ipAddress,
            rdpUsername: editFormData.rdpUsername,
            rdpPassword: editFormData.rdpPassword,
            status: editFormData.status,
          },
        }),
      });

      if (response.ok) {
        setUsers(users.map(u => u._id === selectedUser._id ? {
          ...u,
          vps: { ...u.vps, ...editFormData }
        } : u));
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Failed to update user', error);
    }
  };

  const SidebarItem = ({ id, label, icon }: { id: typeof activeTab, label: string, icon: React.ReactNode }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        activeTab === id
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );

  if (loading) return <div className="min-h-screen bg-black text-white p-8 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" /></div>;

  return (
    <div className="min-h-screen bg-black flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex-shrink-0 hidden lg:flex flex-col">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
               <span className="text-xl">🛡️</span>
             </div>
             <span className="text-xl font-bold text-white">AdminPanel</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <SidebarItem 
            id="overview" 
            label="Overview" 
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>} 
          />
          <SidebarItem 
            id="users" 
            label="Users" 
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>} 
          />
          <SidebarItem 
            id="settings" 
            label="Settings" 
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} 
          />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-black">
        <header className="bg-gray-900/50 backdrop-blur-md border-b border-gray-800 sticky top-0 z-40">
           <div className="container mx-auto px-6 py-4 flex justify-between items-center">
              <h1 className="text-xl font-semibold text-white capitalize">
                {activeTab}
              </h1>
              <div className="flex items-center gap-4">
                 <span className="text-gray-400 text-sm">Welcome back, Admin</span>
              </div>
           </div>
        </header>

        <div className="container mx-auto px-6 py-8">
           {activeTab === 'overview' && (
              <div className="space-y-6">
                 {/* Stats Cards */}
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass-card bg-gray-900 border border-gray-800 rounded-xl p-6">
                       <p className="text-gray-400 text-sm font-medium mb-1">Total Users</p>
                       <p className="text-3xl font-bold text-white">{users.length}</p>
                    </div>
                    <div className="glass-card bg-gray-900 border border-gray-800 rounded-xl p-6">
                       <p className="text-gray-400 text-sm font-medium mb-1">Active VPS</p>
                       <p className="text-3xl font-bold text-green-500">
                          {users.filter(u => u.vps?.status === 'active').length}
                       </p>
                    </div>
                    <div className="glass-card bg-gray-900 border border-gray-800 rounded-xl p-6">
                       <p className="text-gray-400 text-sm font-medium mb-1">Pending Provisioning</p>
                       <p className="text-3xl font-bold text-yellow-500">
                          {users.filter(u => u.vps?.status === 'provisioning').length}
                       </p>
                    </div>
                 </div>
              </div>
           )}

           {activeTab === 'users' && (
             <div className="glass-card bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                   <h2 className="text-lg font-semibold text-white">Users Management</h2>
                   <input type="text" placeholder="Search user..." className="bg-gray-950 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="bg-gray-950 border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
                     <th className="p-4 font-medium">User</th>
                     <th className="p-4 font-medium">Plan</th>
                     <th className="p-4 font-medium">Status</th>
                     <th className="p-4 font-medium">VPS Info</th>
                     <th className="p-4 font-medium text-right">Actions</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-800">
                   {users.map((user) => (
                     <tr key={user._id} className="hover:bg-gray-800/50 transition-colors">
                       <td className="p-4">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center font-bold text-xs">
                               {user.firstName[0]}{user.lastName[0]}
                            </div>
                            <div>
                               <p className="font-medium text-white text-sm">{user.firstName} {user.lastName}</p>
                               <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                         </div>
                       </td>
                       <td className="p-4">
                         <span className="uppercase font-bold text-xs text-blue-400 bg-blue-400/10 px-2 py-1 rounded">{user.subscription?.planId}</span>
                         <p className="text-xs text-gray-500 capitalize mt-1">{user.subscription?.billingCycle}</p>
                       </td>
                       <td className="p-4">
                         <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                           user.subscription?.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                         }`}>
                           <span className={`w-1.5 h-1.5 rounded-full ${user.subscription?.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                           {user.subscription?.status}
                         </span>
                       </td>
                       <td className="p-4">
                         {user.vps?.ipAddress ? (
                           <div>
                             <p className="text-sm text-white font-mono">{user.vps.ipAddress}</p>
                             <p className={`text-xs ${
                               user.vps.status === 'active' ? 'text-green-400' : 'text-yellow-400'
                             } capitalize`}>
                               {user.vps.status}
                             </p>
                           </div>
                         ) : (
                           <span className="text-gray-600 italic text-sm">Not provisioned</span>
                         )}
                       </td>
                       <td className="p-4 text-right">
                         <button
                           onClick={() => handleEditClick(user)}
                           className="px-3 py-1.5 border border-gray-700 hover:bg-gray-800 rounded-lg text-xs font-medium text-white transition-colors"
                         >
                           Manage
                         </button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           )}

            {/* Edit Modal */}
            {selectedUser && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
                  <div className="flex justify-between items-center mb-6">
                     <h2 className="text-xl font-bold text-white">Manage VPS</h2>
                     <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-white">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                     </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Status</label>
                      <select
                        value={editFormData.status}
                        onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                        className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      >
                        <option value="provisioning">Provisioning</option>
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                        <option value="terminated">Terminated</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">IP Address</label>
                      <input
                        type="text"
                        value={editFormData.ipAddress}
                        onChange={(e) => setEditFormData({ ...editFormData, ipAddress: e.target.value })}
                        placeholder="192.168.1.1"
                        className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">RDP Username</label>
                      <input
                        type="text"
                        value={editFormData.rdpUsername}
                        onChange={(e) => setEditFormData({ ...editFormData, rdpUsername: e.target.value })}
                        placeholder="Administrator"
                        className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">RDP Password</label>
                      <input
                        type="text"
                        value={editFormData.rdpPassword}
                        onChange={(e) => setEditFormData({ ...editFormData, rdpPassword: e.target.value })}
                        placeholder="SecretPassword"
                        className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-8">
                    <button
                      onClick={() => setSelectedUser(null)}
                      className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-colors font-medium text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors font-medium text-sm shadow-lg shadow-blue-500/20"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}
        </div>
      </main>
    </div>
  );
}
