const urls = [
  'https://abacus.jasoncameron.dev/get/testlk/probe2',
  'https://abacus.jasoncameron.dev/hit/testlk/probe2',
];
for (const u of urls) {
  const t0 = Date.now();
  try {
    const r = await fetch(u, { signal: AbortSignal.timeout(8000) });
    const text = await r.text();
    console.log(r.status, `${Date.now() - t0}ms`, '|', text.slice(0, 120));
  } catch (e) {
    console.log('ERR', `${Date.now() - t0}ms`, String(e).slice(0, 120));
  }
}
