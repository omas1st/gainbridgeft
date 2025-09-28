import React, { useEffect, useState } from 'react'
import backend from '../../services/api'
import '../../styles/TransactionHistory.css'
import { useAuth } from '../../contexts/AuthContext'

export default function TransactionHistory(){
  const { user } = useAuth()
  const [txs, setTxs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(()=>{
    async function load(){
      try{
        const { data } = await backend.get(`/users/${user.id}/transactions`)
        setTxs(data.transactions || [])
      }catch(e){
        console.warn('Error loading transactions:', e)
        setTxs([])
      } finally {
        setLoading(false)
      }
    }
    load()
  },[user])

  // Filter transactions
  const filteredTxs = txs.filter(tx => {
    if (filter === 'all') return true
    return tx.type?.toLowerCase().includes(filter.toLowerCase())
  })

  // Calculate summary
  const totalDeposits = txs
    .filter(tx => tx.type?.toLowerCase().includes('deposit'))
    .reduce((sum, tx) => sum + Number(tx.amount || 0), 0)
  
  const totalWithdrawals = txs
    .filter(tx => tx.type?.toLowerCase().includes('withdraw'))
    .reduce((sum, tx) => sum + Number(tx.amount || 0), 0)

  const getTransactionIcon = (type) => {
    if (type?.toLowerCase().includes('deposit')) return '💰'
    if (type?.toLowerCase().includes('withdraw')) return '💳'
    if (type?.toLowerCase().includes('invest')) return '📈'
    if (type?.toLowerCase().includes('referral')) return '👥'
    return '📊'
  }

  const getStatusClass = (status) => {
    if (status?.toLowerCase().includes('complete')) return 'status-completed'
    if (status?.toLowerCase().includes('pending')) return 'status-pending'
    if (status?.toLowerCase().includes('fail')) return 'status-failed'
    if (status?.toLowerCase().includes('process')) return 'status-processing'
    return 'status-pending'
  }

  return (
    <div className="transaction-container">
      {/* Header Section */}
      <div className="transaction-header">
        <h1 className="transaction-title">Transaction History</h1>
        <p className="transaction-subtitle">Track all your financial activities</p>
      </div>

      <div className="transaction-card">
        {/* Transaction Summary */}
        <div className="transaction-summary">
          <div className="summary-item">
            <div className="summary-value">{txs.length}</div>
            <div className="summary-label">Total Transactions</div>
          </div>
          <div className="summary-item">
            <div className="summary-value positive">${totalDeposits.toFixed(2)}</div>
            <div className="summary-label">Total Deposits</div>
          </div>
          <div className="summary-item">
            <div className="summary-value negative">${totalWithdrawals.toFixed(2)}</div>
            <div className="summary-label">Total Withdrawals</div>
          </div>
        </div>

        {/* Filters */}
        <div className="transaction-filters">
          <div className="filter-title">📊 Filter Transactions</div>
          <div className="filter-options">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Transactions
            </button>
            <button 
              className={`filter-btn ${filter === 'deposit' ? 'active' : ''}`}
              onClick={() => setFilter('deposit')}
            >
              Deposits
            </button>
            <button 
              className={`filter-btn ${filter === 'withdraw' ? 'active' : ''}`}
              onClick={() => setFilter('withdraw')}
            >
              Withdrawals
            </button>
            <button 
              className={`filter-btn ${filter === 'investment' ? 'active' : ''}`}
              onClick={() => setFilter('investment')}
            >
              Investments
            </button>
          </div>
        </div>

        {/* Export Button */}
        <div className="export-section">
          <button className="btn-export">
            📥 Export CSV
          </button>
        </div>

        {/* Transactions List */}
        {loading ? (
          <div className="transaction-loading">
            <span className="loading-spinner"></span>
            Loading transactions...
          </div>
        ) : filteredTxs.length === 0 ? (
          <div className="transaction-empty">
            <div className="transaction-empty-icon">📊</div>
            <div className="transaction-empty-title">
              {filter === 'all' ? 'No transactions yet' : `No ${filter} transactions found`}
            </div>
            <div className="transaction-empty-text">
              {filter === 'all' 
                ? 'Your transaction history will appear here once you start using the platform.'
                : `Try changing the filter to see other transaction types.`
              }
            </div>
          </div>
        ) : (
          <div className="transactions-list">
            {filteredTxs.map(tx => (
              <div key={tx._id} className="transaction-item">
                <div className="transaction-info">
                  <div className="transaction-main">
                    <div className={`transaction-icon ${tx.type?.toLowerCase().includes('deposit') ? 'deposit' : 
                                   tx.type?.toLowerCase().includes('withdraw') ? 'withdrawal' :
                                   tx.type?.toLowerCase().includes('invest') ? 'investment' : 'referral'}`}>
                      {getTransactionIcon(tx.type)}
                    </div>
                    <div className="transaction-details">
                      <div className="transaction-type">{tx.type}</div>
                      <div className="transaction-amount">${Number(tx.amount || 0).toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="transaction-meta">
                    {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : 'Date not available'}
                  </div>
                </div>
                <div className="transaction-status">
                  <span className={`status-badge ${getStatusClass(tx.status)}`}>
                    {tx.status || 'Pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}