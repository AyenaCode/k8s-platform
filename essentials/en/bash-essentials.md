# Bash — Survival for the CKA

## Redirection

```bash
commande > file.yaml        # write to a file (overwrites)
commande >> file.yaml       # append to the end
commande 2>&1               # capture errors as well
```

## Pipes

```bash
k get pods | grep Running
k describe pod x | grep -i image
k get pods -o yaml | grep -A5 "resources:"
```

## Useful grep

```bash
grep -i "mot"               # case-insensitive
grep -A5 "mot"              # 5 lines AFTER the match
grep -B5 "mot"              # 5 lines BEFORE the match
grep -r "mot" /etc/         # recursive in a folder
grep -E "Error|Warning"     # extended regex: Error OR Warning
grep -Ei "error|warn|fail"  # extended regex + case-insensitive

# Most useful combo at the exam:
k describe pod <pod> | grep -E "State|Reason|Image|Node"
```

## Copy-paste in the terminal

```
Ctrl+Shift+C    → copy
Ctrl+Shift+V    → paste
```

## History

```bash
Ctrl+R          # search through history (type a word, Enter to execute)
!!              # re-run the last command
!k              # re-run the last command starting with "k"
```

## Navigation

```bash
Ctrl+A          # beginning of the line
Ctrl+E          # end of the line
Ctrl+U          # clear the entire line
Ctrl+W          # delete the word before the cursor
```

## Curl (testing a service from inside)

```bash
k exec -it <pod> -- curl http://<svc-name>.<namespace>.svc.cluster.local
k exec -it <pod> -- curl http://10.96.30.161:80
```

## SSH on a node (real cluster)

```bash
ssh node01
sudo -i                     # become root
cat /etc/kubernetes/manifests/kube-scheduler.yaml
```

## Handy variables (exam setup)

```bash
export do='--dry-run=client -o yaml'
export now='--grace-period=0 --force'

# Usage:
k run pod1 --image=nginx $do > pod1.yaml
k delete pod pod1 $now
```
