/* ============================================================
   CMS — Supabase connection for the Work page (Simple CMS)
   The publishable key is SAFE in frontend code: it only allows
   reading rows the database policy marks public. Secrets live in
   Netlify env vars, never in this repo.
   ============================================================ */
window.CMS = {
  url: 'https://jaicdkzevoswlmvnphbv.supabase.co',
  key: 'sb_publishable_F0Xj3FCh1G0TsMvg2gshpg_wqw4EWsT',

  /* fetch live projects, ordered by `sort`.
     Resolves with an array of { title, client, year, meta, colors }
     or throws — callers fall back to the built-in content. */
  async projects() {
    const res = await fetch(
      `${this.url}/rest/v1/projects?select=title,client,year,meta,colors,sort&live=is.true&order=sort.asc&limit=24`,
      { headers: { apikey: this.key } }
    );
    if (!res.ok) throw new Error('CMS fetch ' + res.status);
    return res.json();
  },
};
