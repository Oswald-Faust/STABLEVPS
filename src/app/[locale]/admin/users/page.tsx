"use client";

import { useEffect, useState } from 'react';
import { 
  Users, 
  Search, 
  Edit2,
  User as UserIcon,
  X,
  Eye
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  balance: number;
  subscription?: {
    planId: string;
  };
}

export default function AdminUsers() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.users) setUsers(data.users);
    } catch (error) {
      console.error('Failed to fetch users', error);
    }
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingUser),
      });
      if (res.ok) {
        setEditingUser(null);
        fetchUsers();
      } else {
        alert("Erreur lors de la sauvegarde");
      }
    } catch (error) {
      console.error('Failed to save user', error);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredUsers = users.filter(user => 
    `${user.firstName} ${user.lastName} ${user.email}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-6">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-muted-foreground w-4 h-4" />
          <input 
            type="text" 
            placeholder="Chercher un client..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-full pl-11 pr-4 py-2.5 text-sm md:text-gray-900 dark:text-white focus:outline-none focus:border-green-500/50 transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white dark:text-black font-bold rounded-full transition-all text-sm shadow-lg shadow-green-500/20">
          <Users className="w-4 h-4" />
          Nouveau Client
        </button>
      </div>

      <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-xl transition-colors duration-300">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5">
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-muted-foreground">Client</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-muted-foreground">Role</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-muted-foreground">Solde</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-muted-foreground">Service</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-muted-foreground text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/5">
            {filteredUsers.map(user => (
              <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center border border-gray-200 dark:border-white/10 group-hover:border-green-500/30 transition-colors">
                      <UserIcon className="w-4 h-4 text-green-600 dark:text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-gray-500 dark:text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${user.role === 'admin' ? 'bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-500' : 'bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-400'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 font-mono text-sm text-green-600 dark:text-green-500 font-bold">${user.balance?.toFixed(2) || '0.00'}</td>
                <td className="px-6 py-4">
                  {user.subscription ? (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-xs text-gray-900 dark:text-white capitalize">{user.subscription.planId}</span>
                    </div>
                  ) : <span className="text-xs text-gray-400 dark:text-muted-foreground italic">Aucun</span>}
                </td>
                <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                  <button 
                    onClick={() => router.push(`/admin/users/${user._id}`)}
                    className="p-2 bg-gray-100 dark:bg-white/5 hover:bg-blue-500 hover:text-white rounded-lg transition-all text-gray-500 dark:text-muted-foreground group"
                    title="Voir les détails"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setEditingUser(user)}
                    className="p-2 bg-gray-100 dark:bg-white/5 hover:bg-green-500 hover:text-black rounded-lg transition-all text-gray-500 dark:text-muted-foreground"
                    title="Modifier"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingUser && (
        <div className="fixed inset-0 z-[100] bg-black/20 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl scale-in-center transition-colors duration-300">
            <div className="px-8 py-6 bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/5 flex justify-between items-center transition-colors duration-300">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Modifier l&apos;utilisateur</h3>
              <button 
                onClick={() => setEditingUser(null)} 
                className="w-8 h-8 rounded-full bg-gray-200 dark:bg-white/5 flex items-center justify-center hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-500/20 dark:hover:text-red-500 transition-all text-gray-500 dark:text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-8 grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-muted-foreground ml-1">Prénom</label>
                <input 
                  type="text" 
                  value={editingUser.firstName}
                  onChange={(e) => setEditingUser({...editingUser, firstName: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-green-500/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-muted-foreground ml-1">Nom</label>
                <input 
                  type="text" 
                  value={editingUser.lastName}
                  onChange={(e) => setEditingUser({...editingUser, lastName: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-green-500/50"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-muted-foreground ml-1">Email</label>
                <input 
                  type="email" 
                  value={editingUser.email}
                  disabled
                  className="w-full bg-gray-100 dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm text-gray-500 dark:text-gray-400 opacity-50 cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-muted-foreground ml-1">Solde ($)</label>
                <input 
                  type="number" 
                  value={editingUser.balance}
                  onChange={(e) => setEditingUser({...editingUser, balance: parseFloat(e.target.value)})}
                  className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500/50 font-bold text-green-600 dark:text-green-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-muted-foreground ml-1">Role</label>
                <select 
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500/50 text-gray-900 dark:text-white appearance-none"
                >
                  <option value="user" className="bg-white dark:bg-[#111111]">Utilisateur Standard</option>
                  <option value="admin" className="bg-white dark:bg-[#111111]">Administrateur</option>
                </select>
              </div>
            </div>

            <div className="p-8 pt-0 flex gap-4">
              <button 
                onClick={() => setEditingUser(null)}
                className="flex-1 py-4 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 font-bold rounded-2xl transition-all text-gray-900 dark:text-white"
              >
                Annuler
              </button>
              <button 
                onClick={handleSaveUser}
                disabled={isSaving}
                className="flex-1 py-4 bg-green-600 dark:bg-green-500 hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 text-white dark:text-black font-bold rounded-2xl transition-all shadow-lg shadow-green-500/20"
              >
                {isSaving ? "Sauvegarde..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
