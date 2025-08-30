# HealthCare AI - Preventive Health Platform

## Overview

HealthCare AI is a full-stack web application focused on preventive healthcare and wellness tracking, supporting UN Sustainable Development Goal 3 (Good Health and Well-being). The platform provides personalized health insights through AI-powered recommendations, lifestyle tracking, location-based health alerts, and an interactive health assistant chatbot.

The application serves as a comprehensive health companion that helps users maintain healthy lifestyles through data-driven insights and preventive care recommendations. Users can track daily health metrics, receive personalized tips based on their profile and habits, monitor location-specific health risks, and interact with an AI assistant for health-related questions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Template Engine**: Jinja2 templates with Bootstrap 5 for responsive UI
- **Styling Framework**: Bootstrap 5 with custom CSS variables and medical-themed color scheme
- **JavaScript Libraries**: Chart.js for data visualizations, vanilla JavaScript for interactivity
- **Layout Structure**: Base template with modular components and consistent navigation

### Backend Architecture
- **Web Framework**: Flask with session-based authentication
- **Data Storage**: In-memory dictionaries for MVP (users, lifestyle_logs, user_profiles)
- **Service Layer**: Modular services for AI interactions (HealthAI) and weather data (WeatherService)
- **Route Structure**: RESTful endpoints with clear separation of concerns

### AI Integration Architecture
- **Primary AI Provider**: OpenAI GPT-5 for personalized health recommendations and chatbot responses
- **Fallback System**: Static recommendations when AI services are unavailable
- **Context Building**: User profile and lifestyle data aggregation for personalized responses
- **Response Formatting**: JSON-structured responses for consistent data handling

### Authentication System
- **Session Management**: Flask sessions with secure secret key
- **Password Security**: Werkzeug password hashing for secure credential storage
- **User Registration**: Multi-step profile creation including personal and lifestyle information
- **Access Control**: Route-level authentication checks for protected endpoints

### Data Models
- **User Model**: Basic user information and authentication data
- **UserProfile Model**: Detailed health and lifestyle information
- **LifestyleLog Model**: Daily tracking entries for health metrics
- **In-Memory Storage**: Dictionary-based storage for rapid prototyping

### API Design Patterns
- **Service Layer Pattern**: Separate services for external API integrations
- **Template View Pattern**: Server-side rendering with Jinja2 templates
- **Error Handling**: Graceful degradation with fallback data when external services fail
- **Logging**: Comprehensive logging for debugging and monitoring

## External Dependencies

### AI Services
- **OpenAI API**: GPT-5 model for generating personalized health tips and chatbot responses
- **Environment Variable**: OPENAI_API_KEY required for AI functionality
- **Fallback Strategy**: Static responses when API is unavailable

### Weather Services
- **OpenWeatherMap API**: Current weather data for location-based health alerts
- **Environment Variable**: WEATHER_API_KEY required for weather functionality
- **Data Processing**: Weather conditions translated into health recommendations

### Frontend Dependencies
- **Bootstrap 5**: UI framework via CDN for responsive design
- **Font Awesome 6.4.0**: Icon library for consistent visual elements
- **Chart.js**: Data visualization library for health metrics charts
- **Custom Styling**: Medical-themed CSS with health-focused color variables

### Session Management
- **Flask Sessions**: Server-side session storage with configurable secret key
- **Environment Variable**: SESSION_SECRET for secure session management
- **Default Fallback**: Hardcoded secret key for development environments

### Development Tools
- **Flask Debug Mode**: Enabled for development with hot reloading
- **Logging**: Python logging module with DEBUG level for comprehensive monitoring
- **Static File Serving**: Flask static file handling for CSS/JS assets