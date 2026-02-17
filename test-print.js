
import { print } from 'graphql';
import gql from 'graphql-tag';

const doc = gql`
  query Test {
    test
  }
`;

console.log("Printed Query:");
console.log(print(doc));
if (print(doc).trim() === "") {
    console.log("ERROR: print(doc) returned an empty string!");
} else {
    console.log("SUCCESS: print(doc) returned a valid string.");
}
