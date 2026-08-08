import os

class Path:
    def __init__(self, *paths):
        self.path = os.path.join(*paths)

    def is_file(self):
        return os.path.isfile(self.path)

    def read_text(self, encoding='utf-8'):
        with open(self.path, 'r', encoding=encoding) as f:
            return f.read()
