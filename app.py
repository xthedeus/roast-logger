from flask import Flask
from flask import request
from flask import Response
from flask import json
from flask_cors import CORS

import threading
import sys
import trace
import time
from tinydb import TinyDB, Query, where

app = Flask(__name__)
CORS(app)

TinyDB.DEFAULT_TABLE_KWARGS = {'cache_size': 0}
db = TinyDB('db.json')


class thread_with_trace(threading.Thread):
    def __init__(self, *args, **keywords):
        threading.Thread.__init__(self, *args, **keywords)
        self.killed = False

    def start(self):
        self.__run_backup = self.run
        self.run = self.__run
        threading.Thread.start(self)

    def __run(self):
        sys.settrace(self.globaltrace)
        self.__run_backup()
        self.run = self.__run_backup

    def globaltrace(self, frame, event, arg):
        if event == 'call':
            return self.localtrace
        else:
            return None

    def localtrace(self, frame, event, arg):
        if self.killed:
            if event == 'line':
                raise SystemExit()
        return self.localtrace

    def kill(self):
        self.killed = True


def data_gather(log_id):
    timestep = 0
    while True:
        now = int(time.time())
        db.insert({'id': log_id, 'time': now, 'et': (
            timestep+10)*2, 'bt': (timestep+25)*2})
        timestep = timestep + 5
        time.sleep(5)


@app.route('/logs', methods=['POST'])
def log():
    if request.method == 'POST':
        global log_count
        global logging_entries
        log_count = log_count + 1
        x = thread_with_trace(target=data_gather, args=(log_count,))
        logging_entries.append({'log_id': log_count, 'thread': x})
        x.start()
        data = {'id': log_count}
        js = json.dumps(data)
        resp = Response(js, status=200, mimetype='application/json')
        return resp


@app.route('/logs/<id>', methods=['GET', 'POST'])
def log_id(id):
    if request.method == 'GET':
        data = db.search(where('id') == int(id))
        js = json.dumps(data)
        resp = Response(js, status=200, mimetype='application/json')
        return resp

    if request.method == 'POST':
        global logging_entries
        for logging_entry in logging_entries:
            if logging_entry['log_id'] == int(id):
                t = logging_entry['thread']
                t.kill()
        resp = Response({}, status=200, mimetype='application/json')
        return resp


if __name__ == '__main__':
    logs = db.all()
    global log_count
    global logging_entries
    log_count = 0
    logging_entries = []
    for log in logs:
        if log['id'] > log_count:
            log_count = log['id']
    app.run()
