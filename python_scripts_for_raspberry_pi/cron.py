import time
from subprocess import check_output

while True:
    out = check_output(["python3", "classify2.py", "-s", "60"])
    print(out)
    time.sleep(60)
