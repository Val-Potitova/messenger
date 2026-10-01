import { useState } from "react"
import "./style.css"
import user from "../../assets/icons/user.svg"

function normalizePhoneNumber(value) {
  const digits = value.replace(/\D/g, "")
  if (!digits) return ""
  if (digits.startsWith("8") && digits.length === 11) return `+7${digits.slice(1)}`
  if (digits.startsWith("7") && digits.length === 11) return `+${digits}`
  if (digits.length === 10) return `+7${digits}`
  return ""
}

function ChatList({apiUrl, selectedPhone, onSelectChat,}) {
  const idInstance = localStorage.getItem('idInstance')
  const apiTokenInstance = localStorage.getItem('apiTokenInstance')
  const [phoneNumber, setPhoneNumber] = useState("")
  const [checking, setChecking] = useState(false)
  const [accountError, setAccountError] = useState('')

  const [chats, setChats] = useState(() => {
    const savedChats = localStorage.getItem("chatNumbers")
    return savedChats ? JSON.parse(savedChats) : []
  })

  const normalizedPhone = normalizePhoneNumber(phoneNumber)
  const isSearching = phoneNumber.trim() !== ""

  const createChat = async () => {
    if (!normalizedPhone) return
    setChecking(true)
    setAccountError('')
    const data = await checkAccount(normalizedPhone)
    if (!data || data.exist !== true) {
      setAccountError('Пользователь не найден')
      setChecking(false)
      return
    }

    if (!chats.includes(normalizedPhone)) {
      const updatedChats = [...chats, normalizedPhone]
      setChats(updatedChats)
      localStorage.setItem(
        "chatNumbers",
        JSON.stringify(updatedChats)
      )
    }
    onSelectChat(normalizedPhone, data.chatId)
    setPhoneNumber("")
    setChecking(false)
  }

  const selectChat = (phone) => {
    const chatId = localStorage.getItem(`chatId_${phone}`)
    onSelectChat(phone, chatId || "")
    setPhoneNumber("")
  }

  const checkAccount = async (phone) => {
    const url = `${apiUrl}/waInstance${idInstance}/checkAccount/${apiTokenInstance}`
    const phoneNumber = Number(phone.replace('+', ''))

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phoneNumber
        })
      })
      const data = await response.json()
      if (data.exist && data.chatId) {
        localStorage.setItem(`chatId_${phone}`, data.chatId)
      }
      return data
    } catch (error) {
      setAccountError('Ошибка проверки номера')
      return null
    }
  }

  return (
    <div className="chatlist-wrapper">

      <div className="search-container">
        <input
          className="search-input"
          type="text"
          name="search"
          placeholder="Введите номер"
          value={phoneNumber}
          onChange={(event) => {
            setPhoneNumber(event.target.value)
            setAccountError('')
          }}
        />
      </div>

      {isSearching && normalizedPhone && (
        <button className="new-chat" onClick={createChat} disabled={checking || accountError}>
          <span className="user-number">{normalizedPhone}</span>
          <span className={accountError ? "error-user-add" : "user-add"}>
            {checking 
              ? 'Проверяем...' 
              : accountError || 'Создать чат'
            }
          </span>
        </button>
      )}
      {chats.map((phone) => (
        <div
          className={`chatlist-item ${
            selectedPhone === phone ? "selected" : ""
          }`}
          key={phone}
          onClick={() => selectChat(phone)}
        >
          <div className="user-img"><img src={user} alt="User"/></div>
          <span className="user-number">{phone}</span>
        </div>
      ))}
    </div>
  )
}

export default ChatList