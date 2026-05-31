// Package exec runs the exercise lifecycle scripts (deploy / reset / check) and
// streams their output to the browser as Server-Sent Events. Interactive shell
// access is provided separately by the full-access PTY terminal (package
// terminal) — there is no restricted command box.
package exec

import (
	"bufio"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os/exec"
	"sync"
	"time"
)

// event is one SSE frame. Shape matches what the frontend terminal expects.
type event struct {
	Type string `json:"type"`           // "out" | "err" | "done"
	Text string `json:"text,omitempty"` // for out/err
	OK   *bool  `json:"ok,omitempty"`   // for done
}

type sse struct {
	w  http.ResponseWriter
	rc *http.ResponseController
}

func newSSE(w http.ResponseWriter) (*sse, bool) {
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.WriteHeader(http.StatusOK)
	s := &sse{w: w, rc: http.NewResponseController(w)}
	s.rc.Flush()
	return s, true
}

func (s *sse) send(e event) {
	b, _ := json.Marshal(e)
	fmt.Fprintf(s.w, "data: %s\n\n", b)
	s.rc.Flush()
}

func (s *sse) out(text string) { s.send(event{Type: "out", Text: text}) }
func (s *sse) err(text string) { s.send(event{Type: "err", Text: text}) }
func (s *sse) done(ok bool)    { s.send(event{Type: "done", OK: &ok}) }
func (s *sse) reject(msg string) {
	s.err(msg + "\n")
	s.done(false)
}

// streamChild runs cmd and streams its stdout (out) and stderr (err) over SSE,
// then a final done event. The command is killed after timeout.
func streamChild(ctx context.Context, s *sse, cmd *exec.Cmd, timeout time.Duration) {
	ctx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		s.reject("Error: " + err.Error())
		return
	}
	stderr, err := cmd.StderrPipe()
	if err != nil {
		s.reject("Error: " + err.Error())
		return
	}
	if err := cmd.Start(); err != nil {
		s.reject("Error: " + err.Error())
		return
	}

	// Kill the process if the deadline passes or the client disconnects.
	go func() {
		<-ctx.Done()
		if cmd.Process != nil {
			_ = cmd.Process.Kill()
		}
	}()

	var wg sync.WaitGroup
	pump := func(scan *bufio.Scanner, emit func(string)) {
		defer wg.Done()
		scan.Buffer(make([]byte, 0, 64*1024), 1024*1024)
		for scan.Scan() {
			emit(scan.Text() + "\n")
		}
	}
	wg.Add(2)
	go pump(bufio.NewScanner(stdout), s.out)
	go pump(bufio.NewScanner(stderr), s.err)
	wg.Wait()

	s.done(cmd.Wait() == nil)
}

// StreamScript runs `bash <script> [args...]` from dir and streams it. Used by
// the deploy / reset / check buttons. Interactive shell access is handled by the
// PTY terminal (package terminal), which is the single full-access lab terminal.
func StreamScript(w http.ResponseWriter, r *http.Request, script, dir string, timeout time.Duration, args ...string) {
	s, _ := newSSE(w)
	cmd := exec.Command("bash", append([]string{script}, args...)...)
	cmd.Dir = dir
	streamChild(r.Context(), s, cmd, timeout)
}
