// Package terminal exposes a real interactive shell over a WebSocket. A pseudo
// terminal (PTY) is spawned per connection, so full-screen programs like vim,
// nano and `kubectl edit` work. This is the UNRESTRICTED terminal used for
// editing — exercise solving still goes through the restricted safe box
// (package exec), which keeps the anti-cheat denylist.
//
// Wire protocol (browser -> server):
//   - text/binary frame      => raw keystrokes, written straight to the PTY
//   - frame starting 0x01    => resize: 0x01 | rows(uint16 BE) | cols(uint16 BE)
package terminal

import (
	"encoding/binary"
	"log/slog"
	"net/http"
	"os"
	"os/exec"

	"github.com/coder/websocket"
	"github.com/creack/pty"
)

const resizeOpcode = 0x01

type Handler struct {
	shell    string
	cwd      string
	allowed  []string // allowed websocket origins; nil = same-origin only
	log      *slog.Logger
}

func NewHandler(shell, cwd string, allowedOrigins []string, log *slog.Logger) *Handler {
	return &Handler{shell: shell, cwd: cwd, allowed: allowedOrigins, log: log}
}

func (h *Handler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	conn, err := websocket.Accept(w, r, &websocket.AcceptOptions{
		OriginPatterns: h.allowed, // empty => same-origin requests only
	})
	if err != nil {
		h.log.Warn("ws accept failed", "err", err)
		return
	}
	// CloseNow on exit guarantees the PTY goroutines unblock.
	defer conn.CloseNow()

	ctx := r.Context()

	cmd := exec.Command(h.shell)
	cmd.Dir = h.cwd
	cmd.Env = append(os.Environ(), "TERM=xterm-256color")

	ptmx, err := pty.Start(cmd)
	if err != nil {
		h.log.Error("pty start failed", "err", err)
		conn.Close(websocket.StatusInternalError, "pty failed")
		return
	}
	defer func() {
		_ = ptmx.Close()
		_ = cmd.Process.Kill()
		_, _ = cmd.Process.Wait()
	}()

	// PTY -> browser: stream output as binary frames.
	go func() {
		buf := make([]byte, 32*1024)
		for {
			n, err := ptmx.Read(buf)
			if n > 0 {
				if werr := conn.Write(ctx, websocket.MessageBinary, buf[:n]); werr != nil {
					return
				}
			}
			if err != nil {
				conn.Close(websocket.StatusNormalClosure, "")
				return
			}
		}
	}()

	// browser -> PTY: keystrokes, or resize control frames.
	for {
		_, data, err := conn.Read(ctx)
		if err != nil {
			return
		}
		// Known limitation: a real Ctrl-A (0x01) keystroke immediately followed
		// by 4 bytes in one frame is misread as a resize. Rare in practice; a
		// dedicated control channel is the clean fix when this is revisited.
		if len(data) == 5 && data[0] == resizeOpcode {
			rows := binary.BigEndian.Uint16(data[1:3])
			cols := binary.BigEndian.Uint16(data[3:5])
			_ = pty.Setsize(ptmx, &pty.Winsize{Rows: rows, Cols: cols})
			continue
		}
		if _, err := ptmx.Write(data); err != nil {
			return
		}
	}
}
