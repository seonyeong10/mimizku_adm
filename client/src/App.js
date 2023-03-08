import './App.scss';
import 'scss/Top.scss';
import 'scss/Buttons.scss';
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom';

import Login from './content/view/login/Login';
import Logout from './content/view/login/logout';
import Home from './content/view/dashboard/Home';
import DrinkList, { DrinkView } from './content/view/menu/Drink';
import { FoodForm, FoodList } from './content/view/menu/Food';
import { GoodsForm, GoodsList } from './content/view/menu/Goods';
import { EmpList } from './content/view/staff/Employee';
import StaffHome from './content/view/staff/Home';
import MenuHome from './content/view/menu/Home';
import { useReducer } from 'react';
import { useSelector } from 'react-redux';

const openForm = (state, action) => {
  switch(action.type) {
    case 'LIST' : return { mode: 0, data: '' };
    case 'VIEW' : return { mode: 1, data: action.data };
  }
}

function App() {
  const [state, refetch] = useReducer(openForm, { mode: 0, data: '' });
  const auth = useSelector(state => state.authToken);
  console.log(auth);

  const depts = window.location.pathname.split('/').length;
  if(depts > 3) refetch({ type: 'LIST' });
  
  const goPage = (type, data='') => {
    refetch({ type : type, data : data});
  }
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />}/>
        <Route path='/login' element={<Login />}/>
        <Route path='/logout' element={<Logout />}/>

        <Route path='/menu' element={<MenuHome refetch={(type, data) => goPage(type,data)}/>}>
          <Route path='drink'     element={<DrinkList state={state} refetch={(type, data) => goPage(type,data)}/>}></Route>
          {/* <Route path='drink/:id' element={<DrinkView mode={0} state={state} refetch={(data) => goPage(data)}/>}/>
          <Route path='drink/add' element={<DrinkView mode={1} state={state} refetch={(data) => goPage(data)}/>}/> */}
          <Route path='food'      element={<FoodList state={state} refetch={(type, data) => goPage(type,data)}/>}></Route>
          {/* <Route path='food/:id'  element={<FoodForm state={state} refetch={(data) => goPage(data)}/>}></Route> */}
          <Route path='goods'     element={<GoodsList state={state} refetch={(type, data) => goPage(type,data)}/>}></Route>
          {/* <Route path='goods/:id' element={<GoodsForm state={state} refetch={(data) => goPage(data)}/>}></Route> */}
        </Route>

        <Route path='/staff' element={<StaffHome ctg='staff'/>}>
          <Route path='employee' element={<EmpList state={state} refetch={(type, data) => goPage(type,data)}/>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
