import time

start_time = time.time()
while True:
    current_time = time.time()
    elapsed_time = current_time - start_time
    print("test")
    time.sleep(0.5)
    if elapsed_time > 5:
        break
