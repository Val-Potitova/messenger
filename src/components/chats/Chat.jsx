import { useEffect, useState } from "react"
import "./style.css"
import send from "../../assets/icons/send.svg"
import user from "../../assets/icons/user.svg"

function Chat({ apiUrl, phone, chatId }) {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([])
  const idInstance = localStorage.getItem("idInstance")
  const apiTokenInstance = localStorage.getItem("apiTokenInstance")
  
  useEffect(() => {
    setMessages([])
  }, [chatId])

  const handleSubmit = async (event) => {
    event.preventDefault()
    const text = message.trim()
    if (!text || !chatId) return

    const url =`${apiUrl}/waInstance${idInstance}/sendMessage/${apiTokenInstance}`
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId,
          message: text,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(`Ошибка отправки: ${response.status}`)
      }

      setMessages((prev) => [
        ...prev,
        {
          id: data.idMessage,
          text,
          type: "request",
          timestamp: Date.now(),
        },
      ])

      setMessage("")
    } catch (error) {
      console.error("Ошибка отправки сообщения:", error)
    }
  }

  useEffect(() => {
    if (!chatId || !idInstance || !apiTokenInstance) return

    let stopped = false
    const receiveMessages = async () => {
      while (!stopped) {
        try {
          const url =`${apiUrl}/waInstance${idInstance}/receiveNotification/${apiTokenInstance}?receiveTimeout=5`
          const response = await fetch(url)
          if (!response.ok) {
            throw new Error(
              `Ошибка получения: ${response.status}`
            )
          }

          const data = await response.json()
          if (!data || !data.body) continue
          const notification = data.body

          if (
            notification.typeWebhook === "incomingMessageReceived" &&
            notification.messageData?.typeMessage === "textMessage"
          ) {
            const incomingChatId = notification.senderData?.chatId

            if (incomingChatId === chatId) {
              const text =
                notification.messageData
                  ?.textMessageData
                  ?.textMessage

              setMessages((prev) => [
                ...prev,
                {
                  id: notification.idMessage,
                  text: text,
                  type: "answer",
                },
              ])
            }
          }

          const deleteUrl = `${apiUrl}/waInstance${idInstance}/deleteNotification/${apiTokenInstance}/${data.receiptId}`

          await fetch(deleteUrl, {
            method: "DELETE",
          })
        } catch (error) {
          if (!stopped) console.error("Ошибка получения сообщения:", error)
          await new Promise((resolve) => {
            setTimeout(resolve, 2000)
          })
        }
      }
    }
    receiveMessages()
    return () => {stopped = true}
  }, [apiUrl, chatId, idInstance, apiTokenInstance])

  return (
    <div className="chat-wrapper">

      <div className="messages">
        {messages.map((item) => (
          <div key={item.id} className={`message ${item.type}`}>
            {item.text}
          </div>
        ))}
      </div>

      <div className="partner-number">
        <div className="user-img"> <img src={user} alt="User"/> </div>
        <p className="user-number"> {phone} </p>
      </div>

      <form className="messege-form" onSubmit={handleSubmit}>
        <input
          className="messege-input"
          type="text"
          name="messege"
          placeholder="Сообщение"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
        <button type="submit" className="messege-submit">
          <img src={send} alt="Send message"/>
        </button>
      </form>
    </div>
  )
}

export default Chat