import axios from "axios";

const endpoint = "https://create.kahoot.it/rest"

let api;

// Authenticate with Kahoot
function authenticate(username, password) {
  return axios
    .post(`${endpoint}/authenticate`, {
      grant_type: "password",
      username,
      password
    })
    .then(res => {
      api = axios.create({
        baseURL: endpoint + "/",
        headers: { Authorization: `Bearer ${res.data.access_token}` }
      });
    })
    .catch(err => console.error(err));
}

// Get a specific Kahoot by UUID
function get(uuid) {
  return api.get(`kahoots/${uuid}`)
}

// Get all Kahoots in the current user's account
// Optionally skip a number of results
// Returns maximum of 10 results
function get_all(skip=0) {
  return api.get(`kahoots/browse/private?cursor=${skip}`)
}

// Find public Kahoots based on a query keyword
// Optionally skip a number of results
// Returns maximum of 10 results
function find(keyword, skip=0) {
  return api.get(`kahoots?cursor=${skip}&query=${keyword}`)
}

// Upload a Kahoot
function put(json) {
  return api.post(`kahoots`, json);
}

export default { authenticate, get, get_all, put }
