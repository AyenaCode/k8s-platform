# Vim — Survival for the CKA

## ~/.vimrc to configure before the exam

```
set expandtab
set tabstop=2
set shiftwidth=2
```

Without this → hard tabs → invalid YAML → pods that won't start.

## Modes

```
i         → insert (type text)
Esc       → return to normal mode
```

## Save / Quit

```
:w        → save
:wq       → save and quit
:q!       → quit WITHOUT saving (if you broke everything)
```

## Quick navigation

```
gg        → go to the beginning of the file
G         → go to the end
:42       → go to line 42
0         → beginning of the line
$         → end of the line
```

## Search

```
/mot      → search for "mot"
n         → next occurrence
N         → previous occurrence
```

## Edit

```
dd        → delete the current line
yy        → copy the current line
p         → paste after the cursor
u         → undo
Ctrl+r    → redo
```

## YAML indentation (the most important)

```
>>        → indent the line (normal mode)
<<        → unindent the line
```

In insert mode: use the Tab key (if vimrc is correctly configured → 2 spaces).

## Typical exam workflow

```bash
# 1. Generate the YAML
k run mypod --image=nginx $do > pod.yaml

# 2. Edit the 2-3 missing lines
vi pod.yaml

# 3. Apply
k apply -f pod.yaml

# 4. Verify
k get pod mypod
k describe pod mypod
```

## If vim frustrates you during the exam

```bash
# Use nano instead — simpler
nano /etc/kubernetes/manifests/kube-scheduler.yaml
# Ctrl+O → save
# Ctrl+X → quit
```
