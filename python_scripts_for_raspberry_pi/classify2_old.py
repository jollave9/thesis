# Copyright 2021 The TensorFlow Authors. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""Main scripts to run audio classification."""

import argparse
import time

from audio_classifier import AudioClassifier
from audio_classifier import AudioClassifierOptions
from utils import Plotter

from scipy.io.wavfile import write
import requests
import numpy as np
import json


def run(
    model: str,
    max_results: int,
    score_threshold: float,
    overlapping_factor: float,
    num_threads: int,
    enable_edgetpu: bool,
    seconds: int,
) -> None:
    """Continuously run inference on audio data acquired from the device.

    Args:
      model: Name of the TFLite audio classification model.
      max_results: Maximum number of classification results to display.
      score_threshold: The score threshold of classification results.
      overlapping_factor: Target overlapping between adjacent inferences.
      num_threads: Number of CPU threads to run the model.
      enable_edgetpu: Whether to run the model on EdgeTPU.
    """

    if (overlapping_factor <= 0) or (overlapping_factor >= 1.0):
        raise ValueError("Overlapping factor must be between 0 and 1.")

    if (score_threshold < 0) or (score_threshold > 1.0):
        raise ValueError("Score threshold must be between (inclusive) 0 and 1.")

    # Initialize the audio classification model.
    options = AudioClassifierOptions(
        num_threads=num_threads,
        max_results=max_results,
        score_threshold=score_threshold,
        enable_edgetpu=enable_edgetpu,
    )
    classifier = AudioClassifier(model, options)

    # Initialize the audio recorder and a tensor to store the audio input.
    audio_record = classifier.create_audio_record()
    tensor_audio = classifier.create_input_tensor_audio()

    # We'll try to run inference every interval_between_inference seconds.
    # This is usually half of the model's input length to create an overlapping
    # between incoming audio segments to improve classification accuracy.
    input_length_in_second = (
        float(len(tensor_audio.buffer)) / tensor_audio.format.sample_rate
    )
    interval_between_inference = input_length_in_second * (1 - overlapping_factor)
    pause_time = interval_between_inference * 0.1
    last_inference_time = time.time()

    # Initialize a plotter instance to display the classification results.
    plotter = Plotter()

    # Start audio recording in the background.
    audio_record.start_recording()
    start_time = time.time()
    # Loop until the user close the classification results plot.
    arr = []
    #audiobufferarr = []
    while True:
        # Wait until at least interval_between_inference seconds has passed since
        # the last inference.
        current_time = time.time()
        elapsed_time = current_time - start_time
        if elapsed_time > seconds:
            break
        now = time.time()
        diff = now - last_inference_time
        if diff < interval_between_inference:
            time.sleep(pause_time)
            continue
        last_inference_time = now

        #audiobufferarr.append(audio_record.getAudioBuffer())
        #a = audio_record.getAudioBuffer()
        # print(audiobufferarr)
        # Load the input audio and run classify.

        tensor_audio.load_from_audio_record(audio_record)
        categories = classifier.classify(tensor_audio)

        # Plot the classification results.
        # plotter.plot(categories)
        print(categories)
        arr.append(categories)
    audio_buffer = audio_record.getAudioBuffer2()
    audio_record.stop()
    #buffer2 = audio_record.buffer * 10000
    #f = np.asarray(buffer2,dtype=np.int16)
    #f1 = np.asarray(buffer2,dtype=np.int16)
    #f2 = np.append(f,f1,axis=1)
    #f3 = np.asarray(f2,dtype=np.int16)
    #narr = np.array(arr) * 10000
    #narr1 = np.asarray(arr,dtype=np.int16)
    #print(arr)
    #arr *= 10000
    #arr = np.asarray(arr,dtype=np.int16)
    #write("output.wav", 44100, arr)
    #lists = arr.tolist()
    #print(arr)
    #json_str = json.dumps(arr)
    #with open(f"n.json", "w") as outfile:
       #outfile.write(json_str)
    #audiofile = {"audio": open("output.wav", "rb")}
    #requests.post("httP://192.168.1.168:5000/", files=audiofile)
    obj = {'data':arr}
    requests.post("http://192.168.1.168:5000/categories",data=obj)
    #np.warnings.filterwarnings('ignore', category=np.VisibleDeprecationWarning)
    #audio_buffer = audio_record.getAudioBuffer()
    flat_list = []
    for sublist in audio_buffer:
        for item in sublist:
            flat_list.append(item)

    #print(np.array(flat_list2).astype(np.int16))
    #print(len(audiobufferarr[0][0]))
    #print(audiobufferarr)
    #print(flat_list)
    audiobuffernd = np.array(flat_list)
    #print(np.array(flat_list).flatten())
    #print(audiobuffernd.astype(np.int16))
    write('output.wav',16000,audiobuffernd)
    audiofile = {"audio": open("output.wav", "rb")}
    requests.post("httP://192.168.1.168:5000/", files=audiofile)
    #print(audiobuffernd)
    #print('len',len(audiobuffernd))
def main():
    parser = argparse.ArgumentParser(
        formatter_class=argparse.ArgumentDefaultsHelpFormatter
    )
    parser.add_argument(
        "--model",
        help="Name of the audio classification model.",
        required=False,
        default="yamnet.tflite",
    )
    parser.add_argument(
        "--maxResults",
        help="Maximum number of results to show.",
        required=False,
        default=5,
    )
    parser.add_argument(
        "--overlappingFactor",
        help="Target overlapping between adjacent inferences. Value must be in (0, 1)",
        required=False,
        default=0.5,
    )
    parser.add_argument(
        "--scoreThreshold",
        help="The score threshold of classification results.",
        required=False,
        default=0.0,
    )
    parser.add_argument(
        "--numThreads",
        help="Number of CPU threads to run the model.",
        required=False,
        default=4,
    )
    parser.add_argument(
        "--enableEdgeTPU",
        help="Whether to run the model on EdgeTPU.",
        action="store_true",
        required=False,
        default=False,
    )
    parser.add_argument(
        "-s","--seconds", help="duration, default = 5", required=True, default=5
    )
    args = parser.parse_args()

    run(
        args.model,
        int(args.maxResults),
        float(args.scoreThreshold),
        float(args.overlappingFactor),
        int(args.numThreads),
        bool(args.enableEdgeTPU),
        int(args.seconds),
    )


if __name__ == "__main__":
    main()
