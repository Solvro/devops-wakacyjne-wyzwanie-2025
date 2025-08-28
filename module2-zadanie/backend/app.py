from flask import Flask, request, jsonify
import os
import psycopg2

app = Flask(__name__)

DB_HOST = os.environ.get('DB_HOST', 'postgres-service')
DB_NAME = os.environ.get('DB_NAME', 'mydb')
DB_USER = os.environ.get('DB_USER', 'myuser')
DB_PASSWORD = os.environ.get('DB_PASSWORD', 'mypassword')

def get_conn():
    return psycopg2.connect(
        host=DB_HOST, 
        dbname=DB_NAME, 
        user=DB_USER,
        password=DB_PASSWORD
    )

@app.route('/')
def hello():
    return 'Backend OK\n'

@app.route('/api/add', methods=['POST'])
def add():
    data = request.get_json() or {}
    name = data.get('name', 'anon')
    
    conn = get_conn()
    cur = conn.cursor()
    try:
        cur.execute("INSERT INTO items(name) VALUES(%s) RETURNING id", (name,))
        id_ = cur.fetchone()[0]
        conn.commit()
        return jsonify({'id': id_, 'name': name})
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()
        conn.close()

@app.route('/api/list')
def list_items():
    conn = get_conn()
    cur = conn.cursor()
    try:
        cur.execute("SELECT id, name FROM items ORDER BY id")
        rows = cur.fetchall()
        return jsonify([{'id': r[0], 'name': r[1]} for r in rows])
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()
        conn.close()

if __name__ == '__main__':
    # Create table on start if not exists (simple migration)
    conn = get_conn()
    cur = conn.cursor()
    try:
        cur.execute('''
            CREATE TABLE IF NOT EXISTS items (
                id SERIAL PRIMARY KEY,
                name TEXT
            )
        ''')
        conn.commit()
    except Exception as e:
        print(f"Error creating table: {e}")
    finally:
        cur.close()
        conn.close()
    
    app.run(host='0.0.0.0', port=5000)