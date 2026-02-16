const fs = require('fs');
const path = 'app/generated/graphql.ts';
let content = fs.readFileSync(path, 'utf8');

// Replace standard Request type definition
content = content.replace(/import { DocumentNode, ExecutionResult } from 'graphql';/g, "import type { DocumentNode, ExecutionResult } from 'graphql';");
content = content.replace(/Promise<ExecutionResult<R, E>>/g, 'Promise<R>');
content = content.replace(/ \| AsyncIterable<ExecutionResult<R, E>>/g, '');

// Replace specific return types in getSdk
content = content.replace(/Promise<ExecutionResult<([^>]+), E>>/g, 'Promise<$1>');

// Replace getSdk cast
content = content.replace(/ as Promise<ExecutionResult<([^>]+), E>>/g, ' as Promise<$1>');

console.log('Patched graphql.ts');
fs.writeFileSync(path, content);
