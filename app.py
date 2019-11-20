from flask import Flask
from flask import request
from flask import Response
from flask import json
from flask_cors import CORS

import threading
import sys
import trace
import time
import random

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
    # data_gather will run for 30 minutes max
    last_bt = 0
    last_et = 0
    while timestep <= 1800:
        now = int(time.time())
        last_bt = last_bt + random.randint(0, 5)
        last_et = last_et + random.randint(0, 3)
        db.insert({'id': log_id, 'time': now, 'et': last_et, 'bt': last_bt})
        timestep = timestep + 5
        time.sleep(5)
    # remove logging_entries that is still existing
    logging_entry = get_logging_entry(log_id)
    if logging_entry is not None:
        remove_logging_entry(log_id)


@app.route('/status', methods=['GET'])
def get_status():
    data = {'status': True}
    js = json.dumps(data)
    resp = Response(js, status=200, mimetype='application/json')
    return resp


@app.route('/logs', methods=['POST'])
def start_log():
    if request.method == 'POST':
        global log_count
        log_count = log_count + 1
        start_logging(log_count)
        data = {'id': log_count}
        js = json.dumps(data)
        resp = Response(js, status=200, mimetype='application/json')
        return resp


@app.route('/logs/<id>/stop', methods=['POST'])
def stop_log_by_id(id):
    if request.method == 'POST':
        id = int(id)
        logging_entry = get_logging_entry(id)
        if logging_entry is not None:
            t = logging_entry['thread']
            t.kill()
            remove_logging_entry(id)
            resp = Response({}, status=200, mimetype='application/json')
            return resp
        else:
            resp = Response({}, status=400, mimetype='application/json')
            return resp


@app.route('/logs/<id>/resume', methods=['POST'])
def resume_log_by_id(id):
    if request.method == 'POST':
        id = int(id)
        logging_entry = get_logging_entry(id)
        if logging_entry is None:
            start_logging(id)
            resp = Response({}, status=200, mimetype='application/json')
            return resp
        else:
            return Response({}, status=400, mimetype='application/json')


@app.route('/logs/<id>', methods=['GET'])
def get_log_by_id(id):
    if request.method == 'GET':
        data = db.search(where('id') == int(id))
        js = json.dumps(data)
        resp = Response(js, status=200, mimetype='application/json')
        return resp


def start_logging(log_id):
    global logging_entries
    x = thread_with_trace(target=data_gather, args=(log_id,))
    logging_entries.append({'log_id': log_id, 'thread': x})
    x.start()


def remove_logging_entry(log_id):
    global logging_entries
    for logging_entry in logging_entries:
        if logging_entry['log_id'] == int(log_id):
            logging_entries.remove(logging_entry)


def get_logging_entry(log_id):
    global logging_entries
    for logging_entry in logging_entries:
        if logging_entry['log_id'] == int(log_id):
            return logging_entry
    return None


if __name__ == '__main__':
    logs = db.all()
    global log_count
    global logging_entries
    log_count = 0
    logging_entries = []
    for log in logs:
        if log['id'] > log_count:
            log_count = log['id']
    app.run(host='0.0.0.0')
