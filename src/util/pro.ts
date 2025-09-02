const offsetBasis = BigInt('14695981039346656037');
const prime = BigInt('1099511628211');
let cacheProKey: string = '';
let cacheKeyIsPro = false;
refreshCache();

function fnv1aHash(data: string): string {
  let hash = offsetBasis;
  for (let i = 0; i < data.length; i++) {
    hash ^= BigInt(data.charCodeAt(i));
    hash = hash * prime;
  }
  return hash.toString(16).padStart(16, '0');
}

function refreshCache() {
  const currentKey = localStorage['7f9fb7bcf1974e379759891006e8b75c']
  if (currentKey == cacheProKey) {
    return;
  }
  cacheProKey = currentKey;
  if (cacheProKey && fnv1aHash(cacheProKey) == '') {
    cacheKeyIsPro = true
  }
}

export function razorIsPro() {
  refreshCache();
  return cacheKeyIsPro;
}

