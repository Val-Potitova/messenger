import { useState } from "react"
import Login from "./components/login/Login.jsx"
import Chat from "./components/chats/Chat.jsx"
import ChatList from "./components/chats/ChatsList.jsx"

function App() {
  const [isAuthorized, setIsAuthorized] = useState(() => {
    const idInstance = localStorage.getItem("idInstance")
    const apiTokenInstance = localStorage.getItem("apiTokenInstance")
    return Boolean(idInstance && apiTokenInstance)
  })

  const [selectedChat, setSelectedChat] = useState(() => ({
    phone: localStorage.getItem("selectedPhone") || "",
    chatId: localStorage.getItem("selectedChatId") || "",
  }))

  const apiUrl = "https://4100.api.green-api.com"

  const selectChat = (phone, chatId) => {
    setSelectedChat({phone, chatId,})
    localStorage.setItem("selectedPhone", phone)
    localStorage.setItem("selectedChatId", chatId)
  }

  return (
    <>
      {isAuthorized ? (
        <>
          <ChatList
            apiUrl={apiUrl}
            selectedPhone={selectedChat.phone}
            onSelectChat={selectChat}
          />

          <Chat
            apiUrl={apiUrl}
            phone={selectedChat.phone}
            chatId={selectedChat.chatId}
          />
        </>
      ) : (
        <Login
          apiUrl={apiUrl}
          onLogin={() => setIsAuthorized(true)}
        />
      )}
    </>
  )
}

export default App