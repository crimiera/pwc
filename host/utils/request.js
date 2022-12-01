const fetch = require("node-fetch");

const request = async (url, options, token = "") => {
  const headers = {
    ...(options.headers || {}),
    // "content-type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  return fetch(url, {
    ...options,
    headers,
  })
    .then((response) => {
      return response.json();
    })
    .catch((e) => {
      console.log("error sendin ", e);
    });
};

module.exports = {
  request,
};
