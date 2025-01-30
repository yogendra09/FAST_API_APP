import psycopg2
from psycopg2.extras import RealDictCursor
from fastapi import HTTPException
DATABASE_URL = "postgresql://postgres:1234@localhost:5432/my_db"

def init_connect():
    connection = psycopg2.connect(DATABASE_URL)
    return connection

def close_connection(connection):
    connection.close()

def execute_query(query, values):
    connection = init_connect()
    cursor = connection.cursor(cursor_factory=RealDictCursor)
    try:
        cursor.execute(query, values)
        result = cursor.fetchall()
        connection.commit()
    except Exception as e:
        print(str(e),'db exception')
        raise HTTPException(status_code=500, detail=f"Error executing query: {str(e)}")
    finally: 
        cursor.close()
        close_connection(connection)
    return result



def execute_query_many(query, values):
    # global connection
    connection = init_connect()
    cursor = connection.cursor(cursor_factory=RealDictCursor)
    try:
        for record in values:
            cursor.execute(query, record)
        result = cursor.fetchall()
        connection.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error executing query: {str(e)}")
    finally:
        cursor.close()
        close_connection(connection)

    return result