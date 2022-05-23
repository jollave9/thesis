import json
from scipy.io.wavfile import write
import numpy as np
import copy

with open("n4.json") as data:
    n = json.load(data)

# print(n)
# narr = np.asarray(n, dtype=np.int16)
# print(len(narr))
asdf = []
for x in n:
    for y in x:
        asdf.append(y)

asdf = np.array(asdf)
asdf *= 10000
narr = np.asarray(asdf, dtype=np.int16)
narr2 = np.asarray(asdf, dtype=np.int16)
narr3 = np.append(narr, narr2, axis=1)
print(len(narr3))

# write("output.wav", 44100, narr3)
