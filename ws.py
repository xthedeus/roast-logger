from flask import Flask, render_template, session, request, \
    copy_current_request_context, json
from flask_socketio import SocketIO, emit, join_room, leave_room, \
    close_room, rooms, disconnect

from threading import Lock

import board
import busio
import digitalio
import adafruit_max31855

import threading
import time
import sys
import trace

from tinydb import TinyDB, Query, where

spi = busio.SPI(board.SCK, MOSI=board.MOSI, MISO=board.MISO)
cs = digitalio.DigitalInOut(board.D5)
max31855 = adafruit_max31855.MAX31855(spi, cs)

TinyDB.DEFAULT_TABLE_KWARGS = {'cache_size': 0}
db = TinyDB('db.json')

async_mode = "eventlet"

app = Flask(__name__)
socketio = SocketIO(app, async_mode=async_mode, cors_allowed_origins='*')

thread = None
thread_lock = Lock()


class Log:
    def __init__(self, temp, time, log_id):
        self.temp = temp
        self.time = time
        self.id = log_id

    def to_JSON(self):
        return json.loads(json.dumps(self, default=lambda o: o.__dict__))


def get_temp():
    temp = None
    while temp is None:
        try:
            t = max31855.temperature
            if t is not None:
                temp = t
                return temp
        except Exception as err:
            socketio.emit('exception', {
                          'data': {'method': 'get_temp', 'time': now, 'exception': str(err)}})
            print(f"Exception: {err}")
            socketio.sleep(0.1)


def background_task():
    while True:
        try:
            temp = get_temp()
            now = int(time.time())
            if temp is not None:
                socketio.emit(
                    'new-temp', {'data': {'time': now, 'temp': temp}})
        except Exception as err:
            socketio.emit('exception', {
                          'data': {'method': 'background_task', 'time': now, 'exception': str(err)}})
            print(f"Exception: {err}")
        socketio.sleep(2)


@socketio.on('create-logs')
def create_logs(data):
    logs = db.all()
    log_count = 0
    for log in logs:
        if log['id'] > log_count:
            log_count = log['id']
    js = json.loads(data)
    log_count = log_count + 1
    log_id = log_count
    logs = [Log(x["temp"], x["time"], log_id) for x in js]
    for val in logs:
        db.insert(val.to_JSON())
    socketio.emit('log-created', {'log_id': log_id})
    all_logs = db.all()
    socketio.emit('all-logs', {'logs': all_logs})


@socketio.on('connect')
def connect():
    global thread
    print('client connected')
    with thread_lock:
        if thread is None:
            thread = socketio.start_background_task(background_task)
    logs = db.all()
    socketio.emit('all-logs', {'logs': logs})


@socketio.on('disconnect')
def disconnect():
    print('client disconnected')


if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000)
