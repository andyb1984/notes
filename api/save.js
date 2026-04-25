export default async function handler(req, res) {
  const token = process.env.GITHUB_TOKEN;

  return res.status(200).json({
    tokenExists: !!token,
    tokenPrefix: token ? token.slice(0, 8) : null
  });
}
