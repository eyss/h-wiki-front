import React from 'react';
//React Router DOM
import { BrowserRouter, Route, Switch }  from 'react-router-dom'
//Styles
import './styles/App.scss';
//Components
import Wiki from './components/Wiki';
import RolesManagement from './components/RolesManagement';
import UserRegistry from './components/UserRegistry';
import PageNotFound from './components/PageNotFound';


function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/roles-managment">
          <RolesManagement />
        </Route>
        <Route path="/user-registry">
          <UserRegistry />
        </Route>
        <Route path="/">
          <Wiki />
        </Route>
        <Route component={PageNotFound}/>
    </Switch>
    </BrowserRouter>
  );
}

export default App;