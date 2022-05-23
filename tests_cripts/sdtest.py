import sounddevice as sd
import numpy as np
import time
from scipy.io.wavfile import write

audio_buffer = []


def audio_callback(indata, *_):
    audio_buffer.append(np.copy(indata))


stream = sd.InputStream(
    channels=1,
    samplerate=44100,
    callback=audio_callback,
)

stream.start()
start_time = time.time()
print("recording...")
seconds = 5
while True:
    current_time = time.time()
    elapsed_time = current_time - start_time

    if elapsed_time > seconds:
        break

stream.stop()

flat_list = []
for sublist in audio_buffer:
    for item in sublist:
        flat_list.append(item)

audiobuffernd = np.array(flat_list)
print(audiobuffernd)
# print('len: ',len(audiobuffernd))
# write("asdf.wav", 44100, audiobuffernd)
