# Web Quiz Application

A lightweight, responsive quiz app you can open directly in your browser. No build step or backend required.

## Features

- Choose category, difficulty, and number of questions
- Optional time limit per quiz
- Shuffle questions (setting)
- Results with per-question review
- Keyboard navigation (1–9 to select, arrows to move)
- High contrast mode and accessible roles/labels
- State saved in `localStorage` (settings & preferences)

## Getting Started

1. Download or clone this folder.
2. Open `index.html` in your browser.

That’s it.

## Project Structure

- `index.html` – App markup and screens
- `styles.css` – Responsive, modern styling
- `script.js` – Quiz logic and UI interactions
- `questions.js` – Sample question bank (edit or replace)

## Customizing Questions

Edit `questions.js`. Each question has:

```js
{
  id: "unique-id",
  category: "general" | "science" | "tech" | etc,
  difficulty: "easy" | "medium" | "hard",
  question: "Text?",
  choices: ["A", "B", "C", "D"],
  answerIndex: 2 // zero-based
}
```

You can add new categories or difficulties; they’ll appear when you select **Any**, or add them to the dropdowns in `index.html` if you want explicit options.

## Notes

- No internet connection required after first load (fonts are optional).
- Works in modern browsers.

