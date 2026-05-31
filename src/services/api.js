import axios from 'axios'

// All API calls go through this base instance
const api = axios.create({
  baseURL: 'http://localhost:4001/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

// ─── Group APIs ───────────────────────────────────────────────────────────────

export const createGroup = (name) =>
  api.post('/groups', { name }).then((res) => res.data.data)

export const getGroupByCode = (code) =>
  api.get(`/groups/${code}`).then((res) => res.data.data)

// ─── Participant APIs ─────────────────────────────────────────────────────────

export const addParticipant = (code, name) =>
  api.post(`/groups/${code}/participants`, { name }).then((res) => res.data.data)

export const getParticipants = (code) =>
  api.get(`/groups/${code}/participants`).then((res) => res.data.data)

export const updateParticipant = (code, id, name) =>
  api.patch(`/groups/${code}/participants/${id}`, { name }).then((res) => res.data.data)

// ─── Expense APIs ─────────────────────────────────────────────────────────────

export const createExpense = (code, data) =>
  api.post(`/groups/${code}/expenses`, data).then((res) => res.data.data)

export const getExpenses = (code) =>
  api.get(`/groups/${code}/expenses`).then((res) => res.data.data)

export const deleteExpense = (code, expenseId) =>
  api.delete(`/groups/${code}/expenses/${expenseId}`).then((res) => res.data)

// ─── Balance & Settlement APIs ────────────────────────────────────────────────

export const getBalances = (code) =>
  api.get(`/groups/${code}/expenses/balances`).then((res) => res.data.data)

export const getSettlements = (code) =>
  api.get(`/groups/${code}/expenses/settlements`).then((res) => res.data.data)
