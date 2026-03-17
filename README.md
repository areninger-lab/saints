# Saints Timeline Game

A fun, interactive timeline game where you place saints in the correct chronological order based on their lives.

## How to Play

### Option 1: Play Online (Recommended)
This game is hosted using GitHub Pages. To play:
1. Go to the **Settings** tab of this repository.
2. Click on **Pages** in the left sidebar.
3. Under **Branch**, select `saints-game-upload` (or `main` after the PR is merged) and the folder `/ (root)`.
4. Click **Save**.
5. After a minute, your game will be live at `https://<your-username>.github.io/<repository-name>/`.

### Option 2: Build as a Windows App (Optional)
If you prefer a standalone app and have Go installed:
1. Build the executable: `GOOS=windows GOARCH=amd64 go build -o saints-game.exe main.go`
2. Double-click `saints-game.exe` to run.
3. Note: Windows may show a security warning for unsigned apps. Click **More info** -> **Run anyway** to play.

## Development
The game is built with:
- HTML5/CSS3/JavaScript
- Go (for the Windows wrapper)

The data is managed in `saints_data.json` and sourced from `99saints.csv`.
