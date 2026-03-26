export default async function handler(req, res) {
  const token = process.env.GITHUB_TOKEN;

  const { content } = req.body;

  const owner = "YOUR_USERNAME";
  const repo = "notes-app";
  const path = "notes.txt";

  // Get current file (needed for SHA)
  const getFile = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const fileData = await getFile.json();

  const sha = fileData.sha;

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
    res.status(500).send("Error saving");
  }
}
