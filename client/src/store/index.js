/** reducer를 사용하기 위해 configureStore 선언 */
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import tokenReducer from './Auth';
// for redux-persist
import storage from 'redux-persist/lib/storage';
import storageSession from 'redux-persist/lib/storage/session';
import { persistReducer, persistStore } from 'redux-persist';
import thunk from 'redux-thunk';

// for localstorage
const rootPersistConfig = {
    key: 'root',
    storage,
}

// for sessionStorage
const userPersistConfig = {
    key: 'user',
    storage: storageSession,
};

// 여러개 reducer를 하나로 묶는다
// localstorage, sessionStorage 혼합 사용 가능
const rootReducer = combineReducers({
    authToken : persistReducer(userPersistConfig, tokenReducer),
});

const persistedReducer = persistReducer(rootPersistConfig, rootReducer);

// middleware 없으면 a non-serializable value was detected in the state
export const store = configureStore({
    reducer: persistedReducer,
    middleware: [thunk],
});
export const persistor = persistStore(store);

// export default configureStore({
//     reducer: {
//         authToken: tokenReducer,
//     },
// });