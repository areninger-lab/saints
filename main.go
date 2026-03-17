package main

import (
	"embed"
	"fmt"
	"io/fs"
	"net"
	"net/http"
	"os"
	"os/exec"
	"runtime"
)

//go:embed index.html style.css game.js saints_data.json 99saints.csv
var content embed.FS

func main() {
	// Get the subdirectory fs
	serverRoot, err := fs.Sub(content, ".")
	if err != nil {
		fmt.Printf("Error creating sub filesystem: %v\n", err)
		os.Exit(1)
	}

	// Create a listener on a random port
	listener, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		fmt.Printf("Error creating listener: %v\n", err)
		os.Exit(1)
	}

	port := listener.Addr().(*net.TCPAddr).Port
	url := fmt.Sprintf("http://127.0.0.1:%d", port)

	fmt.Printf("Starting server at %s\n", url)
	fmt.Println("Press Ctrl+C to stop the game.")

	// Open the browser
	go openBrowser(url)

	// Start the server
	err = http.Serve(listener, http.FileServer(http.FS(serverRoot)))
	if err != nil {
		fmt.Printf("Error starting server: %v\n", err)
		os.Exit(1)
	}
}

func openBrowser(url string) {
	var err error
	switch runtime.GOOS {
	case "linux":
		err = exec.Command("xdg-open", url).Start()
	case "windows":
		err = exec.Command("rundll32", "url.dll,FileProtocolHandler", url).Start()
	case "darwin":
		err = exec.Command("open", url).Start()
	default:
		err = fmt.Errorf("unsupported platform")
	}
	if err != nil {
		fmt.Printf("Error opening browser: %v\n", err)
	}
}
