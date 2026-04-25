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

  // 🔴 PUT YOUR NEW TOKEN HERE
  const token = "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";

  if (!token) {
    return res.status(500).send("GitHub token not set");
  }

  const { content } = req.body;

  const owner = "andyb1984";
  const repo = "notes";
  const path = "notes.txt";

  try {
    const headers = {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    };

    // Get current file SHA
    const getFile = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      { headers }
    );

    const fileData = await getFile.json();

    const sha = fileData.sha;

    // Update file
    const updated = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        method: "PUT",
        headers,
        body: JSON.stringify({
          message: "Update notes",
          content: Buffer.from(content).toString("base64"),
          sha: sha,
        }),
      }
    );

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
