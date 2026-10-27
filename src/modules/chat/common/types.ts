export type StoredTextPart = { type: 'text'; content: string }

export type StoredImagePart = {
  type: 'image'
  hash: string
  url: string | null
}

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | Array<JsonValue>
  | { [key: string]: JsonValue }

export type StoredToolCallPart = {
  type: 'tool-call'
  id: string
  name: string
  arguments: string
  state: string
  input?: JsonValue
  output?: JsonValue
  thoughtSignature?: string
}

export type StoredToolResultPart = {
  type: 'tool-result'
  toolCallId: string
  name?: string
  content: JsonValue
}

export type StoredChatPart =
  | StoredTextPart
  | StoredImagePart
  | StoredToolCallPart
  | StoredToolResultPart

export type StoredChatMessage = {
  id: string
  role: 'user' | 'assistant'
  parts: Array<StoredChatPart>
  createdAt: string
}
