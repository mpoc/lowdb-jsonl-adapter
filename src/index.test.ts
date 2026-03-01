import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { JSONLFile, JSONLFileSync } from './index.js'

describe('JSONLFile', () => {
  let dir: string

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'lowdb-jsonl-'))
  })

  afterEach(async () => {
    await rm(dir, { recursive: true })
  })

  it('returns null when file does not exist', async () => {
    const adapter = new JSONLFile<{ id: number }>(join(dir, 'missing.jsonl'))
    const result = await adapter.read()
    expect(result).toBeNull()
  })

  it('writes and reads back data', async () => {
    const adapter = new JSONLFile<{ id: number; name: string }>(join(dir, 'data.jsonl'))
    const data = [{ id: 1, name: 'alice' }, { id: 2, name: 'bob' }]
    await adapter.write(data)
    const result = await adapter.read()
    expect(result).toEqual(data)
  })

  it('writes valid JSONL format', async () => {
    const adapter = new JSONLFile<{ a: number }>(join(dir, 'format.jsonl'))
    await adapter.write([{ a: 1 }, { a: 2 }, { a: 3 }])
    const raw = await readFile(join(dir, 'format.jsonl'), 'utf-8')
    const lines = raw.trimEnd().split('\n')
    expect(lines).toHaveLength(3)
    expect(lines.every((line) => JSON.parse(line))).toBe(true)
    expect(JSON.parse(lines[0])).toEqual({ a: 1 })
    expect(JSON.parse(lines[1])).toEqual({ a: 2 })
    expect(JSON.parse(lines[2])).toEqual({ a: 3 })
  })

  it('reads an empty file as empty array', async () => {
    const file = join(dir, 'empty.jsonl')
    await writeFile(file, '', 'utf-8')
    const adapter = new JSONLFile<{ id: number }>(file)
    const result = await adapter.read()
    expect(result).toEqual([])
  })

  it('reads a manually-written multi-line JSONL file', async () => {
    const file = join(dir, 'manual.jsonl')
    await writeFile(file, '{"x":1}\n{"x":2}\n{"x":3}\n', 'utf-8')
    const adapter = new JSONLFile<{ x: number }>(file)
    const result = await adapter.read()
    expect(result).toEqual([{ x: 1 }, { x: 2 }, { x: 3 }])
  })

  it('write overwrites previous content', async () => {
    const adapter = new JSONLFile<{ v: string }>(join(dir, 'overwrite.jsonl'))
    await adapter.write([{ v: 'first' }, { v: 'second' }])
    await adapter.write([{ v: 'replaced' }])
    const result = await adapter.read()
    expect(result).toEqual([{ v: 'replaced' }])
  })

  it('tolerates blank lines and trailing newlines', async () => {
    const file = join(dir, 'blanks.jsonl')
    await writeFile(file, '\n{"a":1}\n\n{"a":2}\n\n', 'utf-8')
    const adapter = new JSONLFile<{ a: number }>(file)
    const result = await adapter.read()
    expect(result).toEqual([{ a: 1 }, { a: 2 }])
  })
})

describe('JSONLFileSync', () => {
  let dir: string

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'lowdb-jsonl-sync-'))
  })

  afterEach(() => {
    rmSync(dir, { recursive: true })
  })

  it('returns null when file does not exist', () => {
    const adapter = new JSONLFileSync<{ id: number }>(join(dir, 'missing.jsonl'))
    const result = adapter.read()
    expect(result).toBeNull()
  })

  it('writes and reads back data', () => {
    const adapter = new JSONLFileSync<{ id: number; name: string }>(join(dir, 'data.jsonl'))
    const data = [{ id: 1, name: 'alice' }, { id: 2, name: 'bob' }]
    adapter.write(data)
    const result = adapter.read()
    expect(result).toEqual(data)
  })

  it('writes valid JSONL format', () => {
    const file = join(dir, 'format.jsonl')
    const adapter = new JSONLFileSync<{ a: number }>(file)
    adapter.write([{ a: 1 }, { a: 2 }, { a: 3 }])
    const raw = readFileSync(file, 'utf-8')
    const lines = raw.trimEnd().split('\n')
    expect(lines).toHaveLength(3)
    expect(lines.every((line) => JSON.parse(line))).toBe(true)
    expect(JSON.parse(lines[0])).toEqual({ a: 1 })
    expect(JSON.parse(lines[1])).toEqual({ a: 2 })
    expect(JSON.parse(lines[2])).toEqual({ a: 3 })
  })

  it('reads an empty file as empty array', () => {
    const file = join(dir, 'empty.jsonl')
    writeFileSync(file, '', 'utf-8')
    const adapter = new JSONLFileSync<{ id: number }>(file)
    const result = adapter.read()
    expect(result).toEqual([])
  })

  it('reads a manually-written multi-line JSONL file', () => {
    const file = join(dir, 'manual.jsonl')
    writeFileSync(file, '{"x":1}\n{"x":2}\n{"x":3}\n', 'utf-8')
    const adapter = new JSONLFileSync<{ x: number }>(file)
    const result = adapter.read()
    expect(result).toEqual([{ x: 1 }, { x: 2 }, { x: 3 }])
  })

  it('write overwrites previous content', () => {
    const adapter = new JSONLFileSync<{ v: string }>(join(dir, 'overwrite.jsonl'))
    adapter.write([{ v: 'first' }, { v: 'second' }])
    adapter.write([{ v: 'replaced' }])
    const result = adapter.read()
    expect(result).toEqual([{ v: 'replaced' }])
  })

  it('tolerates blank lines and trailing newlines', () => {
    const file = join(dir, 'blanks.jsonl')
    writeFileSync(file, '\n{"a":1}\n\n{"a":2}\n\n', 'utf-8')
    const adapter = new JSONLFileSync<{ a: number }>(file)
    const result = adapter.read()
    expect(result).toEqual([{ a: 1 }, { a: 2 }])
  })
})
