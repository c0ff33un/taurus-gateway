import { execute, makePromise } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { gql } from 'apollo-server'
import fetch from 'node-fetch'

const uri = process.env.REST_GATEWAY_URL
const link = new HttpLink({ uri, fetch })


export function getUserId(token) {
  if (token == '') {
    return null
  }
  const operation = {
    query: gql`query { me { id } }`,
    context: {
      headers: { authorization: token }
    }
  }
  return makePromise(execute(link, operation))
}


