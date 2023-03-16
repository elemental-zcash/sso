from flask import Blueprint

bp = Blueprint('home', __name__)

@bp.route('/')
# @require_oauth(optional=True)
def home():
    return 'Hello World!'
