import axios from 'axios'
import { GetIdToken, IsLoggedIn } from './auth'

export async function GetAPIURL () {
  var config = await fetch('static/config.json');
  var json = await config.json();
  console.log("json:"+JSON.stringify(json))
  return json.APIURL
}

export async function GetCERTDB_ADDR () {
  var config = await fetch('static/config.json');
  var json = await config.json();
  console.log("json:"+JSON.stringify(json))
  return json.CERTDB_ADDR
}

// fetch('static/config.json')
//   .then(r => r.json())
//   .then(json => {
//     // write to browser's console
//     console.log("json:"+JSON.stringify(json))
//     //axios.defaults.baseURL = json.APIURL
//     APIURL = json.APIURL;
//   })

function getAuthorizationValue () {
  const r = IsLoggedIn() ? 'Bearer ' + GetIdToken() : null
  // console.log('getAuthorizationValue: ' + r)
  return r
}

export const APISRV = axios.create({
  headers: {
    'X-Custom-Header': 'NCHC_BLOCKCHAIN_TEAM',
    Authorization: getAuthorizationValue()
  }
})
