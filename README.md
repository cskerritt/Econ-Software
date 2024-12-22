# Economic Analysis Calculator

A web application for calculating economic damages, including pre-injury and post-injury earnings analysis.

## Features

- Personal information management
- Pre-injury earnings calculations
- Post-injury earnings calculations
- Growth rate and adjustment factor support
- Automatic age and date calculations
- Detailed results view with multiple exhibits

## Technology Stack

### Backend
- Django 5.0
- Django REST Framework
- SQLite database
- Python 3.11+

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios

## Setup Instructions

### Backend Setup

1. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run migrations:
   ```bash
   python manage.py migrate
   ```

4. Create a superuser:
   ```bash
   python manage.py createsuperuser
   ```

5. Start the Django development server:
   ```bash
   python manage.py runserver 8001
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

1. Access the application at http://localhost:5173
2. Create a new analysis by clicking "Start New Analysis"
3. Fill in the required information:
   - Personal Information
   - Life and Work Parameters
   - Growth Rates and Adjustment Factors
4. Submit the form to view the results
5. Review the pre-injury and post-injury calculations

## Development

### Backend Development

- Models are in `calculator/models.py`
- API views are in `calculator/views.py`
- Serializers are in `calculator/serializers.py`
- URLs are configured in `calculator/urls.py`

### Frontend Development

- Components are in `frontend/src/components/`
- Pages are in `frontend/src/pages/`
- Types are in `frontend/src/types/`
- API services are in `frontend/src/services/`

## API Endpoints

- `POST /api/analyses/`: Create a new analysis
- `GET /api/analyses/{id}/`: Get analysis details
- `PUT /api/analyses/{id}/`: Update an analysis
- `DELETE /api/analyses/{id}/`: Delete an analysis
- `GET /api/analyses/{id}/calculate/`: Get calculation results

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.