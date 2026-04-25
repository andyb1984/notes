// /api/save.js
export default async function handler(req, res) {
  // Allow frontend requests
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle browser preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  // Pull token securely from Vercel Environment Variables
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    return res.status(500).send("Missing GITHUB_TOKEN environment variable");
  }

  const { content } = req.body;

  const owner = "andyb1984";
  const repo = "notes";
  const path = "notes.txt";

  try {
    const headers = {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json"
    };

    // Step 1: Get existing file SHA
    const getFile = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      { headers }
    );

    if (!getFile.ok) {
      const err = await getFile.text();
      return res.status(500).send("Error reading file: " + err);
    }

    const fileData = await getFile.json();
    const sha = fileData.sha;

    // Step 2: Update file
    const updateFile = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        method: "PUT",
        headers,
        body: JSON.stringify({
          message: "Update notes",
          content: Buffer.from(content || "").toString("base64"),
          sha: sha
        })
      }
    );

    if (!updateFile.ok) {
      const err = await updateFile.text();
      return res.status(500).send("Error saving: " + err);
    }

    return res.status(200).send({
  tokenStartsWith: token?.slice(0, 10),
  hasToken: !!token
});
  } catch (error) {
    return res.status(500).send("Server error: " + error.message);
  }
}
