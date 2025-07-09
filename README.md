# CodeFolio

CodeFolio is a unified platform for programmers to manage their coding journey. It brings together your competitive programming profiles, contest tracking, and practice resources in one place.

## Features

### 1. Aggregated Coding Profiles
- **Unified Dashboard:** View your combined stats from platforms like LeetCode, Codeforces, CodeChef, AtCoder, GeeksforGeeks, and GitHub.
- **Individual Profiles:** Dive into detailed stats for each platform without leaving CodeFolio.
- **Profile Sync:** Always see your latest progress and achievements.

### 2. Contest Tracker
- **All Contests, One Place:** Browse upcoming and ongoing contests from multiple platforms.
- **Search & Filter:** Quickly find contests by platform or keyword.
- **Direct Registration:** Click any contest tile to go straight to the official registration page.

### 3. Practice DSA & Aptitude
- **DSA Practice:** Solve curated Data Structures & Algorithms questions, with difficulty and direct links.
- **Aptitude MCQs:** Practice aptitude questions in MCQ format, get instant feedback, and track your progress.

## Technical Details

- **Microservice Architecture:** The backend is split into multiple Spring Boot microservices for profile, contest, and practice management.
- **Frontend:** Built with React.js for a fast, interactive user experience.
- **Authentication:** Uses Okta for secure user authentication and authorization.
- **Database:** MySQL is used for persistent storage of user profiles, questions, and contest data.
- **Caching:** Redis is used to cache frequently accessed data and improve performance.
- **API Integrations:** Aggregates data from LeetCode, Codeforces, CodeChef, AtCoder, GeeksforGeeks, GitHub, and contest APIs.

## Getting Started

1. **Clone the repository**
   ```sh
   git clone https://github.com/yourusername/codefolio.git
