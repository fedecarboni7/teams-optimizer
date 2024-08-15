import re
import os
import google.generativeai as genai

genai.configure(api_key=os.environ["GEMINI_API_KEY"])

def generate_sql_query(description: str, db_structure: str) -> str:
    model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    system_instruction=f"Generate a SQL query for a SQLite database based on a natural language description and the following database structure: {db_structure}.",
    )

    chat_session = model.start_chat(history=[])

    response = chat_session.send_message(description)

    return response.text

def is_safe_query(query: str) -> bool:
    unsafe_patterns = [
        r'\bDROP\b',
        r'\bDELETE\b',
        r'\bTRUNCATE\b',
        r'\bALTER\b',
        r'\bCREATE\b',
        r'\bINSERT\b',
        r'\bUPDATE\b'
    ]
    return not any(re.search(pattern, query, re.IGNORECASE) for pattern in unsafe_patterns)