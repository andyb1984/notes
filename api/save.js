// /api/save.js
export default async function handler(req, res) {
  // Allow CORS so frontend can call it
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) return res.status(500).send("GitHub token not set");

  const { content } = req.body;

  const owner = "andyb1984"; // replace
  const repo = "notes";             // replace
  const path = "notes.txt";

  try {
    // Get current file SHA
    const getFile = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const fileData = await getFile.json();
    const sha = fileData.sha;

    // Update the file
    const updated = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: "Update notes",
        content: Buffer.from(content).toString("base64"),
        sha: sha
      })
    });

    if (updated.ok) {
      res.status(200).send("Saved!");
    } else {
      const errText = await updated.text();
      res.status(500).send("Error saving: " + errText);
    }
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
}
