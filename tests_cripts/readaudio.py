from scipy.io.wavfile import read, write
import json

sample_rate, data = read("./public/recording_0.wav")
print(data[0])
# lists = data.tolist()
# lists = []
# for a in data:
#     lists.append(a)
# print(lists[1])
# json_str = json.dumps(lists)
# with open(f"n3.json", "w") as outfile:
#     outfile.write(json_str)
# print(type(data[0][0]))
