# Feature-Sliced Design (FSD) Architecture

## Layers

- `app/`: App-wide settings, styles, providers
- `screens/`: Page components and routing
- `widgets/`: Complex UI components combining entities and features
- `features/`: User interactions, business logic
- `entities/`: Business domain objects
- `shared/`: Reusable utilities, UI components, configs

## Principles

- Strict unidirectional dependencies
- Maximum decoupling
- Clear code organization
