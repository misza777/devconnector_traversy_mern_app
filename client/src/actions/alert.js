import { SET_ALERT, REMOVE_ALERT } from "./types";
import { v4 as uuid } from "uuid";

//thunk middleware pozwala na dwie funkcje strzalkowe
//A thunk is a function that wraps an expression to delay its evaluation.
//instalujemy package uuid zeby nam dalo uniwersalny numer id on the fly

//dodatkowy props timeout do czasu znikniecia alertu
export const setAlert = (msg, alertType, timeout = 5000) => (dispatch) => {
  const id = uuid();

  dispatch({
    type: SET_ALERT,
    payload: { msg, alertType, id },
  });

  //alert musi zniknac
  setTimeout(() => dispatch({ type: REMOVE_ALERT, payload: id }), timeout);
};
