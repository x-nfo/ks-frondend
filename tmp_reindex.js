async function checkProduct() {
  const url = 'http://localhost:3000/admin-api';

  // 1. Login
  const loginMutation = `
    mutation {
      login(username: "superadmin", password: "superadmin") {
        ... on CurrentUser {
          id
        }
      }
    }
  `;

  let res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: loginMutation })
  });

  const token = res.headers.get('vendure-auth-token');

  const getProds = `
    query {
      products {
        items {
          name
          enabled
          channels {
            code
          }
          variants {
            name
            enabled
            price
          }
        }
      }
    }
  `;

  res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': 'Bearer ' + token } : {})
    },
    body: JSON.stringify({ query: getProds })
  });

  const p = await res.json();
  console.log('Admin Products Details:', JSON.stringify(p, null, 2));

}

checkProduct().catch(console.error);
