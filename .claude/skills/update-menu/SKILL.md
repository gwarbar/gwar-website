---
name: update-menu
description: Aktualizacja menu Bar Gwar z nowego PDF-a (menu.html, pdf/menu_pl.pdf, tłumaczenia). Użyj, gdy przychodzi nowe menu lub wkładka sezonowa.
disable-model-invocation: true
argument-hint: "[ścieżka do PDF, np. pdfy/Gwar_Menu ....pdf]"
---

# Aktualizacja menu Bar Gwar

Źródło: `$ARGUMENTS`. Jeśli puste – pokaż najnowsze pliki w `pdfy/` (`ls -t pdfy/`) i zapytaj, który to nowy PDF i czy to całe menu, czy wkładka sezonowa.

## 1. Przygotowanie
1. Przeczytaj **`menu_update_guidelines.txt`** – wszystkie 10 zasad obowiązuje bezwzględnie.
2. Przeczytaj nowy PDF w całości (Read z `pages`). Przy wątpliwościach (drobny druk, składniki) zrób zrzut/zoom strony – zasada nr 1: składniki ZAWSZE z PDF-a.
3. Przejrzyj obecny `menu.html`: struktura `menu-category` → `menu-sub-section` → `menu-grid` → `menu-item` (`menu-item-name`, `menu-item-price`, `menu-item-desc`, atrybuty `data-i18n` = tekst polski).

## 2. Zmiany w `menu.html`
- Zrób listę różnic (nowe / usunięte / zmienione ceny / zmienione składniki) i **pokaż ją użytkownikowi przed edycją**, jeśli zmian jest dużo albo coś jest niejasne.
- Każdy wariant to osobny `menu-item` (zasada 2). Ceny w formacie `38 PLN`.
- `data-i18n` musi być identyczne z widocznym tekstem polskim.

## 3. PDF na stronie
- Skopiuj nowy PDF do `pdf/menu_pl.pdf` (to on wyświetla się w przeglądarce PDF.js). Jeśli jest nowa wersja angielska – `pdf/menu_en.pdf`.
- Oryginał zostaje w `pdfy/` (nie jest publikowany na stronie).

## 4. Tłumaczenia
- Nowe nazwy/opisy dopisz do `MENU_DICTIONARY` w `js/translations.js` (en, de, fr, es, ua), wzorując się na istniejących wpisach.
- Brakujące tłumaczenia sprawdź: `node test_translations.mjs` (wymaga `jsdom` – jeśli brak, zainstaluj tymczasowo w scratchpadzie, nie w repo).

## 5. Weryfikacja
1. Uruchom subagenta **`menu-verifier`** z PDF-em i `menu.html` – popraw wszystko, co znajdzie.
2. Podgląd lokalny: `python3 -m http.server 8765` w katalogu repo, otwórz `http://localhost:8765/menu.html` w przeglądarce, sprawdź wygląd i konsolę. Potem zatrzymaj serwer.

## 6. Publikacja
- Pokaż podsumowanie zmian i **zapytaj o zgodę** – push na `main` od razu zmienia stronę na żywo.
- Commit np. `Update menu: <sezon/data>`, push, potem `/site-check`.
