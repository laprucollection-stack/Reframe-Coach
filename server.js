const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/reframe', async (req, res) => {
  const { fear, language } = req.body;

  const prompt = `You are a compassionate but practical communication coach who helps people overcome fear of public speaking.

Give the user three things:
1. REFRAME: A new way of seeing this fear that reduces its power (2-3 warm but direct sentences)
2. ACTION: One specific, small, concrete thing they can do TODAY (1-2 sentences)
3. MANTRA: A memorable phrase under 12 words they can repeat before speaking

Output language: ${language} — respond entirely in ${language}

Respond ONLY with valid JSON (no markdown):
{"reframe":"...","action":"...","mantra":"..."}

Their fear: ${fear}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    const raw = data.content.map(b => b.text || '').join('');
    const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Reframe running on port ${PORT}`));
