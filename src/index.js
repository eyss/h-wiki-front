import { SchemaLink } from 'apollo-link-schema';
import { InMemoryCache } from 'apollo-boost';
import { ApolloClient } from 'apollo-boost';
import { typeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers';
import { makeExecutableSchema } from 'graphql-tools';
import { connect } from '@holochain/hc-web-client';
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import App from './App';
import * as serviceWorker from './serviceWorker';

async function boot() {
    const store = createStore((state = { client: null }, action) => {
        switch (action.type) {
          case 'SET_CLIENT':
            return { ...state, client: action.value }
      
          default:
            return state
        }
      });
      await connect({ url: "ws://192.168.1.63:3400" })
        .then((context) => {
          const schema = makeExecutableSchema({
            typeDefs,
            resolvers
          });
          const client = new ApolloClient({
            cache: new InMemoryCache(),
            link: new SchemaLink({ schema, context })
          });
          store.dispatch({
            type: 'SET_CLIENT',
            value: client
          });
        });

    ReactDOM.render(
        <Provider store={store}>
            <App />
        </Provider>
        , document.getElementById('root'));
}

boot();
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
