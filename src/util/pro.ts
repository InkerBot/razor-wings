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
  if (cacheProKey && fnv1aHash(cacheProKey) == 'cbf29d0fd5ca3ac17ee9c27d7cd3525b4be7102e30294ec784c51375e693785c30402fccae3b6bf38e07ad38e7320323c85a9317820902faefa7e327168dd9de720c076d64d2f1b7635acd2cea0a37058024e182b93e160aeb8330a24598125af9fb09a8789008f0dc2ea34f1118985394cece5952a26c95eecae1be4d6fde54616e06e21cda6ecbbcaa82f8cb86ed3d8172bd0cc53c15bcba7cb8669cab826db1081f384feb2734') {
    cacheKeyIsPro = true
  }
}

export function razorIsPro() {
  refreshCache();
  return cacheKeyIsPro;
}

