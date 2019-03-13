import axios from 'axios';
var stringify = require('qs-stringify')

const CLIENT_ID = 'a1bb36b684b5638076f5cae5414947aa';
const CLIENT_SECRET = '8fbb9a0711de7a1121851f2372da2fe156cc1ad52c4d538d675ccf6c26bab41e';
function getUri(apiUri){
    //return `/api/v1${apiUri}`
    return `${apiUri}`
}
export function ExpectRespError(resp, statusTarget){

    if(resp && resp.statusCode!=statusTarget){
      console.log("PATH: ",resp.req.path)
      console.log("BODY: ",resp.body)
    }
    expect(resp.statusCode).toBe(statusTarget);
}

export async function GetOidcUserinfo(path, oidcToken) {
    return new Promise( (resolve, reject) => {
        axios({
            method: 'get',
            headers: {
              'Authorization': 'Bearer '+oidcToken,
              'accept': 'application/json'
            },
            url: '/oidc/v1/userinfo',
            baseURL: 'https://tc.sso.edu.tw/',
            responseType: 'json'
        }).then(function (response) {
          //console.log(response);
            const resp = response;
            const userinfo = resp.request.responseText;
            console.log(userinfo);
            resolve(userinfo);
        })
        .catch(function (error) {
            console.log(error.response);
            reject(error.response);
        });
    })
}

export async function GetOidc(path, oidcToken) {
    return new Promise( (resolve, reject) => {
        axios({
            method: 'get',
            headers: {
              'Authorization': 'Bearer '+oidcToken,
              'accept': 'application/json'
            },
            url: '/cncresource/api/v1/eduinfo',
            baseURL: 'https://tc.sso.edu.tw/',
            responseType: 'json'
        }).then(function (response) {
            var eduinfo = {};
            const resp = JSON.parse(response.request.responseText);
            if(resp.titles[0].titles[0] === "教師") {
                const schoolid = resp.schoolid;
                const sub = resp.sub;
                const titles = resp.titles[0].titles[0];
                eduinfo = { "schoolid": schoolid, "sub":sub, "titles":titles }
            } else {
                //console.log(resp.data);
                const schoolid = resp.schoolid;
                const sub = resp.sub;
                const titles = resp.titles[0].titles[0];
                const classtitle = resp.classinfo[0].classtitle;
                const grade = resp.classinfo[0].grade;
                const classno = resp.classinfo[0].classno;
                eduinfo = { "schoolid": schoolid, "sub":sub, "titles":titles, 
                            "classtitle":classtitle, "grade":grade, "classno":classno }
            }

    
            console.log(eduinfo);
            resolve(eduinfo);
        })
        .catch(function (error) {
            console.log(error.response);
            reject(error.response);
        });
    })
    

}
  
export async function PostOidc(token_ep, code, redir_uri) {
    const hash = Buffer.from( CLIENT_ID +":"+ CLIENT_SECRET).toString('base64');
    return new Promise( (resolve, reject) => {
        axios({
            method: 'post',
            url: '/oidc/v1/token',
            baseURL: 'https://tc.sso.edu.tw/',
            params: {
                'grant_type':'authorization_code', 'code': code,
                'redirect_uri': redir_uri
            }, // content
            headers: {
                'Content-type': 'application/x-www-form-urlencoded', 
                'Authorization': 'Basic '+hash
            },
            data: stringify({
                'grant_type':'authorization_code', 'code': code,
                'redirect_uri': redir_uri
            }),
            responseType: 'json'
        }).then(function (response) {
            //console.log(response);
            console.log('access_token:'+JSON.parse(response.request.responseText).access_token);
            const data = {access_token: JSON.parse(response.request.responseText).access_token};
            resolve(data);
        })
        .catch(function (error) {
            console.log(error);
            reject(error);
        });
    })
}