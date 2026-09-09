const KEY='jarvis.memory.v1'; export type MemoryEntry={role:'user'|'assistant';text:string;createdAt:number};
export const memory={ read:():MemoryEntry[]=>JSON.parse(localStorage.getItem(KEY)||'[]'), add(entry:MemoryEntry){localStorage.setItem(KEY,JSON.stringify([...this.read(),entry].slice(-80)))}, clear(){localStorage.removeItem(KEY)} };
