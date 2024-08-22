import re


def validate_username(username: str):
    if len(username) < 3 or len(username) > 30:
        raise ValueError("El nombre de usuario debe tener entre 3 y 30 caracteres.")
    if not re.match(r'^[\w.]+$', username):
        raise ValueError("El nombre de usuario solo puede contener letras, números, guiones bajos y puntos.")

def validate_password(password: str):
    if len(password) < 8 or len(password) > 30:
        raise ValueError("La contraseña debe tener al menos 8 caracteres.")
    if not re.search(r"[A-Z]", password):
        raise ValueError("La contraseña debe contener al menos una letra mayúscula.")
    if not re.search(r"[a-z]", password):
        raise ValueError("La contraseña debe contener al menos una letra minúscula.")
    if not re.search(r"[0-9]", password):
        raise ValueError("La contraseña debe contener al menos un número.")
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        raise ValueError("La contraseña debe contener al menos un carácter especial.")
    if re.search(r"(.)\1\1\1", password):
        raise ValueError("La contraseña no debe contener más de tres caracteres repetidos consecutivos.")
    if re.search(r"(012|123|234|345|456|567|678|789|890|qwerty|asdf)", password.lower()):
        raise ValueError("La contraseña no debe contener secuencias de números o teclas comunes.")

    common_passwords = ["123456", "password", "12345678", "qwerty", "abc123"]
    if password.lower() in common_passwords:
        raise ValueError("La contraseña es demasiado común. Por favor, elija una diferente.")
