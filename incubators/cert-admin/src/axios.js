import axios from 'axios'
import { GetIdToken, IsLoggedIn } from './auth'

fetch('static/config.json')
  .then(r => r.json())
  .then(json => {
    // write to browser's console
    console.log(json)
    axios.defaults.baseURL = json.APIURL
  })

function getAuthorizationValue () {
  const r = IsLoggedIn() ? 'Bearer ' + GetIdToken() : null
  // console.log('getAuthorizationValue: ' + r)
  return r
}

export const APISRV = axios.create({
  timeout: 5000,
  headers: {
    'X-Custom-Header': 'NCHC_BLOCKCHAIN_TEAM',
    Authorization: getAuthorizationValue()
  }
})
