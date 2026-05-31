import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getBalances } from '../services/api'

function Balances() {
  const { code } = useParams()
  const navigate = useNavigate()

  const { data, isLoading, error } = useQuery({
    queryKey: ['balances', code],
    queryFn: () => getBalances(code),
  })

  // API returns { groupName, balances: [...] }
  const balances = data?.balances || []

  // Separate into who owes (negative) and who is owed (positive)
  const creditors = balances.filter((b) => parseFloat(b.balance) > 0)
  const debtors = balances.filter((b) => parseFloat(b.balance) < 0)
  const settled = balances.filter((b) => parseFloat(b.balance) === 0)

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate(`/groups/${code}`)} className="text-slate-400 hover:text-slate-600">
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-800">Balances</h1>
            <p className="text-xs text-slate-400 font-mono tracking-widest">{code}</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {isLoading && (
          <div className="text-center text-slate-400 py-10 text-sm">Loading balances...</div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">
            Failed to load balances.
          </div>
        )}

        {!isLoading && balances.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-10 text-center text-slate-400 text-sm">
            No expenses added yet. Add expenses to see balances.
          </div>
        )}

        {/* People who are owed money */}
        {creditors.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="px-5 py-4 border-b border-slate-50 flex items-center gap-2">
              <span className="material-symbols-outlined text-green-500 text-base">trending_up</span>
              <h2 className="font-semibold text-slate-800">Gets Back</h2>
            </div>
            <ul className="divide-y divide-slate-50">
              {creditors.map((b) => (
                <li key={b.participantId} className="px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-sm font-semibold capitalize">
                        {b.name.charAt(0)}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-slate-800 capitalize">{b.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-green-600">
                    +₹{parseFloat(b.balance).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* People who owe money */}
        {debtors.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="px-5 py-4 border-b border-slate-50 flex items-center gap-2">
              <span className="material-symbols-outlined text-red-400 text-base">trending_down</span>
              <h2 className="font-semibold text-slate-800">Owes Money</h2>
            </div>
            <ul className="divide-y divide-slate-50">
              {debtors.map((b) => (
                <li key={b.participantId} className="px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-red-500 text-sm font-semibold capitalize">
                        {b.name.charAt(0)}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-slate-800 capitalize">{b.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-red-500">
                    -₹{Math.abs(parseFloat(b.balance)).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* People who are all settled */}
        {settled.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="px-5 py-4 border-b border-slate-50 flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-400 text-base">check_circle</span>
              <h2 className="font-semibold text-slate-800">All Settled</h2>
            </div>
            <ul className="divide-y divide-slate-50">
              {settled.map((b) => (
                <li key={b.participantId} className="px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                      <span className="text-slate-500 text-sm font-semibold capitalize">
                        {b.name.charAt(0)}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-slate-500 capitalize">{b.name}</span>
                  </div>
                  <span className="text-sm text-slate-400">₹0.00</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Go to settlements */}
        {!isLoading && balances.length > 0 && (
          <button
            onClick={() => navigate(`/groups/${code}/settlements`)}
            className="w-full bg-indigo-600 text-white py-3 rounded-2xl font-medium hover:bg-indigo-700 transition flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-base">handshake</span>
            View Settlement Plan
          </button>
        )}

      </div>
    </div>
  )
}

export default Balances
