import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getGroupByCode } from '../services/api'

function Dashboard() {
  const { code } = useParams()
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const { data: group, isLoading, error } = useQuery({
    queryKey: ['group', code],
    queryFn: () => getGroupByCode(code),
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">Loading group...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <p className="text-red-500">Group not found.</p>
        <button onClick={() => navigate('/')} className="text-indigo-600 underline text-sm">
          Go back home
        </button>
      </div>
    )
  }

  const totalExpenses = group.expenses?.length || 0
  const totalAmount = group.expenses?.reduce((sum, e) => sum + parseFloat(e.total_amount || 0), 0) || 0
  const totalParticipants = group.participants?.length || 0
  const recentExpenses = group.expenses?.slice(0, 5) || []

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="text-slate-400 hover:text-slate-600">
              <span className="material-symbols-outlined text-xl">arrow_back</span>
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-800">{group.name}</h1>
              <p className="text-xs text-slate-400 tracking-widest font-mono">{group.code}</p>
            </div>
          </div>
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border transition ${
              copied
                ? 'bg-green-50 text-green-600 border-green-200'
                : 'text-indigo-600 border-indigo-200 hover:bg-indigo-50'
            }`}
          >
            <span className="material-symbols-outlined text-base">
              {copied ? 'check' : 'content_copy'}
            </span>
            {copied ? 'Copied!' : 'Copy Code'}
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
            <p className="text-2xl font-bold text-indigo-600">{totalParticipants}</p>
            <p className="text-xs text-slate-500 mt-1">Members</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
            <p className="text-2xl font-bold text-indigo-600">{totalExpenses}</p>
            <p className="text-xs text-slate-500 mt-1">Expenses</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
            <p className="text-2xl font-bold text-indigo-600">₹{totalAmount.toFixed(0)}</p>
            <p className="text-xs text-slate-500 mt-1">Total Spent</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Link
            to={`/groups/${code}/expenses`}
            className="bg-indigo-600 text-white rounded-2xl p-4 flex items-center gap-3 hover:bg-indigo-700 transition"
          >
            <span className="material-symbols-outlined text-2xl">receipt_long</span>
            <div>
              <p className="font-semibold text-sm">Expenses</p>
              <p className="text-xs text-indigo-200">View & add</p>
            </div>
          </Link>
          <Link
            to={`/groups/${code}/balances`}
            className="bg-white border border-slate-100 shadow-sm rounded-2xl p-4 flex items-center gap-3 hover:bg-slate-50 transition"
          >
            <span className="material-symbols-outlined text-2xl text-indigo-500">bar_chart</span>
            <div>
              <p className="font-semibold text-sm text-slate-800">Balances</p>
              <p className="text-xs text-slate-400">Who owes who</p>
            </div>
          </Link>
          <Link
            to={`/groups/${code}/settlements`}
            className="bg-white border border-slate-100 shadow-sm rounded-2xl p-4 flex items-center gap-3 hover:bg-slate-50 transition"
          >
            <span className="material-symbols-outlined text-2xl text-green-500">handshake</span>
            <div>
              <p className="font-semibold text-sm text-slate-800">Settlements</p>
              <p className="text-xs text-slate-400">Settle up</p>
            </div>
          </Link>
          <Link
            to={`/groups/${code}/participants`}
            className="bg-white border border-slate-100 shadow-sm rounded-2xl p-4 flex items-center gap-3 hover:bg-slate-50 transition"
          >
            <span className="material-symbols-outlined text-2xl text-purple-500">group</span>
            <div>
              <p className="font-semibold text-sm text-slate-800">Members</p>
              <p className="text-xs text-slate-400">Manage people</p>
            </div>
          </Link>
        </div>

        {/* Recent Expenses */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
            <h2 className="font-semibold text-slate-800">Recent Expenses</h2>
            <Link to={`/groups/${code}/expenses`} className="text-xs text-indigo-600 hover:underline">
              See all
            </Link>
          </div>
          {recentExpenses.length === 0 ? (
            <div className="px-5 py-8 text-center text-slate-400 text-sm">
              No expenses yet. Add the first one!
            </div>
          ) : (
            <ul className="divide-y divide-slate-50">
              {recentExpenses.map((expense) => {
                const payer = group.participants?.find((p) => p.id === expense.paid_by)
                return (
                  <li key={expense.id} className="px-5 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{expense.title}</p>
                      <p className="text-xs text-slate-400">
                        Paid by {payer?.name || 'Unknown'}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-indigo-600">
                      ₹{parseFloat(expense.total_amount).toFixed(2)}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Members */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
            <h2 className="font-semibold text-slate-800">Members</h2>
            <Link to={`/groups/${code}/participants`} className="text-xs text-indigo-600 hover:underline">
              Manage
            </Link>
          </div>
          {group.participants?.length === 0 ? (
            <div className="px-5 py-8 text-center text-slate-400 text-sm">
              No members yet. Add people to split expenses.
            </div>
          ) : (
            <div className="px-5 py-4 flex flex-wrap gap-2">
              {group.participants?.map((p) => (
                <span
                  key={p.id}
                  className="bg-indigo-50 text-indigo-700 text-xs font-medium px-3 py-1.5 rounded-full capitalize"
                >
                  {p.name}
                </span>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default Dashboard
