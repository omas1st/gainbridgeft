import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import backend from '../services/api'
import '../styles/dashboard.css'

export default function MessageCenter(){
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(()=>{
    async function load(){
      try{
        const { data } = await backend.get(`/users/${user.id}/messages`)
        setMessages(data.messages || [])
      }catch(e){}
    }
    load()
  },[user])

  async function sendMessage(){
    if(!text.trim()) return
    setLoading(true)
    try{
      await backend.post(`/users/${user.id}/messages`, { text })
      setText('')
      // refresh list
      const { data } = await backend.get(`/users/${user.id}/messages`)
      setMessages(data.messages || [])
    }catch(e){}
    setLoading(false)
  }

  return (
    <div className="card" style={{marginTop:12}}>
      <h3>Messages</h3>
      <div style={{marginTop:8}}>
        <div style={{marginBottom:8}}>
          <textarea value={text} onChange={e=>setText(e.target.value)} rows={3} placeholder="Send a message to admin..." style={{width:'100%'}} />
          <div style={{marginTop:8}}><button className="btn" onClick={sendMessage} disabled={loading}>{loading ? 'Sending…' : 'Send'}</button></div>
        </div>

        <div>
          <h4>Inbox</h4>
          {messages.length === 0 && <div className="muted small">No messages yet</div>}
          {messages.map(m => (
            <div key={m._id} className="card" style={{marginTop:8}}>
              <div className="small muted">{new Date(m.createdAt).toLocaleString()}</div>
              <div style={{marginTop:6}}>{m.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
