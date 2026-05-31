import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getExpenses, getParticipants, createExpense, deleteExpense } from '../services/api'

function Expenses() {
  const { code } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Form visibility
  const [showForm, setShowForm] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [totalAmount, setTotalAmount] = useState('')
  const [paidBy, setPaidBy] = useState('')
  const [splitType, setSplitType] = useState('equal')
  const [selectedParticipants, setSelectedParticipants] = useState([])
  const [shares, setShares] = useState({}) // { participantId: amount }
  const [formError, setFormError] = useState('')

  // Load expenses and participants
  const { data: expenseData, isLoading: expensesLoading } = useQuery({
    queryKey: ['expenses', code],
    queryFn: () => getExpenses(code),
  })

  // API returns { groupName, totalExpenses, expenses: [...] }
  const expenses = expenseData?.expenses || []

  const { data: participantData } = useQuery({
    queryKey: ['participants', code],
    queryFn: () => getParticipants(code),
  })

  // API returns { totalParticipants, remainingSlots, participants: [...] }
  const participants = participantData?.participants || []

  // Add expense
  const addMutation = useMutation({
    mutationFn: (data) => createExpense(code, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['expenses', code])
      queryClient.invalidateQueries(['group', code])
      resetForm()
    },
    onError: (err) => {
      setFormError(err.response?.data?.message || 'Failed to add expense')
    },
  })

  // Delete expense
  const deleteMutation = useMutation({
    mutationFn: (expenseId) => deleteExpense(code, expenseId),
    onSuccess: () => {
      queryClient.invalidateQueries(['expenses', code])
      queryClient.invalidateQueries(['group', code])
    },
  })

  const resetForm = () => {
    setTitle('')
    setTotalAmount('')
    setPaidBy('')
    setSplitType('equal')
    setSelectedParticipants([])
    setShares({})
    setFormError('')
    setShowForm(false)
  }

  const toggleParticipant = (id) => {
    setSelectedParticipants((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  const handleSubmit = () => {
    if (!title.trim()) return setFormError('Please enter a title')
    if (!totalAmount || isNaN(totalAmount) || parseFloat(totalAmount) < 0.01)
      return setFormError('Amount must be at least ₹0.01')
    if (!paidBy) return setFormError('Please select who paid')
    if (selectedParticipants.length < 2) return setFormError('Select at least 2 participants')

    const payload = {
      title: title.trim(),
      totalAmount: parseFloat(totalAmount),
      paidBy,
      splitType,
      participants: selectedParticipants,
    }

    if (splitType === 'unequal') {
      const sharesData = {}
      for (const id of selectedParticipants) {
        const val = parseFloat(shares[id])
        if (!val || val <= 0) return setFormError(`Enter a valid share for each participant`)
        sharesData[id] = val
      }
      const sharesSum = Object.values(sharesData).reduce((a, b) => a + b, 0)
      if (Math.abs(sharesSum - parseFloat(totalAmount)) > 0.01) {
        return setFormError(`Shares must add up to ₹${totalAmount}`)
      }
      payload.shares = sharesData
    }

    setFormError('')
    addMutation.mutate(payload)
  }


  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(`/groups/${code}`)} className="text-slate-400 hover:text-slate-600">
              <span className="material-symbols-outlined text-xl">arrow_back</span>
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-800">Expenses</h1>
              <p className="text-xs text-slate-400 font-mono tracking-widest">{code}</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1 bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Add
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        {/* Add Expense Form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
            <h2 className="font-semibold text-slate-800">New Expense</h2>

            {formError && (
              <div className="bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm">{formError}</div>
            )}

            {/* Title */}
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Title</label>
              <input
                type="text"
                placeholder="e.g. Dinner at restaurant"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Total Amount (₹)</label>
              <input
                type="number"
                placeholder="0.00"
                min="1"
                step="1"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            {/* Paid By */}
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Paid by</label>
              <select
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400 bg-white capitalize"
              >
                <option value="">Select person</option>
                {participants.map((p) => (
                  <option key={p.id} value={p.id} className="capitalize">{p.name}</option>
                ))}
              </select>
            </div>

            {/* Split Type */}
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Split type</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setSplitType('equal')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition ${
                    splitType === 'equal'
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Equal
                </button>
                <button
                  onClick={() => setSplitType('unequal')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition ${
                    splitType === 'unequal'
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Unequal
                </button>
              </div>
            </div>

            {/* Participants */}
            <div>
              <label className="text-xs font-medium text-slate-500 mb-2 block">Split between</label>
              {participants.length === 0 ? (
                <p className="text-sm text-slate-400">No members yet. Add members first.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {participants.map((p) => {
                    const isSelected = selectedParticipants.includes(p.id)
                    return (
                      <button
                        key={p.id}
                        onClick={() => toggleParticipant(p.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition capitalize ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {p.name}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Custom shares for unequal split */}
            {splitType === 'unequal' && selectedParticipants.length > 0 && (
              <div>
                <label className="text-xs font-medium text-slate-500 mb-2 block">Custom shares</label>
                <div className="space-y-2">
                  {selectedParticipants.map((id) => {
                    const person = participants.find((p) => p.id === id)
                    return (
                      <div key={id} className="flex items-center gap-3">
                        <span className="text-sm text-slate-700 capitalize w-24 truncate">
                          {person?.name}
                        </span>
                        <input
                          type="number"
                          placeholder="0.00"
                          min="1"
                          step="1"
                          value={shares[id] || ''}
                          onChange={(e) => setShares({ ...shares, [id]: e.target.value })}
                          className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Form actions */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSubmit}
                disabled={addMutation.isPending}
                className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50 text-sm"
              >
                {addMutation.isPending ? 'Adding...' : 'Add Expense'}
              </button>
              <button
                onClick={resetForm}
                className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Expenses List */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-50">
            <h2 className="font-semibold text-slate-800">
              All Expenses <span className="text-slate-400 font-normal text-sm">({expenses.length})</span>
            </h2>
          </div>

          {expensesLoading ? (
            <div className="px-5 py-8 text-center text-slate-400 text-sm">Loading...</div>
          ) : expenses.length === 0 ? (
            <div className="px-5 py-8 text-center text-slate-400 text-sm">
              No expenses yet. Add the first one!
            </div>
          ) : (
            <ul className="divide-y divide-slate-50">
              {expenses.map((expense) => (
                <li key={expense.id} className="px-5 py-4 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{expense.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Paid by <span className="capitalize">{expense.payer?.name || 'Unknown'}</span>
                      {' · '}
                      <span className="capitalize">{expense.splitType} split</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-3">
                    <span className="text-sm font-semibold text-indigo-600">
                      ₹{parseFloat(expense.totalAmount).toFixed(2)}
                    </span>
                    <button
                      onClick={() => deleteMutation.mutate(expense.id)}
                      disabled={deleteMutation.isPending}
                      className="text-slate-300 hover:text-red-400 transition"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  )
}

export default Expenses
