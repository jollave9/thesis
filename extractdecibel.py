from pydub import AudioSegment
import numpy as np
import soundfile as sfile
import math
import matplotlib.pyplot as plt
import json
import sys
import os

# filename = "./public/recording_2.wav"
if os.path.isfile(sys.argv[1]) and sys.argv[1].split(".")[-1] == "wav":
    file = sys.argv[1]
else:
    sys.exit("invalid file")
# https://freewavesamples.com/files/Alesis-Sanctuary-QCard-Crickets.wav

# audio = AudioSegment.from_mp3(file)
signal, sr = sfile.read(file)
# samples = audio.get_array_of_samples()
samples_sf = 0
try:
    samples_sf = signal[:, 0]  # use the first channel for dual
except:
    samples_sf = signal  # for mono


def convert_to_decibel(arr):
    ref = 1
    if arr != 0:
        return 20 * np.log10(abs(arr) / ref)

    else:
        return -60


data = [convert_to_decibel(i) for i in samples_sf]

filename = os.path.basename(file)
json_object = json.dumps(data, indent=4)
with open(f"./data/{filename.replace('wav','json')}", "w") as outfile:
    outfile.write(json_object)
# print(len(data))

# percentile=np.percentile(data,[25,50,75])
# print(f"1st Quartile : {percentile[0]}")
# print(f"2nd Quartile : {percentile[1]}")
# print(f"3rd Quartile : {percentile[2]}")
# print(f"Mean : {np.mean(data)}")
# print(f"Median : {np.median(data)}")
# print(f"Standard Deviation : {np.std(data)}")
# print(f"Variance : {np.var(data)}")


# plt.figure()
# plt.subplot(3, 1, 1)
# plt.plot(samples)
# plt.xlabel("Samples")
# plt.ylabel("Data: AudioSegment")

# plt.subplot(3, 1, 2)
# plt.plot(samples_sf)
# plt.xlabel("Samples")
# plt.ylabel("Data: Soundfile")
# plt.subplot(3, 1, 3)
# plt.plot(data)
# plt.xlabel("Samples")
# plt.ylabel("dB Full Scale (dB)")
# plt.tight_layout()
# plt.show()
