# Copyright 2022 The TensorFlow Authors. All Rights Reserved.
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
"""A module to record audio in a streaming basis."""
import threading
import numpy as np
import sounddevice as sd


class AudioRecord(object):
  """A class to record audio in a streaming basis."""

  def __init__(self, channels, sampling_rate: int) -> None:
    self._lock = threading.Lock()
    self._audio_buffer = []
    self.audio_buffer2 = []
    self.decibel_levels = {
        "soft":0,
        "moderate":0,
        "loud":0,
        "very_loud":0
        }
    #print(channels)
    #print(sampling_rate)
    def convert_to_decibel(arr):
      ref = 1
      if arr != 0:
          return 20 * np.log10(abs(arr) / ref)
      else:
          return -60

    def audio_callback(indata, *_):
      """A callback to receive recorded audio data from sounddevice."""
      self._lock.acquire()
      self._audio_buffer.append(np.copy(indata))
      self.audio_buffer2.append(np.copy(indata))
      if len(indata) > 0:
        t = convert_to_decibel(indata[0])
        #print(t)
        if t>-4:
          self.decibel_levels["very_loud"]+=1
        elif t >-20:
          self.decibel_levels["loud"]+=1
        elif t >-30:
          self.decibel_levels["moderate"]+=1
        else:
          self.decibel_levels["soft"]+=1
      self._lock.release()
      
    # Create an input stream to continuously capture the audio data.
    self._stream = sd.InputStream(
        channels=channels,
        samplerate=sampling_rate,
        callback=audio_callback,
    )

  def start_recording(self) -> None:
    """Start the audio recording."""
    self._stream.start()

  def stop(self) -> None:
    """Stop the audio recording."""
    self._audio_buffer = []
    self.audio_buffer2 = []
    self._stream.stop()

  @property
  def buffer(self) -> np.ndarray:
    """The audio data captured in the buffer.

    The buffer is cleared immediately after being read.
    """
    self._lock.acquire()
    if self._audio_buffer:
      result = np.concatenate(self._audio_buffer)
      self._audio_buffer.clear()
    else:
      result = np.zeros((0, 1))
    self._lock.release()

    return result

  def getAudioBuffer2(self):
    return self.audio_buffer2

  def getDecibelLevels(self):
    return self.decibel_levels
