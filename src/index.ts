import type { Adapter, SyncAdapter } from 'lowdb'
import { readFile, writeFile } from 'node:fs/promises'
import { readFileSync, writeFileSync } from 'node:fs'

export class JSONLFile<T> implements Adapter<T[]> {
  #filename: string

  constructor(filename: string) {
    this.#filename = filename
  }

  async read(): Promise<T[] | null> {
    let content: string
    try {
      content = await readFile(this.#filename, 'utf-8')
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === 'ENOENT') {
        return null
      }
      throw e
    }
    const lines = content.split('\n').filter((line) => line.trim() !== '')
    return lines.map((line) => JSON.parse(line) as T)
  }

  async write(data: T[]): Promise<void> {
    const content = data.map((item) => JSON.stringify(item)).join('\n') + '\n'
    await writeFile(this.#filename, content, 'utf-8')
  }
}

export class JSONLFileSync<T> implements SyncAdapter<T[]> {
  #filename: string

  constructor(filename: string) {
    this.#filename = filename
  }

  read(): T[] | null {
    let content: string
    try {
      content = readFileSync(this.#filename, 'utf-8')
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === 'ENOENT') {
        return null
      }
      throw e
    }
    const lines = content.split('\n').filter((line) => line.trim() !== '')
    return lines.map((line) => JSON.parse(line) as T)
  }

  write(data: T[]): void {
    const content = data.map((item) => JSON.stringify(item)).join('\n') + '\n'
    writeFileSync(this.#filename, content, 'utf-8')
  }
}
