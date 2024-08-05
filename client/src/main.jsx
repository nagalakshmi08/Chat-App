// index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import RegisterPage from './pages/RegisterPage';
import CheckEmailPage from './pages/CheckEmailPage';
import CheckPasswordPage from './pages/CheckPasswordPage';
import Home from './pages/Home';
import Message from './components/Message';
import './index.css';
import AuthLayouts from './layout/index.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx'
import {Provider} from 'react-redux'
import {store} from './redux/store.js'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}>
            <Route path="register" element={<AuthLayouts><RegisterPage /></AuthLayouts>} />
            <Route path="email" element={<AuthLayouts><CheckEmailPage /></AuthLayouts>} />
            <Route path="password" element={<AuthLayouts><CheckPasswordPage /></AuthLayouts>} />
            <Route path="" element={<Home />}>
              <Route path=":userId" element={<Message />} />
            </Route>
            <Route path='forgot-password' element={<AuthLayouts><ForgotPassword /></AuthLayouts>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
);
