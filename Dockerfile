# Use an official Python runtime as a base image
FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements.txt file and install the dependencies
COPY requirements.txt ./
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy the rest of the application's code
COPY . .

# Expose the port that the application will run on
EXPOSE 8080

# Set the default command to run the Flask application using Gunicorn
CMD ["gunicorn", "-b", "0.0.0.0:8080", "flask_app_celtics:app"]
