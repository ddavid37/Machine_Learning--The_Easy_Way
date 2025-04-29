run:
	python3 app.py

install:
	pip install -r requirements.txt

clean:
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -exec rm -r {} +
