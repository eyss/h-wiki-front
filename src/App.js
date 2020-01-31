import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';

//React Router DOM
import { BrowserRouter, Route, Switch }  from 'react-router-dom'

//Styles
import './styles/App.scss';

//Components
import Wiki from './components/Wiki';
import RolesManagement from './components/RolesManagement';
import UserRegistry from './components/UserRegistry';
import PageNotFound from './components/PageNotFound';


import { connect } from '@holochain/hc-web-client';
/** Apollo cliente, GraphQL */
import { ApolloClient, InMemoryCache } from "apollo-boost";
import { resolvers } from "./graphql/resolvers";
import { typeDefs } from "./graphql/schema";
import { SchemaLink } from "apollo-link-schema";
import { makeExecutableSchema } from "graphql-tools";


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