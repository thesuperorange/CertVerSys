const request = require('supertest');
const req = request("http://localhost:3000");

function getUri(apiUri){
    return `/api/v1${apiUri}`
}
export function ExpectRespError(resp, statusTarget){

    if(resp && resp.statusCode!=statusTarget){
      console.log("PATH: ",resp.req.path)
      console.log("BODY: ",resp.body)
    }
    expect(resp.statusCode).toBe(statusTarget);
}

export async function GetReq(path, jwtToken) {
    if (jwtToken) {
      return await req
        .get(getUri(path))
        .set("Authorization", "bearer " + jwtToken);
    } else {
      return await req.get(getUri(path));
    }
  }
  
 export async function PostReq(path, body, jwtToken) {
    if (jwtToken) {
      return await req
        .post(getUri(path))
        .set("Authorization", "bearer " + jwtToken)
        .send(body);
    } else {
      return await req.post(getUri(path)).send(body);
    }
  }

  export async function PostReqType(path, body, jwtToken) {
    if (jwtToken) {
      return await req
        .post(getUri(path))
        .set("Authorization", "bearer " + jwtToken)
        .set("Content-Type", 'multipart/form-data')
        .send(body);
      } else {
        return await req
        .post(getUri(path))
        .set("Content-Type", 'multipart/form-data')
        .send(body);
      }
  }