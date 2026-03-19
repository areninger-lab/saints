# Design Document: 5-6-7-8 Ballroom Dance Trainer

## Overview
**5-6-7-8** is a browser-based training game designed to help ballroom dancers practice two essential skills:
1.  **Dance Identification:** Recognizing which styles of dance (e.g., Waltz, Cha-Cha, Swing) are appropriate for a given song.
2.  **Rhythm & Timing:** Identifying the "1 beat" and coming in on time.

## Core Gameplay Loop
1.  **Song Loading:** A random song from a curated YouTube playlist is loaded into an embedded player.
2.  **Phase 1: Identify the Dance:**
    *   The user listens to the song.
    *   A set of elegant buttons representing different dance styles is displayed.
    *   The user selects the style they believe fits the music.
3.  **Phase 2: Find the Beat:**
    *   Once the dance is correctly identified (or skipped), the user must click a "Hit the 1!" button at the exact moment the "1 beat" occurs in the music.
    *   The game compares the user's click timestamp against the "answer key" of pre-defined "1 beats" for that song.
4.  **Feedback & Replay:**
    *   The game provides precision feedback (e.g., "0.2 seconds early", "Perfect!").
    *   The song is automatically replayed at a point just before the "1 beat" with a visual cue (e.g., a pulsing arrow or highlight) appearing at the exact answer timestamp.
5.  **Next Song:** The user can move to the next challenge.

## Technical Specifications
*   **Platform:** Web-based (HTML5, CSS3, JavaScript).
*   **Hosting:** GitHub Pages.
*   **Video Integration:** YouTube IFrame API for playback, seeking, and precise time monitoring.
*   **Data Structure:** A `songs.json` file containing:
    *   `youtubeId`: The unique ID from the YouTube URL.
    *   `danceType`: The correct dance style(s).
    *   `beats`: An array of millisecond timestamps for the "1 beat" throughout the song.

## UI/UX Design (Elegant Ballroom Theme)
*   **Color Palette:** Deep navy, champagne gold, and soft cream to evoke a high-end ballroom feel.
*   **Typography:** A mix of a classic serif for headings and a clean, readable sans-serif for interactive elements.
*   **Layout:**
    *   **Top:** Minimalist navigation and score (if applicable).
    *   **Center:** The YouTube player (visible for ads/controls).
    *   **Bottom:** Interactive buttons that change based on the game phase.
    *   **Feedback Overlay:** A sophisticated modal or overlay for timing results and the visual beat-cue.

## Future Roadmap
*   Support for multiple "1 beats" per song to practice different phrases.
*   Calibration tool for audio-to-click latency.
*   Leaderboard or progress tracking for dance studios.
