import React from 'react';
//React Router DOM
import { BrowserRouter, Route, Switch }  from 'react-router-dom'
import { connect } from 'react-redux';

//Styles
import './styles/App.scss';
//Components
import Wiki from './components/Wiki';
import RolesManagement from './components/RolesManagement';
import SignUp from './components/SignUp';
import PageNotFound from './components/PageNotFound';


function App(props) {

  console.log('Props app', props);
  return (
    <BrowserRouter>
      <Switch>
        {props.userId.role === 'Admin' &&
          <Route path="/user-managment">
            <RolesManagement />
          </Route>
        }

        {!props.userId.userName.length &&
          <Route path="/sign-up">
            <SignUp />
          </Route>
        }

        <Route path="/">
          <Wiki />
        </Route>

        <Route component={PageNotFound}/>

    </Switch>
    </BrowserRouter>
  );
}

function mapDispatchToProps(dispatch) {
  return {
    pepito: function(val) {
      dispatch({
        type: 'SET_PEPITO',
        value: val
      })
    }
  }
}

function mapStateToProps(state) {
  return {
    client: state.client,
    userId: state.userId
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
