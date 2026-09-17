// Shared by the dev-only (`vite` serve) plugins that mount api/*.js handlers.

// Vercel's Node runtime adds res.status()/res.json(); connect's res doesn't
export function withVercelHelpers(res) {
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (body) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(body));
    return res;
  };
  return res;
}
