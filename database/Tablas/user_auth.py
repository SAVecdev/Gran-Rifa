import bcrypt
from flask import g
from ..config import get_db

def verify_user(email, password):
    """
    Verifies a user's credentials against the database.

    Args:
        email (str): The user's email address.
        password (str): The user's provided password.

    Returns:
        dict or None: Returns a dictionary containing the user information
                       if credentials are valid, otherwise None.

    Raises:
        Exception: If an unexpected error occurs during database interaction.
    """

    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)

        # Execute query with parameterized placeholder to prevent SQL injection
        query = "SELECT * FROM users WHERE email = %s"
        cursor.execute(query, (email,))

        user = cursor.fetchone()
        cursor.close()

        if user and bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
            return user
        else:
            return None

    except Exception as e:
        # Log or handle the exception appropriately for security and debugging
        print(f"An error occurred while verifying user: {e}")
        raise  # Re-raise to allow the calling code to handle the error

