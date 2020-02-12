import { gql } from 'apollo-boost';
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

async function start() {
    let parameters = {
      client: null,
      userId: null
    };

    const store = createStore((state = parameters, action) => {
        switch (action.type) {
          case 'SET_CLIENT':
            return {...state, client: action.value }
          case 'SET_USERID':
            return {...state, userId: action.value}
          default:
            return state
        }
      });
      var client;
      await connect({ url: "ws://192.168.1.63:3400"})
        .then((context) => {
          const schema = makeExecutableSchema({
            typeDefs,
            resolvers
          });
          client = new ApolloClient({
            cache: new InMemoryCache(),
            link: new SchemaLink({ schema, context })
          });

          store.dispatch({
            type: 'SET_CLIENT',
            value: client
          });
        });

      await client
        .query({
          query: gql`
            {
              getId {
                userName
                role
              }
            }
          `
        })
        .then(res => {
          res = res.data.getId;
          console.log(res);
          let userId = {
            userName : '',
            role: 'Reader'
          };
          // If user is recived
          if (res.userName.length > 0) {
            userId = res;     
          }

        console.log(userId);
          store.dispatch({
            type: 'SET_USERID',
            value: userId
          });
        });

    ReactDOM.render(
        <Provider store={store}>
            <App />
        </Provider>
        , document.getElementById('root'));
}

start();
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
