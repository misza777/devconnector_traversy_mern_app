/* eslint-disable no-unused-vars */
/* eslint-disable import/no-anonymous-default-export */

import { SET_ALERT, REMOVE_ALERT } from "../actions/types";
// import alert from './alert';

const initialState = [];

export default function (state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    //state is immutable dlatego robimy nowa tablice
    //dane data to payload dla traversego
    //to sa dane ktore moga byc czymkolwiek w tym wypadku id alertu
    case "SET_ALERT":
      return [...state, payload];
    case "REMOVE_ALERT":
      return state.filter((alert) => alert.id !== payload);
    default:
      return state;
  }
}
