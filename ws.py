import asyncio
import socketio
from aiohttp import web

import board
import busio
import digitalio
import adafruit_max31855

import threading
import time

from flask import Flask
from flask import request
from flask import Response
from flask import json
from flask_cors import CORS

spi = busio.SPI(board.SCK, MOSI=board.MOSI, MISO=board.MISO)
cs = digitalio.DigitalInOut(board.D5)
max31855 = adafruit_max31855.MAX31855(spi, cs)


sio = socketio.AsyncServer(async_mode='aiohttp', cors_allowed_origins='*')
app = web.Application()
sio.attach(app)

# max31855.temperature


async def background_task():
    while True:
        try:
            temp = max31855.temperature
            now = int(time.time())
            if temp is not None:
                await sio.emit('new-temp', {'data': {'time': now, 'temp': temp}})
        except Exception as err:
            await sio.emit('exception', {'data': {'method': 'background_task', 'time': now, 'exception': err}})
            print(f"Exception: {err}")
        await sio.sleep(2)


@sio.event
async def my_event(sid, data):
    pass


@sio.on('test')
async def another_event(sid, data):
    pass


@sio.event
async def connect(sid, environ):
    print('connect ', sid)


@sio.event
def disconnect(sid):
    print('disconnect ', sid)


if __name__ == '__main__':
    sio.start_background_task(background_task)
    web.run_app(app)
    #input("Press Enter to stop the socket...")
