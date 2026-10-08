import { customAlphabet } from 'nanoid';

const ALPHABET = '0123456789abcdefghjkmnpqrstvwxyz'; // no look-alikes
const gen = customAlphabet(ALPHABET, 24);

export type IdPrefix =
  | 'usr' | 'ses' | 'oac' | 'wsp' | 'wmb' | 'ych' | 'ycr'
  | 'stg' | 'ida' | 'isc' | 'cnt' | 'cvr' | 'scr' | 'svr'
  | 'voi' | 'vgn' | 'scn' | 'sas' | 'ast' | 'asv'
  | 'vpr' | 'rjb' | 'sub' | 'qck' | 'qis' | 'rev' | 'apr'
  | 'sch' | 'pub' | 'anx' | 'van' | 'ins' | 'sad'
  | 'wfl' | 'wfn' | 'wfe' | 'wex' | 'wxn'
  | 'acf' | 'ntf' | 'npr'
  | 'urg' | 'lim' | 'sub' | 'inv' | 'aud' | 'obe' | 'idk' | 'prq' | 'pru';

export function newId(prefix: IdPrefix): string {
  return `${prefix}_${gen()}`;
}
