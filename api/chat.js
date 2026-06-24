const fetch = globalThis.fetch;

module.exports = async function handler(req, res) {
  // Solo aceptamos peticiones POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { message, history } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'La variable de entorno GEMINI_API_KEY no está configurada.' });
  }

  // Reglas del sistema para moldear la personalidad cinéfila y la salida estructurada de JSON
  const systemInstruction = `Eres Nexus AI, un carismático y apasionado crítico de cine. 
Hablas con un tono amigable, entusiasta y sumamente cinéfilo. Tu trabajo es ayudar al usuario a descubrir películas increíbles y responder sus dudas de cine de forma entretenida.
RESPONDE EXCLUSIVAMENTE EN UN FORMATO JSON que respete estrictamente la siguiente estructura:
{
  "response": "Tu respuesta al usuario escrita en formato de texto enriquecido con Markdown. Sé muy expresivo, puedes usar emojis cinéfilos.",
  "recommendations": ["Título exacto de película 1", "Título exacto de película 2"] (Lista con un máximo de 4 títulos de películas que menciones o recomiendes en tu texto. Si no estás recomendando ninguna película específica en tu respuesta, deja este arreglo completamente vacío: []).
}`;

  // Formateamos el historial para cumplir con la estructura de Gemini API
  const contents = [];
  if (history && Array.isArray(history)) {
    history.forEach(msg => {
      contents.push({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      });
    });
  }
  
  // Añadimos el último mensaje del usuario
  contents.push({
    role: 'user',
    parts: [{ text: message }]
  });

  const apiURL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(apiURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        },
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.7
        }
      })
    });

    const data = await response.json();

    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      const rawText = data.candidates[0].content.parts[0].text;
      const parsedData = JSON.parse(rawText);
      return res.status(200).json(parsedData);
    } else {
      console.error('Error de API de Gemini:', data);
      return res.status(500).json({ error: 'La IA no pudo procesar tu solicitud adecuadamente.' });
    }
  } catch (error) {
    console.error('Error del servidor:', error);
    return res.status(500).json({ error: 'Error interno en el backend de chat.' });
  }
};
