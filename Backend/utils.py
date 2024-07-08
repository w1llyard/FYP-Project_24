import constant

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in constant.ALLOWED_EXTENSIONS