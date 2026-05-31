import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getSettlements } from '../services/api'

function Settlements() {
  const { code } = useParams()
  const navigate = useNavigate()

  const { data, isLoading, error } = useQuery({
    queryKey: ['settlements', code],
    queryFn: () => getSettlements(code),
  })

  // API returns { groupName, transactions: [...] }
  const settlements = data?.transactions || []

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate(`/groups/${code}`)} className="text-slate-400 hover:text-slate-600">
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-800">Settlements</h1>
            <p className="text-xs text-slate-400 font-mono tracking-widest">{code}</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        {/* Info Banner */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl px-4 py-3 flex items-start gap-3">
          <span className="material-symbols-outlined text-indigo-400 text-base mt-0.5">info</span>
          <p className="text-xs text-indigo-600 leading-relaxed">
            This is the minimum number of payments needed to settle all debts in the group.
          </p>
        </div>

        {isLoading && (
          <div className="text-center text-slate-400 py-10 text-sm">Calculating settlements...</div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">
            Failed to load settlements.
          </div>
        )}

        {/* All settled */}
        {!isLoading && settlements.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-12 text-center">
            <span className="material-symbols-outlined text-5xl text-green-400 block mb-3">
              check_circle
            </span>
            <p className="font-semibold text-slate-800 mb-1">All Settled Up!</p>
            <p className="text-sm text-slate-400">
              Everyone is even. No payments needed.
            </p>
          </div>
        )}

        {/* Settlement list */}
        {settlements.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="px-5 py-4 border-b border-slate-50">
              <h2 className="font-semibold text-slate-800">
                Payment Plan
                <span className="ml-2 text-sm font-normal text-slate-400">
                  ({settlements.length} transaction{settlements.length !== 1 ? 's' : ''})
                </span>
              </h2>
            </div>
            <ul className="divide-y divide-slate-50">
              {settlements.map((s, index) => (
                <li key={index} className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    {/* From (payer) */}
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex-shrink-0 flex items-center justify-center">
                        <span className="text-red-500 text-sm font-semibold capitalize">
                          {s.from.name.charAt(0)}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-slate-800 capitalize truncate">
                        {s.from.name}
                      </span>
                    </div>

                    {/* Arrow + Amount */}
                    <div className="flex flex-col items-center flex-shrink-0 px-2">
                      <span className="text-xs font-semibold text-indigo-600 mb-0.5">
                        ₹{parseFloat(s.amount).toFixed(2)}
                      </span>
                      <span className="material-symbols-outlined text-slate-400 text-base">
                        arrow_forward
                      </span>
                    </div>

                    {/* To (receiver) */}
                    <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                      <span className="text-sm font-medium text-slate-800 capitalize truncate text-right">
                        {s.to.name}
                      </span>
                      <div className="w-8 h-8 bg-green-100 rounded-full flex-shrink-0 flex items-center justify-center">
                        <span className="text-green-600 text-sm font-semibold capitalize">
                          {s.to.name.charAt(0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Back to Balances */}
        <button
          onClick={() => navigate(`/groups/${code}/balances`)}
          className="w-full border border-slate-200 text-slate-600 py-3 rounded-2xl font-medium hover:bg-slate-100 transition text-sm"
        >
          View Balances
        </button>

      </div>
    </div>
  )
}

export default Settlements
