const axios = require("axios");
// import axios from "axios";

const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common["x-auth-token"] = token;
    console.log("token is set");
  } else {
    delete axios.defaults.headers.common["x-auth-token"];
    console.log("token is deleted");
  }
};

export default setAuthToken;
