const branchMapLinks = [
  {
    names: ['basti lalarukh', 'lalarukh'],
    url: 'https://maps.app.goo.gl/ZUW6Hgm2c7phZ7er8',
    coordinates: '33.7855882,72.7253488',
  },
  {
    names: ['new city'],
    url: 'https://maps.app.goo.gl/GNND2YTuZofYVXYP7',
    coordinates: '33.7391429,72.7231368',
  },
  {
    names: ['gudwal'],
    url: 'https://maps.app.goo.gl/oWkW4mWPFSmW6tdH8',
    coordinates: '33.7972198,72.7466661',
  },
];

function branchMap(branch, index = 0) {
  const name = String(branch?.name || '').toLowerCase();
  return branchMapLinks.find((item) => item.names.some((candidate) => name.includes(candidate))) || branchMapLinks[index];
}

export function branchMapUrl(branch, index = 0) {
  return branchMap(branch, index)?.url || '';
}

export function branchMapEmbedUrl(branch, index = 0) {
  const coordinates = branchMap(branch, index)?.coordinates;
  return coordinates ? `https://www.google.com/maps?q=${coordinates}&z=16&output=embed` : '';
}
