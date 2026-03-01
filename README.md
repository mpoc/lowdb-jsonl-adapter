# lowdb-jsonl-adapter

> JSONL adapter for [Lowdb](https://github.com/typicode/lowdb)

## Install

```
npm i lowdb-jsonl-adapter
```

## Usage

```js
import { Low } from 'lowdb'
import { JSONLFile } from 'lowdb-jsonl-adapter'

const adapter = new JSONLFile('db.jsonl')
const db = new Low(adapter, [])

await db.read()
db.data.push({ id: 1, name: 'alice' })
await db.write()
```

Sync:

```js
import { LowSync } from 'lowdb'
import { JSONLFileSync } from 'lowdb-jsonl-adapter'

const adapter = new JSONLFileSync('db.jsonl')
const db = new LowSync(adapter, [])

db.read()
db.data.push({ id: 1, name: 'alice' })
db.write()
```
