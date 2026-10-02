---
name: site-check
description: Sprawdza żywą stronę bar.gwar.bar po zmianach - deploy, opinie Google, galeria Instagrama, menu PDF, błędy w konsoli, GitHub Actions. Użyj po każdym pushu lub gdy coś "nie działa na stronie".
---

# Kontrola strony bar.gwar.bar

Tylko odczyt – niczego nie zmieniaj. Na końcu krótka tabela ✅/❌ po polsku.

1. **GitHub Actions**: `gh run list -R gwarbar/gwar-website -L 8` – czy ostatnie `Deploy static content to Pages`, `Update Google reviews`, `Update Instagram feed` są `success`. Przy błędzie: `gh run view <id> --log-failed`.
2. **Deploy aktualny**: porównaj `git rev-parse origin/main` z czasem ostatniego udanego deployu; sprawdź, że `curl -s https://bar.gwar.bar/js/main.js?x=$RANDOM | head -1` ma tę samą wersję `api.js?v=` co lokalny `js/main.js`.
3. **Przeglądarka** (wbudowana): otwórz `https://bar.gwar.bar/?nocache=<losowa>`, poczekaj ~4 s i przez JS sprawdź:
   - `#reviews .review-card` – ile kart, autorzy, czy obrazki (`.google-badge img`, avatary) mają `naturalWidth > 0`,
   - `#gallery .insta-post` – ile postów i czy każdy obrazek z `backgroundImage` się ładuje,
   - błędy w konsoli (`read_console_messages`, `onlyErrors`).
4. **Menu**: otwórz `https://bar.gwar.bar/menu.html`, sprawdź że PDF się renderuje i brak błędów.
5. **Świeżość danych**: `curl -s https://bar.gwar.bar/data/instagram.json` → `lastChangedAt` (alarm, jeśli > 7 dni); `data/reviews.json` → liczba opinii.
6. **Przypomnienia Behold**: `gh issue list -R gwarbar/gwar-website --state open` – czy wisi otwarte przypomnienie/alarm.

Na koniec zamknij kartę przeglądarki, jeśli to Ty ją otworzyłeś.
