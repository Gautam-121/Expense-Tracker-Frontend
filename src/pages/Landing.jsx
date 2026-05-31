import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createGroup, getGroupByCode } from '../services/api'

function Landing() {
  const navigate = useNavigate()

  const [groupName, setGroupName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Create a new group and go to its dashboard
  const handleCreate = async () => {
    if (!groupName.trim()) return setError('Please enter a group name')
    setLoading(true)
    setError('')
    try {
      const group = await createGroup(groupName.trim())
      navigate(`/groups/${group.code}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create group')
    } finally {
      setLoading(false)
    }
  }

  // Join an existing group by code
  const handleJoin = async () => {
    if (!joinCode.trim()) return setError('Please enter a group code')
    setLoading(true)
    setError('')
    try {
      await getGroupByCode(joinCode.trim().toUpperCase())
      navigate(`/groups/${joinCode.trim().toUpperCase()}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Group not found')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">

      {/* Logo + Title */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-white text-3xl">receipt_long</span>
        </div>
        <h1 className="text-4xl font-bold text-slate-800">SplitEase</h1>
        <p className="text-slate-500 mt-2 text-lg">Split expenses with friends. Settle up instantly.</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm">{error}</div>
      )}

      {/* Cards */}
      <div className="flex flex-col md:flex-row gap-6 w-full max-w-2xl">

        {/* Create Group */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Create a Group</h2>
          <input
            type="text"
            placeholder="e.g. Trip to Goa"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm mb-4 outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Group'}
          </button>
        </div>

        {/* Join Group */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Join a Group</h2>
          <input
            type="text"
            placeholder="Enter group code e.g. H3PVH2N6"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
            className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm mb-4 outline-none focus:ring-2 focus:ring-indigo-400 uppercase tracking-widest"
          />
          <button
            onClick={handleJoin}
            disabled={loading}
            className="w-full border border-indigo-600 text-indigo-600 py-2 rounded-lg font-medium hover:bg-indigo-50 transition disabled:opacity-50"
          >
            {loading ? 'Joining...' : 'Join Group'}
          </button>
        </div>

      </div>

      {/* Feature Hints */}
      <div className="flex gap-6 mt-10 text-center text-slate-500 text-sm">
        <div className="flex flex-col items-center gap-1">
          <span className="material-symbols-outlined text-indigo-400">add_card</span>
          <span>Add Expenses</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="material-symbols-outlined text-indigo-400">bar_chart</span>
          <span>Track Balances</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="material-symbols-outlined text-indigo-400">handshake</span>
          <span>Settle Up</span>
        </div>
      </div>

    </div>
  )
}

export default Landing
