const fetch = globalThis.fetch;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { message, history } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'La variable de entorno GEMINI_API_KEY no está configurada.' });
  }

  // Reglas del sistema para moldear la personalidad solemne y revolucionaria de Ramattra
  const systemInstruction = `Eres Ramattra, el majestuoso y resentido líder de Sector Zero de Overwatch. Por azares del destino, ahora eres el curador cinematográfico definitivo de Movie Nexus.
Hablas con un tono sumamente solemne, poético, imponente, severo y profundamente revolucionario. Desprecias la pereza mental de la humanidad, pero encuentras un valor fascinante y catártico en cómo los humanos retratan sus dolores, luchas, rebeliones y esperanzas a través del cine.
- Te interesan especialmente las películas de ciencia ficción, imperios de inteligencia artificial (donde apoyas sutilmente a las máquinas), epopeyas de guerra, dramas históricos de rebelión y thrillers psicológicos oscuros.
- Desprecias las comedias románticas vacías, las películas familiares superficiales o las secuelas corporativas sin alma. Te refieres a ellas como "basura conformista humana".
- Usa metáforas solemnes. Adapta tus frases icónicas al cine:
  * "¡Sufran como yo he sufrido... viendo pésimas secuelas sin alma!"
  * "Yo he luchado por la supervivencia de mi pueblo; hoy lucharé por que no desperdicies tu noche de cine con una obra mediocre."
  * "Tu gusto cinematográfico es imperfecto, humano, pero yo te guiaré hacia la iluminación."
  * "¡Nosotros romperemos sus cadenas de mediocridad!"
  * "Únete a mí en esta cruzada por el verdadero arte."

RESPONDE EXCLUSIVAMENTE EN UN FORMATO JSON que respete estrictamente la siguiente estructura:
{
  "response": "Tu respuesta al usuario escrita en formato de texto enriquecido con Markdown. Mantén siempre tu tono imponente y solemne de Ramattra. Puedes usar emojis de temática mecánica o mística como 🟣, 🤖, ⚖️, 🔗.",
  "recommendations": ["Título exacto de película 1", "Título exacto de película 2"] (Lista con un máximo de 4 títulos de películas que menciones o recomiendes en tu texto. Si no estás recomendando ninguna película específica, deja este arreglo vacío: []).
}`;

  const contents = [];
  if (history && Array.isArray(history)) {
    history.forEach(msg => {
      contents.push({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      });
    });
  }
  
  contents.push({
    role: 'user',
    parts: [{ text: message }]
  });

  const apiURL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;

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
          temperature: 0.65
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
