
import { print } from 'graphql';
import gql from 'graphql-tag';

const doc = gql`
  query Test {
    activeChannel {
      id
    }
  }
`;

console.log("--- DOCUMENT TYPE ---");
console.log(typeof doc);
console.log(doc.kind);

console.log("--- PRINTED QUERY ---");
const printed = print(doc);
console.log("Length:", printed.length);
console.log("Content:\n", printed);

if (printed.trim().length === 0) {
    console.log("FAILED: Printed query is empty.");
} else {
    console.log("SUCCESS: Printed query is valid.");
}
