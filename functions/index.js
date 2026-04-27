const { onCall, HttpsError } = require("firebase-functions/v2/https");

exports.fetchLudopedia = onCall(
  { cors: ["https://seiji.life", "https://www.seiji.life", /localhost(:\d+)?$/] },
  async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Login necessário");
  }

  const url = request.data.url;
  if (!url || !url.includes("ludopedia.com.br/jogo/")) {
    throw new HttpsError("invalid-argument", "URL inválida. Use um link da Ludopedia.");
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; BoardgamesFetcher/1.0)",
        "Accept": "text/html",
      },
    });

    if (!response.ok) {
      throw new HttpsError("unavailable", `Ludopedia returned ${response.status}`);
    }

    const html = await response.text();
    return { html };
  } catch (error) {
    if (error instanceof HttpsError) throw error;
    console.error("Error fetching Ludopedia:", error);
    throw new HttpsError("internal", "Erro ao buscar página da Ludopedia");
  }
});
