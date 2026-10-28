import fs from 'fs';

async function search(term) {
  const url = `https://unsplash.com/s/photos/${encodeURIComponent(term)}`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const html = await res.text();
    const tag = '<script id="__NEXT_DATA__" type="application/json">';
    const start = html.indexOf(tag);
    if (start !== -1) {
      const jsonStart = start + tag.length;
      const end = html.indexOf('</script>', jsonStart);
      const jsonStr = html.substring(jsonStart, end);
      const data = JSON.parse(jsonStr);
      const results = data.props?.pageProps?.initialData?.results || 
                      data.props?.pageProps?.initialData?.photos?.results || 
                      [];
      return results.map(p => ({
        id: p.id,
        desc: p.alt_description,
        small: p.urls?.small,
        regular: p.urls?.regular
      }));
    }
  } catch (err) {
    console.error('Error searching:', term, err.message);
  }
  return [];
}

async function run() {
  const terms = [
    'headphones-white-background',
    'sneakers-white-background',
    'handbag-isolated',
    'cosmetics-bottles-white-background',
    'vegetables-white-background',
    'hoodie-white-background',
    'iphone-white-background',
    'vase-flowers-white-background',
    'running-shoes-white-background'
  ];

  const results = {};
  for (const term of terms) {
    const items = await search(term);
    console.log(`Term "${term}": ${items.length} items`);
    results[term] = items.slice(0, 5);
  }

  fs.writeFileSync('scripts/found-images.json', JSON.stringify(results, null, 2), 'utf8');
  console.log('Saved to scripts/found-images.json');
}

run();
