import logging

def setup_logging():
    logging.basicConfig(level=logging.INFO, format='%(levelname)s:     %(message)s')
    #logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)