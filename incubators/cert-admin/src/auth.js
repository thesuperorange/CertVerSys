import Router from 'vue-router'
import decode from 'jwt-decode'
const STORAGE_KEY_ID_TOKEN = 'storage_key_id_token'

var router = new Router({
  mode: 'history'
})

export function Logout () {
  clearIdToken()
  router.go('/')
}

export function GetIdToken () {
  return localStorage.getItem(STORAGE_KEY_ID_TOKEN)
}

export function SetIdToken (idToken) {
  localStorage.setItem(STORAGE_KEY_ID_TOKEN, idToken)
}

export function RequireAuth (to, from, next) {
  if (!IsLoggedIn()) {
    next({
      path: '/pages/login'
    })
  } else {
    next()
  }
}

export function IsLoggedIn () {
  const idToken = GetIdToken()
  return idToken && !isTokenExpired(idToken)
}

function getTokenExpirationDate (encodedToken) {
  console.log(encodedToken)
  const token = decode(encodedToken)
  if (!token.exp) { return null }
  const date = new Date(0)
  date.setUTCSeconds(token.exp)
  return date
}

function isTokenExpired (token) {
  const expirationDate = getTokenExpirationDate(token)
  return expirationDate < new Date()
}

function clearIdToken () {
  localStorage.removeItem(STORAGE_KEY_ID_TOKEN)
}
