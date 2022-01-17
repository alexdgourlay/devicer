export function addIDs<Key extends string | number | symbol, T extends object>(
  obj: Record<Key, T>
) {
  let k: Key;
  for (k in obj) Object.assign(obj[k], { id: k });
  return obj as Record<Key, T & { id: Key }>;
}
