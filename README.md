# Mark Cuban Companies Web Scraper
![Node](https://img.shields.io/badge/Node.js-18+-green)
![Axios](https://img.shields.io/badge/Axios-HTTP%20Client-blue)
![Cheerio](https://img.shields.io/badge/Cheerio-HTML%20Parser-yellow)
![License: MIT](https://img.shields.io/badge/License-MIT-brightgreen)

## 🔍 Preview Output
<img width="1379" height="584" alt="image" src="https://github.com/user-attachments/assets/3d4a5a78-9df5-405c-9cd7-2f63db800b2b" />

## 🚀 How it Works
1. Fetches the main page using Axios
2. Collects all /companies/ links
3. Loads each company page
4. Extracts brand name, website, and social links
5. Saves everything into example-output.csv


A lightweight Node.js web scraper built with **Axios** and **Cheerio**.  
This scraper collects company information from **markcubancompanies.com**, including:

- Brand name  
- Official website  
- Facebook link  
- Instagram link  

All results are exported into a clean CSV file (`example-output.csv`).  
This project is part of my portfolio to demonstrate real-world web scraping ability.

---

## 🚀 Features

- Automatically extracts all company URLs  
- Detects official brand websites (external links only)  
- Detects Facebook and Instagram using hostname matching  
- Fallback logic when website links are not clearly labeled  
- Custom User-Agent and polite delay between requests  
- Clean CSV output with escaped formatting  

---

## ▶️ Installation

Install all required dependencies:

```bash
npm install
```

## ▶️ Run the Scraper

Run the script using:

```bash
node scrape-mcc.js
```

## 📄 Output (CSV)

The scraper generates a CSV file:

```lua
example-output.csv
```

