import { useState } from 'react'
import './style.css'

function Login({apiUrl, onLogin}) {
  const [error, setError] = useState(false)
  const [idInstance, setIdInstance] = useState('')
  const [apiTokenInstance, setApiTokenInstance] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    const url = `${apiUrl}/waInstance${idInstance}/getStateInstance/${apiTokenInstance}`

    try {
      const response = await fetch(url)
      const data = await response.json()

      if (data.stateInstance === 'authorized') {
        localStorage.setItem('idInstance', idInstance)
        localStorage.setItem('apiTokenInstance', apiTokenInstance)
        setError(false)
        onLogin()
      } else {
        setError(true)
      }
    } catch (error) {
      setError(true)
    }
  }

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <p className="login-title">Введите учётные данные</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            Идентификатор:
            <input
              className="login-input"
              type="text"
              name="identifier"
              placeholder="Введите идентификатор"
              value={idInstance}
              onChange={(event) => setIdInstance(event.target.value)}
            />
          </label>
          <label>
            Токен:
            <input
              className="login-input"
              type="password"
              name="token"
              placeholder="Введите токен"
              value={apiTokenInstance}
              onChange={(event) => setApiTokenInstance(event.target.value)}
            />
          </label>
          <button type="submit" className="login-button" disabled={!idInstance || !apiTokenInstance}>
            Войти
          </button>
        </form>

        {error && (<p className="error-login">Не удалось авторизоваться</p>)}
      </div>
    </div>
  )
}

export default Login