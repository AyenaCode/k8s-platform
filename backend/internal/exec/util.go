package exec

import "os"

// statDir reports whether path exists and is a directory.
func statDir(path string) (bool, error) {
	fi, err := os.Stat(path)
	if err != nil {
		return false, err
	}
	return fi.IsDir(), nil
}
