# weri weri weri WEEERI simpyl bakend
import os
from flask import Flask, render_template, request, redirect
import mysql.connector

app = Flask(__name__, template_folder="../front/templates", static_folder="../front/static")

db_config = {
    'user':     os.getenv('APP_DB_USER', 'testapp'),
    'password': os.getenv('APP_DB_PASSWORD', 'testapppasswd'),
    'host':     os.getenv('APP_DB_HOST', 'mysql-service'),
    'database': os.getenv('APP_DB_NAME', 'testappDB'),
    'port':     int(os.getenv('APP_DB_PORT', '3306')),
}


def get_db_connection():
    return mysql.connector.connect(**db_config)


@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        content = request.form['content']
        conn = get_db_connection()
        cursor = conn.cursor()
        _SQL = """INSERT INTO notes (content) VALUES (%s)"""
        cursor.execute(_SQL, (content,))
        conn.commit()
        cursor.close()
        conn.close()
        return redirect('/')
    else:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        _SQL = """SELECT * FROM notes 
                ORDER BY created_at DESC"""
        cursor.execute(_SQL)
        notes = cursor.fetchall()
        cursor.close()
        conn.close()
        return render_template('index.html', notes=notes)


if __name__ == '__main__':
    app.run(debug=False)
