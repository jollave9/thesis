import pyaudio
import wave
import requests
import time
import socket
import threading
import os

HEADER = 64
PORT = 5050
SERVER = socket.gethostbyname(socket.gethostname())
ADDR = (SERVER, PORT)
FORMAT = "utf-8"
DISCONNECT_MESSAGE = "!DISCONNECT"
server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server.bind(ADDR)


def record(seconds):
    # audio = pyaudio.PyAudio()
    # stream = audio.open(
    #     format=pyaudio.paInt16,
    #     channels=1,
    #     rate=44100,
    #     input=True,
    #     frames_per_buffer=1024,
    # )

    # start_time = time.time()
    # frames = []
    # print("recording...")
    # while True:
    #     current_time = time.time()
    #     elapsed_time = current_time - start_time
    #     data = stream.read(1024)
    #     frames.append(data)
    #     if elapsed_time > seconds:
    #         break

    # stream.stop_stream()
    # stream.close()
    # audio.terminate()

    # sound_file = wave.open("test.wav", "wb")
    # sound_file.setnchannels(1)
    # sound_file.setsampwidth(audio.get_sample_size(pyaudio.paInt16))
    # sound_file.setframerate(44100)
    # sound_file.writeframes(b"".join(frames))
    # sound_file.close()

    # audiofile = {"audio": open("test.wav", "rb")}

    os.system("arecord --device=hw:1,0 --format S16_LE --rate 44100 -c2 test.wav")
    audiofile = {"audio": open("test.wav", "rb")}
    print("finish recording")

    requests.post("httP://localhost:5000/", files=audiofile)


def handle_client(conn, addr):
    print(f"[NEW CONNECTION] {addr} connected.")

    connected = True
    while connected:
        msg_length = conn.recv(HEADER).decode(FORMAT)
        if msg_length:
            msg_length = int(msg_length)
            msg = conn.recv(msg_length).decode(FORMAT)
            if msg == DISCONNECT_MESSAGE:
                connected = False

            print(f"[{addr}] {msg}")
            conn.send("Msg received".encode(FORMAT))

            if msg != DISCONNECT_MESSAGE:
                record(int(msg))

    conn.close()


def start():
    server.listen()
    print(f"[LISTENING] Server is listening on {SERVER}")
    while True:
        conn, addr = server.accept()
        thread = threading.Thread(target=handle_client, args=(conn, addr))
        thread.start()
        print(f"[ACTIVE CONNECTIONS] {threading.active_count() - 1}")


print("[STARTING] server is starting...")
start()
