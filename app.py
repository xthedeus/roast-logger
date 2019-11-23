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


class Log:
    def __init__(self, temp, time, log_id):
        self.temp = temp
        self.time = time
        self.id = log_id

    def to_JSON(self):
        return json.loads(json.dumps(self, default=lambda o: o.__dict__))


@app.route('/roasts', methods=['POST'])
def create_log():
    global log_count
    if request.method == 'POST':
        if(request.is_json):
            log_count = log_count + 1
            log_id = log_count
            logs = [Log(x["temp"], x["time"], log_id)
                    for x in request.get_json()]
            for val in logs:
                db.insert(val.to_JSON())
        resp = Response({}, status=200, mimetype='application/json')
        return resp


@app.route('/roasts/<id>', methods=['GET'])
def get_log_by_id(id):
    if request.method == 'GET':
        data = db.search(where('id') == int(id))
        js = json.dumps(data)
        resp = Response(js, status=200, mimetype='application/json')
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
    app.run(host='0.0.0.0')
