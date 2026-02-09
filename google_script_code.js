/* 
   GOOGLE APPS SCRIPT CODE
   1. Go to https://script.google.com/
   2. Click "New Project"
   3. Paste this code into the editor (replace existing code)
   4. Save (Cmd+S)
   5. Click "Deploy" -> "New Deployment"
   6. Select type: "Web App"
   7. Description: "Email Service"
   8. Execute as: "Me" (your email)
   9. Who has access: "Anyone" (IMPORTANT!)
   10. Click "Deploy"
   11. Copy the "Web App URL" (starts with https://script.google.com/macros/s/...)
   12. Paste that URL into index.html action attribute
*/

function doPost(e) {
    try {
        const data = JSON.parse(e.postData.contents);

        // Email Config
        const recipient = "gwar@gwar.bar"; // CHANGE THIS if needed
        const subject = "Nowa Rezerwacja (Strona WWW)";

        const body = `
      Nowa rezerwacja ze strony:
      --------------------------
      Imię i Nazwisko: ${data.name}
      Data: ${data.date}
      Godzina: ${data.time}
      Liczba osób: ${data.pax}
      Telefon: ${data.phone}
      
      --------------------------
      Wysłano automatycznie.
    `;

        MailApp.sendEmail(recipient, subject, body);

        return ContentService.createTextOutput(JSON.stringify({ 'result': 'success' }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({ 'result': 'error', 'error': error.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

// Handle OPTIONS for CORS (Preflight)
function doOptions(e) {
    var output = ContentService.createTextOutput("");
    output.setMimeType(ContentService.MimeType.TEXT);
    return output;
}
