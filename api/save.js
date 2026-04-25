export default async function handler(req, res) {
  // Change "*" to your specific github.io URL for better security, 
  // or keep "*" to allow it to work from anywhere.
  res.setHeader("Access-Control-Allow-Origin", "*"); 
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // 2. Safely get the token
  const rawToken = process.env.GITHUB_TOKEN || "";
  const token = rawToken.trim();

  if (!token) {
    return res.status(500).send("Server Error: GITHUB_TOKEN is not configured in Vercel.");
  }

  try {
    const { content } = req.body;
    const owner = "andyb1984";
    const repo = "notes"; 
    const path = "notes.txt";

    // 3. Get the File SHA (Necessary for updates)
    const getFileResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
        },
      }
    );

    if (!getFileResponse.ok) {
      const errorText = await getFileResponse.text();
      return res.status(getFileResponse.status).send(`GitHub Read Error: ${errorText}`);
    }

    const fileData = await getFileResponse.json();
    const sha = fileData.sha;

    // 4. Update the file
    // Note: We use Buffer.from for Node.js environments to handle base64
    const updateResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "Updated via Web Editor",
          content: Buffer.from(content || "").toString("base64"),
          sha: sha,
        }),
      }
    );

    if (updateResponse.ok) {
      return res.status(200).send("Saved successfully!");
    } else {
      const errorData = await updateResponse.text();
      return res.status(500).send(`GitHub Write Error: ${errorData}`);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send(`Server Crash: ${error.message}`);
  }
}
