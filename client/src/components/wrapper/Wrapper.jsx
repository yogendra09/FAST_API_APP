import { Provider } from "react-redux"
import { ThemeProvider } from "../../context/ThemeProvider"
import { BrowserRouter } from "react-router-dom"
import { store } from "@/store/store"

const Wrapper = ({children}) => {
  return (
    <div>
    <BrowserRouter>
    <ThemeProvider>
      <Provider store={store}>
      {children}
      </Provider>
      </ThemeProvider>
      </BrowserRouter>
    </div>
  )
}

export default Wrapper