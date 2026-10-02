const branchMapLinks = [
  {
    names: ['basti lalarukh', 'lalarukh'],
    url: 'https://maps.app.goo.gl/ZUW6Hgm2c7phZ7er8',
  },
  {
    names: ['new city'],
    url: 'https://maps.app.goo.gl/GNND2YTuZofYVXYP7',
  },
  {
    names: ['gudwal'],
    url: 'https://maps.app.goo.gl/oWkW4mWPFSmW6tdH8',
  },
];

export function branchMapUrl(branch, index = 0) {
  const name = String(branch?.name || '').toLowerCase();
  const match = branchMapLinks.find((item) => item.names.some((candidate) => name.includes(candidate)));
  return match?.url || branchMapLinks[index]?.url || '';
}
