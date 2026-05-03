import React from 'react'
import { useAuthStore } from '../store/authStore'

const Profile = () => {
  const { user } = useAuthStore()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-slate-900">Mon Profil</h1>
      <div className="bg-white p-8 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 text-2xl font-bold">
            {user?.full_name?.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{user?.full_name}</h2>
            <p className="text-slate-500">{user?.email}</p>
            <span className="mt-2 inline-block px-2 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-md uppercase">
              {user?.role}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
