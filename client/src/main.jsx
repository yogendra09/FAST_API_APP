import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import Wrapper from './components/wrapper/Wrapper.jsx'

createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <Wrapper>
    <App />
    </Wrapper>
  // </StrictMode>,
)
