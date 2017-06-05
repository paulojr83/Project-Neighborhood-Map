from flask import Flask, render_template, request, jsonify, _app_ctx_stack
from sqlite3 import dbapi2 as sqlite3

DATABASE = 'neighborhood.db'
DEBUG = True
SECRET_KEY = 'some super secret development key'

app = Flask(__name__)
app.config.from_object(__name__)

def init_db():
    with app.app_context():
        db = get_db()
        with app.open_resource('schema.sql') as f:
            db.cursor().executescript(f.read())
        db.commit()

def get_db():
    top = _app_ctx_stack.top
    if not hasattr(top, 'sqlite_db'):
        top.sqlite_db = sqlite3.connect(app.config['DATABASE'])
        top.sqlite_db.row_factory = sqlite3.Row
    return top.sqlite_db

@app.teardown_appcontext
def close_database(exception):
    top = _app_ctx_stack.top
    if hasattr(top, 'sqlite_db'):
        top.sqlite_db.close()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/neighborhoods')
def neighborhoods():
    db = get_db()   
    cur = db.execute('select name, description, lat, lng from neighborhood order by id asc')
    entries = [dict(name=row[0], description=row[1], lat=row[2], lng=row[3]) for row in cur.fetchall()]
    print entries
    return jsonify(neighborhoods=entries)

@app.route('/neighborhood/new', methods=['POST'])
def new_neighborhood():
    db = get_db()
    cur = db.execute('insert into neighborhood (name, description, lat, lng) values (?, ?, ?, ?)',
               [request.json['name'], request.json['description'], request.json['lat'], request.json['lng']])
    db.commit()
    id = cur.lastrowid
    print id
    return jsonify({"name": request.json['name'],
                    "description": request.json['description'],
                    "lat": request.json['lat'],
                    "lng": request.json['lng'],
                    "id": id})

if __name__ == '__main__':
    init_db()
    app.run()
