import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

/** 저장소 사용을 위한 수정 */
// import store from './store';
import { persistor, store } from './store';
import { Provider } from 'react-redux';
import { CookiesProvider } from 'react-cookie';
import setUpInterceptor from './content/utils/setupInterceptors';
import { PersistGate } from 'redux-persist/integration/react';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <CookiesProvider>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </CookiesProvider>
);

setUpInterceptor(store);

  // <React.StrictMode>
  //   <App />
  // </React.StrictMode>

// ReactDOM.render(
//   document.getElementById('root')
// );

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
