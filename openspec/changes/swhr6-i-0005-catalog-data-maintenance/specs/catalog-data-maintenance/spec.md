## ADDED Requirements

### Requirement: Initial seed content

ID: SWHR6-R-0002
Recovered from: DATA-BR-0005
The initial load SHALL create the sign-on users j2ee, j2ee-ja, shopper and j2ee-zh with matching customers, and the five categories FISH, DOGS, REPTILES, CATS and BIRDS each with English, Japanese and Chinese details.

#### Scenario: Initial load on an empty store

- **GIVEN** an empty store
- **WHEN** the initial load runs
- **THEN** the four users with matching customers and the five categories with details in three locales exist
