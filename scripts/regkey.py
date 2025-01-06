import argparse
import random
import string
import psycopg2
import os
from psycopg2 import sql

def generate_registration_keys(conn, n_keys):
    cursor = conn.cursor()
    for _ in range(n_keys):
        # Generate a random string of fixed length
        key = ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))
        insert_sql = sql.SQL("""
            INSERT INTO registration_keys (key)
            VALUES (%s)
            RETURNING id
        """)
        cursor.execute(insert_sql, [key])
        print(f'New key created: {key}')
    conn.commit()
    cursor.close()

def assign_registration_keys(conn, n_keys):
    cursor = conn.cursor()
    for _ in range(n_keys):
        cursor.execute("SELECT id, key FROM registration_keys WHERE is_used = FALSE LIMIT 1")
        row = cursor.fetchone()
        if row:
            update_sql = sql.SQL("""
                UPDATE registration_keys
                SET is_used = TRUE
                WHERE id = %s
            """)
            cursor.execute(update_sql, [row[0]])
            print(f'Key assigned: {row[1]}')
        else:
            print('No unused keys found.')
            break
    conn.commit()
    cursor.close()

def list_registration_keys(conn):
    cursor = conn.cursor()
    cursor.execute("SELECT id, key FROM registration_keys WHERE is_used = FALSE")
    rows = cursor.fetchall()
    if rows:
        for row in rows:
            print(f'Unassigned key: {row[1]}')
    else:
        print('No unused keys found.')
    cursor.close()

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("operation", type=str, help="Operation to perform. 'add' to add keys, 'assign' to mark keys as assigned, 'list' to list unassigned keys.")
    parser.add_argument("num", type=int, nargs='?', default=1, help="Number of keys to add or retrieve. Defaults to 1.")
    parser.add_argument("-U", "--username", type=str, help="Database username. Overrides the 'TWENTYPLOTS_PG_USERNAME' environment variable if provided.")
    parser.add_argument("-P", "--password", type=str, help="Database password. Overrides the 'TWENTYPLOTS_PG_PASSWORD' environment variable if provided.")
    
    args = parser.parse_args()
    
    username = args.username if args.username else os.getenv("TWENTYPLOTS_PG_USERNAME")
    password = args.password if args.password else os.getenv("TWENTYPLOTS_PG_PASSWORD")

    if not username or not password:
        print("Database username and password must be provided either as arguments or environment variables.")
        return

    conn = psycopg2.connect(dbname="twentyplotsdb", user=username, password=password)

    if args.operation == 'add':
        generate_registration_keys(conn, args.num)
    elif args.operation == 'assign':
        assign_registration_keys(conn, args.num)
    elif args.operation == 'list':
        list_registration_keys(conn)
    else:
        print(f"Invalid operation: {args.operation}. Only 'add', 'assign', and 'list' are supported.")
    
    conn.close()

if __name__ == "__main__":
    main()
