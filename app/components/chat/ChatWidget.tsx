import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useState } from 'react'

export function ChatWidget() {
  const { messages, sendMessage } = useChat({
    transport: new DefaultChatTransport({
  api: 'https://genre-bubble-hottest-foundation.trycloudflare.com/api/chat',
}),
  })

  const [input, setInput] = useState('')

  return (
    <div>
      <div>
        {messages.map(message => (
          <div key={message.id}>
            <strong>{message.role === 'user' ? 'Tu' : 'AI'}: </strong>
            {message.parts.map((part, i) => {
              switch (part.type) {
                case 'text':
                  return <span key={i}>{part.text}</span>
                default:
                  return null
              }
            })}
          </div>
        ))}
      </div>

      <form onSubmit={e => {
        e.preventDefault()
        if (input.trim()) {
          sendMessage({ text: input })
          setInput('')
        }
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Scrivi un messaggio..."
        />
        <button type="submit">Invia</button>
      </form>
    </div>
  )
}