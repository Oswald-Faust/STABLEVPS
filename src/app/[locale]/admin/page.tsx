"use client";

import { useEffect, useState } from 'react';
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

  if (loading) return <div className="min-h-screen bg-black text-white p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <span className="text-green-500">🛡️</span> Admin Panel
        </h1>

        <div className="glass-card rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-900 border-b border-gray-800 text-gray-400 text-sm">
                <th className="p-4">User</th>
                <th className="p-4">Plan</th>
                <th className="p-4">Status</th>
                <th className="p-4">VPS Info</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-900/50 transition-colors">
                  <td className="p-4">
                    <p className="font-medium text-white">{user.firstName} {user.lastName}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <p className="text-xs text-gray-600 mt-1">Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
                  </td>
                  <td className="p-4">
                    <span className="uppercase font-bold text-sm text-white">{user.subscription?.planId}</span>
                    <p className="text-xs text-gray-500 capitalize">{user.subscription?.billingCycle}</p>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      user.subscription?.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
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
                          ● {user.vps.status}
                        </p>
                      </div>
                    ) : (
                      <span className="text-gray-600 italic">Not provisioned</span>
                    )}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleEditClick(user)}
                      className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-sm text-white transition-colors"
                    >
                      Manage VPS
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold text-white mb-6">Manage VPS for {selectedUser.firstName}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-green-500"
                >
                  <option value="provisioning">Provisioning</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="terminated">Terminated</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">IP Address</label>
                <input
                  type="text"
                  value={editFormData.ipAddress}
                  onChange={(e) => setEditFormData({ ...editFormData, ipAddress: e.target.value })}
                  placeholder="192.168.1.1"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">RDP Username</label>
                <input
                  type="text"
                  value={editFormData.rdpUsername}
                  onChange={(e) => setEditFormData({ ...editFormData, rdpUsername: e.target.value })}
                  placeholder="Administrator"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">RDP Password</label>
                <input
                  type="text"
                  value={editFormData.rdpPassword}
                  onChange={(e) => setEditFormData({ ...editFormData, rdpPassword: e.target.value })}
                  placeholder="SecretPassword"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-green-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setSelectedUser(null)}
                className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl transition-colors font-medium"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
