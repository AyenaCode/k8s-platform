import { t } from './i18n.js';

const COLS = 80, ROWS = 24;

// A faithful little macOS Terminal.app emulation: a colored zsh-style prompt
// (user@host dir %), a window title that tracks the running "process", and an
// output buffer that streams command results.
export class Terminal {
  constructor(wrapId, outputId, titleId, opts = {}) {
    this.wrap   = document.getElementById(wrapId);
    this.output = document.getElementById(outputId);
    this.title  = document.getElementById(titleId);
    this.user   = opts.user || 'you';
    this.host   = opts.host || 'k8s';
    this.dir    = opts.dir  || '~';
    this._cursor = null;
  }

  // macOS title format: "dir — process — 80×24".
  _setTitle(proc) {
    if (this.title) this.title.textContent = `${this.dir} — ${proc} — ${COLS}×${ROWS}`;
  }

  // Styled prompt fragment: user@host (green) dir (blue) % (muted).
  _promptFrag() {
    const f = document.createDocumentFragment();
    const seg = (cls, txt) => { const s = document.createElement('span'); s.className = cls; s.textContent = txt; return s; };
    f.append(seg('tp-user', `${this.user}@${this.host}`), document.createTextNode(' '),
             seg('tp-dir', this.dir), document.createTextNode(' '),
             seg('tp-sym', '%'), document.createTextNode(' '));
    return f;
  }

  _writeCommand(cmd) {
    const line = document.createElement('div');
    line.className = 'term-cmdline';
    line.appendChild(this._promptFrag());
    const c = document.createElement('span');
    c.className = 't-cmd';
    c.textContent = cmd;
    line.appendChild(c);
    this.output.appendChild(line);
  }

  // Fresh prompt + command, clearing the scrollback (used for scripts).
  show(label = '-zsh') {
    this.wrap.classList.add('visible');
    this.output.innerHTML = '';
    this._setTitle(_proc(label));
    this._writeCommand(label);
    this._addCursor();
    this.output.scrollTop = 0;
  }

  hide() { this.wrap.classList.remove('visible'); }

  // Wipe the scrollback (the `clear` command).
  clear() {
    this.wrap.classList.add('visible');
    this.output.innerHTML = '';
    this._setTitle('-zsh');
    this._addCursor();
  }

  // Append a typed command, keeping existing scrollback (terminal-like history).
  command(label) {
    this.wrap.classList.add('visible');
    this._removeCursor();
    this._setTitle(_proc(label));
    this._writeCommand(label);
    this._addCursor();
    this.output.scrollTop = this.output.scrollHeight;
  }

  chunk(msg) {
    this._removeCursor();
    const span = document.createElement('span');
    span.className = msg.type === 'err' ? 'term-line-err' : 'term-line-out';
    span.textContent = msg.text;
    this.output.appendChild(span);
    this._addCursor();
    this.output.scrollTop = this.output.scrollHeight;
  }

  done(ok) {
    this._removeCursor();
    this._setTitle('-zsh');
    const span = document.createElement('span');
    span.className = ok ? 'term-status ok' : 'term-status err';
    span.textContent = ok ? '\n✓ ' + t('term.done') + '\n' : '\n✗ ' + t('term.error') + '\n';
    this.output.appendChild(span);
    this.output.scrollTop = this.output.scrollHeight;
  }

  _addCursor() {
    this._removeCursor();
    const c = document.createElement('span');
    c.className = 'term-cursor';
    c.id = '_tc';
    this.output.appendChild(c);
  }

  _removeCursor() {
    document.getElementById('_tc')?.remove();
  }
}

// First token of the command, used as the window "process" name. `k` reads as kubectl.
function _proc(label) {
  const first = String(label).trim().split(/\s+/)[0] || '-zsh';
  if (first === 'k') return 'kubectl';
  return first.replace(/^\.\//, '');
}
