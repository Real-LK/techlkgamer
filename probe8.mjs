const urls = [
  'https://counterapi.com/view/techlkgamer-probe',
  'https://counterapi.com/api/v1/view/techlkgamer-probe',
];
for (const u of urls) {
  const t0 = Date.now();
  try {
    const r = await fetch(u, { signal: AbortSignal.timeout(8000), headers: { Accept: 'application/json' } });
    const text = await r.text();
    console.log(r.status, `${Date.now() - t0}ms`, '|', text.slice(0, 200));
  } catch (e) {
    console.log('ERR', `${Date.now() - t0}ms`, String(e).slice(0, 100));
  }
}
