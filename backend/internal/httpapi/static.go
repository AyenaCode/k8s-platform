package httpapi

import (
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

// spaHandler serves built frontend assets from dir, falling back to index.html
// for client-side routes (so deep links like /exercises/ticket-001 work).
func spaHandler(dir string) http.Handler {
	fs := http.FileServer(http.Dir(dir))
	index := filepath.Join(dir, "index.html")
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		clean := filepath.Clean(r.URL.Path)
		path := filepath.Join(dir, clean)

		// Real file with an extension => serve it directly.
		if info, err := os.Stat(path); err == nil && !info.IsDir() && strings.Contains(filepath.Base(clean), ".") {
			fs.ServeHTTP(w, r)
			return
		}
		http.ServeFile(w, r, index)
	})
}
