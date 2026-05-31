import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getParticipants, addParticipant, updateParticipant } from '../services/api'

function Participants() {
  const { code } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [error, setError] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['participants', code],
    queryFn: () => getParticipants(code),
  })

  // API returns { groupName, totalParticipants, remainingSlots, participants: [...] }
  const participants = data?.participants || []
  const remainingSlots = data?.remainingSlots ?? null

  // Add new participant
  const addMutation = useMutation({
    mutationFn: (name) => addParticipant(code, name),
    onSuccess: () => {
      queryClient.invalidateQueries(['participants', code])
      queryClient.invalidateQueries(['group', code])
      setNewName('')
      setError('')
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Failed to add member')
    },
  })

  // Rename participant
  const renameMutation = useMutation({
    mutationFn: ({ id, name }) => updateParticipant(code, id, name),
    onSuccess: () => {
      queryClient.invalidateQueries(['participants', code])
      queryClient.invalidateQueries(['group', code])
      setEditingId(null)
      setEditName('')
      setError('')
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Failed to rename member')
    },
  })

  const handleAdd = () => {
    if (!newName.trim()) return setError('Please enter a name')
    addMutation.mutate(newName.trim())
  }

  const handleRenameStart = (participant) => {
    setEditingId(participant.id)
    setEditName(participant.name)
    setError('')
  }

  const handleRenameSave = () => {
    if (!editName.trim()) return setError('Name cannot be empty')
    renameMutation.mutate({ id: editingId, name: editName.trim() })
  }

  const handleRenameCancel = () => {
    setEditingId(null)
    setEditName('')
    setError('')
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate(`/groups/${code}`)} className="text-slate-400 hover:text-slate-600">
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-800">Members</h1>
            <p className="text-xs text-slate-400 font-mono tracking-widest">{code}</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* Add Member */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="font-semibold text-slate-800 mb-3">Add Member</h2>
          {error && (
            <div className="mb-3 bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm">{error}</div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              className="flex-1 border border-slate-200 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <button
              onClick={handleAdd}
              disabled={addMutation.isPending}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {addMutation.isPending ? 'Adding...' : 'Add'}
            </button>
          </div>
        </div>

        {/* Members List */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-50">
            <h2 className="font-semibold text-slate-800">
              Members <span className="text-slate-400 font-normal text-sm">({participants.length})</span>
            </h2>
            {remainingSlots !== null && (
              <span className="text-xs text-slate-400">{remainingSlots} slots left</span>
            )}
          </div>

          {isLoading ? (
            <div className="px-5 py-8 text-center text-slate-400 text-sm">Loading...</div>
          ) : participants.length === 0 ? (
            <div className="px-5 py-8 text-center text-slate-400 text-sm">
              No members yet. Add the first one above.
            </div>
          ) : (
            <ul className="divide-y divide-slate-50">
              {participants.map((participant) => (
                <li key={participant.id} className="px-5 py-3">
                  {editingId === participant.id ? (
                    // Edit mode
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRenameSave()
                          if (e.key === 'Escape') handleRenameCancel()
                        }}
                        autoFocus
                        className="flex-1 border border-indigo-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
                      />
                      <button
                        onClick={handleRenameSave}
                        disabled={renameMutation.isPending}
                        className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-indigo-700 transition disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleRenameCancel}
                        className="text-slate-400 hover:text-slate-600 px-2 py-1.5 rounded-lg text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    // View mode
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-indigo-600 text-sm font-semibold capitalize">
                            {participant.name.charAt(0)}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-slate-800 capitalize">
                          {participant.name}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRenameStart(participant)}
                        className="text-slate-400 hover:text-indigo-600 transition"
                      >
                        <span className="material-symbols-outlined text-base">edit</span>
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  )
}

export default Participants
