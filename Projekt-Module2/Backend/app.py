from flask import Flask, jsonify, request
import os
import mysql.connector
from flask_cors import CORS

app = Flask(__name__)

CORS(app, resources={r"/api/*": {"origins": "*"}})


MYSQL_HOST = os.environ.get("MYSQL_HOST", "mysql")
MYSQL_USER = os.environ.get("MYSQL_USER", "app")
MYSQL_PASSWORD = os.environ.get("MYSQL_PASSWORD", "apppass")
MYSQL_DATABASE = os.environ.get("MYSQL_DATABASE", "appdb")

def get_mysql_connection():
    return mysql.connector.connect(
        host=MYSQL_HOST,
        user=MYSQL_USER,
        password=MYSQL_PASSWORD,
        database=MYSQL_DATABASE
    )

def init_db():
    conn = mysql.connector.connect(
        host=MYSQL_HOST,
        user=MYSQL_USER,
        password=MYSQL_PASSWORD
    )
    try:
        cursor = conn.cursor()
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {MYSQL_DATABASE}")
        conn.commit()
    finally:
        cursor.close()
        conn.close()

    conn = get_mysql_connection()
    if conn is None:
        raise RuntimeError("Nie udało się połączyć z bazą danych!")
    try:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                text VARCHAR(255) NOT NULL
            )
        """)
        conn.commit()
    finally:
        cursor.close()
        conn.close()

@app.route("/", methods=["GET", "POST"])
def messages():
    if request.method == "GET":
        conn = get_mysql_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM messages")
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(rows)

    elif request.method == "POST":
        data = request.get_json()
        text = data.get("text", "")
        if not text:
            return jsonify({"error": "No text provided"}), 400

        conn = get_mysql_connection()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO messages (text) VALUES (%s)", (text,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"status": "ok"}), 201

if __name__ == "__main__":
    init_db()
    app.run(host="0.0.0.0", port=5000)
