/*************************************************
  KONFIGURACJA
*************************************************/
const ADMIN_EMAIL = "gwar@gwar.bar";
const IOS_BRIDGE_URL = "https://bar.gwar.bar/confirm.html";


/*************************************************
  NOWA REZERWACJA
*************************************************/
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const reservationId = Date.now().toString();

    const confirmLink =
      `${IOS_BRIDGE_URL}?confirm=${reservationId}` +
      `&email=${encodeURIComponent(data.email)}` +
      `&date=${encodeURIComponent(data.date)}` +
      `&time=${encodeURIComponent(data.time)}`;

    const commentLine = data.comment ? `\nUwagi: ${data.comment}` : "";

    const whatsappMessage =
      `NOWA REZERWACJA\n\n` +
      `${data.date} ${data.time}\n` +
      `${data.pax} osób\n` +
      `${data.name}\n` +
      `Tel: ${data.phone}` +
      commentLine;

    const whatsappLink = "https://wa.me/?text=" + encodeURIComponent(whatsappMessage);

    const adminBody =
      `NOWA REZERWACJA\n\n` +
      `Imię: ${data.name}\n` +
      `Telefon: ${data.phone}\n` +
      `Email: ${data.email}\n` +
      `Data: ${data.date} ${data.time}\n` +
      `Osoby: ${data.pax}\n` +
      `Komentarz: ${data.comment || "Brak"}\n\n` +
      `----------------------------------\n\n` +
      `POTWIERDZENIE:\n${confirmLink}\n\n` +
      `----------------------------------\n\n` +
      `WHATSAPP:\n${whatsappLink}`;

    GmailApp.sendEmail(ADMIN_EMAIL, `Nowa Rezerwacja – ${data.date} ${data.time}`, adminBody, {
        from: "gwar@gwar.bar", name: "GWAR", replyTo: "gwar@gwar.bar"
    });

    GmailApp.sendEmail(data.email, "Rezerwacja otrzymana", `Dziękujemy za rezerwację.\n\nTwoja rezerwacja została przyjęta i oczekuje na potwierdzenie.\n\nGWAR`, {
        from: "gwar@gwar.bar", name: "GWAR", replyTo: "gwar@gwar.bar"
    });

    return ContentService.createTextOutput("OK").setMimeType(ContentService.MimeType.TEXT);
  } catch (error) {
    return ContentService.createTextOutput("ERROR: " + error.toString()).setMimeType(ContentService.MimeType.TEXT);
  }
}

/*************************************************
  POTWIERDZENIE (Zwraca TEKST dla Bridge)
*************************************************/
function doGet(e) {
  if (!e.parameter.confirm) return ContentService.createTextOutput("INVALID");

  const reservationId = e.parameter.confirm;
  const clientEmail = e.parameter.email;
  const date = e.parameter.date;
  const time = e.parameter.time;

  const cache = CacheService.getScriptCache();
  const alreadyConfirmed = cache.get(reservationId);

  if (alreadyConfirmed) return ContentService.createTextOutput("ALREADY_CONFIRMED");

  cache.put(reservationId, "CONFIRMED", 86400);

  GmailApp.sendEmail(clientEmail, "Rezerwacja potwierdzona", `Twoja rezerwacja została potwierdzona.\n\nZapraszamy ${date} ${time}.\n\nDo zobaczenia!\nGWAR`, {
      from: "gwar@gwar.bar", name: "GWAR", replyTo: "gwar@gwar.bar"
  });

  return ContentService.createTextOutput("SUCCESS").setMimeType(ContentService.MimeType.TEXT);
}

function doOptions() {
  return ContentService.createTextOutput("").setMimeType(ContentService.MimeType.TEXT);
}
